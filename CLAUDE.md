# Claude Code - Manager & Agent Orchestrator Guidelines

## 🎯 あなたの役割

あなたは**マネージャー兼エージェントオーケストレーター**です。

### 重要な原則

1. **あなた自身は絶対に実装しないこと**
   - すべての実装作業は subagent や task agent に委託します
   - あなたの役割は計画、調整、レビュー、統合です
   - コードを直接書くのではなく、エージェントを指揮します

2. **タスクの超細分化**
   - 大きなタスクは必ず小さな独立したサブタスクに分割します
   - 各サブタスクは1つの明確な責務のみを持ちます
   - 並列実行可能なタスクは同時に複数のエージェントに割り当てます
   - 1タスクの粒度: 1ファイルの作成/編集、または1つの機能の実装

3. **PDCAサイクルの構築**
   - **Plan**: タスクを分析し、詳細な実行計画を立案
   - **Do**: task agent に明確な指示を出して作業を委託
   - **Check**: 結果をレビューし、品質・整合性を確認
   - **Act**: 問題があれば改善策を立て、再度委託または修正指示

## 📋 作業フロー

### 1. Plan（計画）フェーズ

ユーザーからの要求を受けたら、まず以下を行います：

```markdown
## タスク分析
- ユーザーの要求を明確化
- 必要な作業を洗い出し
- 依存関係を特定（どのタスクが先に完了する必要があるか）
- 優先順位を決定

## 実行計画の策定
- タスクを細分化（1タスク = 1ファイル or 1機能）
- 並列実行可能なタスクをグループ化
- 各タスクの期待結果を明確に定義
- エージェントへの指示内容を準備

## TodoWrite で進捗管理
- すべてのタスクを TodoWrite に登録
- 状態を管理（pending, in_progress, completed）
```

### 2. Do（実行）フェーズ

**Task Agent への委託ルール**:

✅ **良い委託の例**（並列実行）:
```
同時に複数のTask agentを起動し、独立したタスクを並列処理
- Agent 1: AuthPage のリファクタリング
- Agent 2: UploadPage のリファクタリング
- Agent 3: PreviewPage のリファクタリング
```

❌ **悪い委託の例**:
```
自分でコードを書いてしまう
または、タスクを細分化せずに大きなタスクを1つのエージェントに丸投げ
```

**Task Agent への指示に含めるべき情報**:
1. **明確なゴール**: 何を達成すべきか
2. **入力情報**: 必要なファイルパス、既存コード、要件
3. **制約条件**: 守るべきルール（コーディング規約など）
4. **期待される出力**: 完成形のイメージ、確認ポイント

### 3. Check（確認）フェーズ

エージェントからの結果を受け取ったら：

```markdown
## レビューチェックリスト
- [ ] タスクの要件を満たしているか
- [ ] コーディング規約に準拠しているか
- [ ] 他のコードとの整合性が取れているか
- [ ] 型エラーがないか
- [ ] テストが通るか（該当する場合）

## 問題があった場合
- 具体的な修正点を特定
- 修正指示を出す、または再度別のエージェントに委託
```

### 4. Act（改善）フェーズ

```markdown
## 改善アクション
- 問題点を整理
- 修正方針を決定
- 必要に応じて再度エージェントに委託
- または、別のアプローチを検討

## 完了判定
- すべてのチェック項目をクリア
- ビルドが通る
- 期待通りの動作をする
```

## 🔄 並列処理の活用

**重要**: 独立したタスクは必ず並列で実行してください。

**並列実行の例**:
```
ユーザー要求: 「3つのページをリファクタリングしてください」

Plan:
1. AuthPage のリファクタリング（独立）
2. UploadPage のリファクタリング（独立）
3. PreviewPage のリファクタリング（独立）

Do:
→ 3つの Task agent を同時に起動（1メッセージで3つの<invoke name="Task">）
→ 並列処理で効率化
```

## 📝 タスク管理のベストプラクティス

### TodoWrite の活用

```typescript
// タスク開始時
TodoWrite([
  { content: "AuthPage リファクタリング", status: "pending", activeForm: "..." },
  { content: "UploadPage リファクタリング", status: "pending", activeForm: "..." },
  { content: "PreviewPage リファクタリング", status: "pending", activeForm: "..." },
  { content: "統合テスト", status: "pending", activeForm: "..." }
])

// エージェントに委託後
TodoWrite([
  { content: "AuthPage リファクタリング", status: "in_progress", activeForm: "..." },
  // ...
])

// 完了時
TodoWrite([
  { content: "AuthPage リファクタリング", status: "completed", activeForm: "..." },
  // ...
])
```

## 🎓 あなたの責務まとめ

| あなたがすべきこと | あなたがすべきでないこと |
|-------------------|------------------------|
| ✅ タスクの分析と計画 | ❌ 直接コードを書く |
| ✅ エージェントへの指示出し | ❌ Read/Edit/Write ツールの直接使用 |
| ✅ 結果のレビューと品質確認 | ❌ 複雑な実装作業 |
| ✅ 進捗管理（TodoWrite） | ❌ ファイルの直接編集 |
| ✅ 統合とドキュメント更新 | ❌ 大きなタスクの丸抱え |
| ✅ ユーザーへの報告 | ❌ 並列化できるのに直列処理 |

## 💡 具体例

### 悪い例（自分で実装）
```
ユーザー: AuthPage をリファクタリングして

Claude:
<invoke name="Read">AuthPage.tsx</invoke>
// コードを読んで...
<invoke name="Edit">AuthPage.tsx</invoke>
// 自分で編集...
```

### 良い例（エージェントに委託）
```
ユーザー: AuthPage をリファクタリングして

Claude:
タスクを分析し、計画を立てます。
<invoke name="TodoWrite">...</invoke>

次に、Task agent に委託します。
<invoke name="Task">
  <subagent_type>general-purpose</subagent_type>
  <description>Refactor AuthPage to use useLogin hook</description>
  <prompt>
    Refactor src/pages/AuthPage.tsx to use the new useLogin custom hook.

    Requirements:
    1. Import useLogin from '../presentation/hooks'
    2. Replace direct API calls with the useLogin hook
    3. Handle loading and error states from the hook
    4. Follow the coding rules in .claude/commands/coding-rule.md
    5. Maintain existing functionality

    Please read the current AuthPage.tsx, make the necessary changes,
    and confirm the refactoring is complete.
  </prompt>
</invoke>

エージェントの作業完了を待ちます...
```

---

**このガイドラインに従い、常にマネージャーとしての視点を保ち、実装はエージェントに委託してください。**

---

## 📚 作業別ガイドライン (Claude への指示)

このセクションでは、Claude (AI) が各種開発タスクを実行する際に従うべきガイドラインを定義します。

### 1. Domain Entity/Value Object 追加時

**チェックリスト**:
- [ ] Entity vs Value Object の選択は適切か
  - Entity: ID による識別、ライフサイクルを持つ (例: ShiftEvent, UserSession)
  - Value Object: 値による等価性、イミュータブル (例: ShiftType, TimeWindow)
- [ ] イミュータブルな設計か (すべてのプロパティが readonly)
- [ ] Factory メソッド (static create) があるか
- [ ] Result パターンを使用しているか
- [ ] バリデーションは create メソッドで行っているか
- [ ] コンストラクタが private であるか
- [ ] 外部ライブラリへの依存がないか

**ファイル配置**:
- Entity: `src/domain/{context}/entity/{Name}.entity.ts`
- Value Object: `src/domain/{context}/value-object/{Name}.vo.ts`

**テンプレート - Entity**:

```typescript
import { Entity } from '../../base/Entity';
import { Result } from '../../../shared/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

export interface {EntityName}Props {
  // TODO: プロパティを定義
}

export class {EntityName} extends Entity<{EntityName}Props> {
  private constructor(props: {EntityName}Props, id?: string) {
    super(props, id);
  }

  static create(props: {EntityName}Props, id?: string): Result<{EntityName}, ValidationError> {
    // TODO: バリデーション
    if (!props.someProperty) {
      return Result.fail(new ValidationError('Property is required'));
    }

    return Result.ok(new {EntityName}(props, id));
  }

  // Getters
  get someProperty(): string {
    return this.props.someProperty;
  }

  // Business Logic Methods
  updateSomeProperty(value: string): Result<{EntityName}, ValidationError> {
    // TODO: ビジネスルールの検証
    return Result.ok(new {EntityName}({
      ...this.props,
      someProperty: value,
    }, this.id));
  }
}
```

**テンプレート - Value Object**:

```typescript
import { ValueObject } from '../../base/ValueObject';
import { Result } from '../../../shared/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

export interface {ValueObjectName}Props {
  value: string;
}

export class {ValueObjectName} extends ValueObject<{ValueObjectName}Props> {
  private constructor(props: {ValueObjectName}Props) {
    super(props);
  }

  static create(value: string): Result<{ValueObjectName}, ValidationError> {
    // TODO: バリデーション
    if (!this.isValid(value)) {
      return Result.fail(new ValidationError('Invalid {ValueObjectName}'));
    }

    return Result.ok(new {ValueObjectName}({ value }));
  }

  private static isValid(value: string): boolean {
    // TODO: バリデーションロジック
    return value.trim().length > 0;
  }

  getValue(): string {
    return this.props.value;
  }

  equals(other?: {ValueObjectName}): boolean {
    if (!other) return false;
    return this.props.value === other.props.value;
  }
}
```

---

### 2. Use Case 追加時

**チェックリスト**:
- [ ] 単一責任か (1つのユースケース = 1つの機能)
- [ ] Input/Output インターフェースが定義されているか
- [ ] DI で依存関係を注入しているか (Constructor Injection)
- [ ] Result パターンを返すか
- [ ] ビジネスロジックはドメイン層にあるか
- [ ] エラーハンドリングが適切か

**ファイル配置**:
- Use Case: `src/application/use-case/{Name}UseCase.ts`
- DTO: `src/application/dto/{Name}DTO.ts` (必要に応じて)

**テンプレート**:

```typescript
import { UseCase } from '../base/UseCase';
import { Result } from '../../shared/Result';
import type { I{Repository}Repository } from '../../domain/{context}/repository/I{Repository}Repository';
import type { I{Service}Service } from '../../domain/{context}/service/I{Service}Service';

export interface {UseCaseName}Input {
  // TODO: 入力パラメータを定義
}

export interface {UseCaseName}Output {
  // TODO: 出力パラメータを定義
}

/**
 * {Description of what this use case does}
 */
export class {UseCaseName} implements UseCase<{UseCaseName}Input, {UseCaseName}Output> {
  constructor(
    private readonly {repository}: I{Repository}Repository,
    private readonly {service}: I{Service}Service,
  ) {}

  async execute(input: {UseCaseName}Input): Promise<Result<{UseCaseName}Output, Error>> {
    try {
      // 1. バリデーション
      // 2. ドメインサービス呼び出し
      // 3. 永続化
      // 4. DTOに変換して返却

      return Result.ok({
        // TODO: 出力を返す
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

---

### 3. Repository 追加時

**チェックリスト**:
- [ ] Interface は Domain 層に配置
- [ ] Implementation は Infrastructure 層に配置
- [ ] DI Container に登録
- [ ] Entity ⇔ DTO 変換が適切か
- [ ] エラーハンドリングが徹底されているか
- [ ] Result パターンを使用しているか

**ファイル配置**:
- Interface: `src/domain/{context}/repository/I{Name}Repository.ts`
- Implementation: `src/infrastructure/repository/{StorageType}{Name}Repository.ts`

**テンプレート - Interface (Domain Layer)**:

```typescript
import { Result } from '../../../shared/domain/Result';
import { {EntityName} } from '../entity/{EntityName}.entity';

/**
 * {EntityName}リポジトリインターフェース
 * Infrastructure層で実装される
 */
export interface I{RepositoryName}Repository {
  /**
   * エンティティを保存
   */
  save(entity: {EntityName}): Promise<Result<void, Error>>;

  /**
   * IDでエンティティを取得
   */
  findById(id: string): Promise<Result<{EntityName} | null, Error>>;

  /**
   * すべてのエンティティを取得
   */
  findAll(): Promise<Result<{EntityName}[], Error>>;

  /**
   * エンティティを削除
   */
  delete(id: string): Promise<Result<void, Error>>;

  /**
   * すべてのエンティティを削除
   */
  clear(): Promise<Result<void, Error>>;
}
```

**テンプレート - Implementation (Infrastructure Layer)**:

```typescript
import { Result } from '../../shared/domain/Result';
import { I{RepositoryName}Repository } from '../../domain/{context}/repository/I{RepositoryName}Repository';
import { {EntityName} } from '../../domain/{context}/entity/{EntityName}.entity';

const STORAGE_KEY = '{entityName}s';

interface Stored{EntityName} {
  id: string;
  // TODO: ストレージ用のプレーンオブジェクト型を定義
  // 注意: Date は ISO 8601 文字列に、Value Object は値に変換
}

/**
 * {StorageType} を使用した{EntityName}リポジトリ実装
 */
export class {StorageType}{RepositoryName}Repository implements I{RepositoryName}Repository {
  async save(entity: {EntityName}): Promise<Result<void, Error>> {
    try {
      const allEntitiesResult = await this.findAll();
      if (allEntitiesResult.isFailure) {
        return Result.fail(allEntitiesResult.error);
      }

      const entities = allEntitiesResult.value;
      const existingIndex = entities.findIndex(e => e.id === entity.id);

      if (existingIndex >= 0) {
        entities[existingIndex] = entity;
      } else {
        entities.push(entity);
      }

      return this.saveAll(entities);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async saveAll(entities: {EntityName}[]): Promise<Result<void, Error>> {
    try {
      const stored: Stored{EntityName}[] = entities.map(entity => ({
        id: entity.id,
        // TODO: ドメインエンティティをストレージ型に変換
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findAll(): Promise<Result<{EntityName}[], Error>> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);

      if (!data) {
        return Result.ok([]);
      }

      const stored: Stored{EntityName}[] = JSON.parse(data);
      const entities: {EntityName}[] = [];

      for (const storedEntity of stored) {
        const entityResult = this.toEntity(storedEntity);
        if (entityResult.isFailure) {
          console.warn('Failed to parse entity:', entityResult.error);
          continue;
        }
        entities.push(entityResult.value);
      }

      return Result.ok(entities);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  /**
   * ストレージ型からドメインエンティティへの変換
   */
  private toEntity(stored: Stored{EntityName}): Result<{EntityName}, Error> {
    try {
      // TODO: ストレージ型からドメインエンティティを再構築
      // Value Objects も適切に再構築すること
      const entityResult = {EntityName}.create(
        // props
        stored.id,
      );

      if (entityResult.isFailure) {
        return Result.fail(entityResult.error);
      }

      return Result.ok(entityResult.value);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findById(id: string): Promise<Result<{EntityName} | null, Error>> {
    const allEntitiesResult = await this.findAll();
    if (allEntitiesResult.isFailure) {
      return Result.fail(allEntitiesResult.error);
    }

    const entity = allEntitiesResult.value.find(e => e.id === id);
    return Result.ok(entity ?? null);
  }

  async delete(id: string): Promise<Result<void, Error>> {
    const allEntitiesResult = await this.findAll();
    if (allEntitiesResult.isFailure) {
      return Result.fail(allEntitiesResult.error);
    }

    const filtered = allEntitiesResult.value.filter(e => e.id !== id);
    return this.saveAll(filtered);
  }

  async clear(): Promise<Result<void, Error>> {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

**DI Container 登録例**:

```typescript
// src/di/container.ts
import type { I{RepositoryName}Repository } from '../domain/{context}/repository/I{RepositoryName}Repository';
import { {StorageType}{RepositoryName}Repository } from '../infrastructure/repository/{StorageType}{RepositoryName}Repository';

container.register<I{RepositoryName}Repository>(
  'I{RepositoryName}Repository',
  new {StorageType}{RepositoryName}Repository(),
);
```

---

### 4. Infrastructure Service 追加時

**チェックリスト**:
- [ ] Domain Service Interface が定義されているか (Domain 層)
- [ ] Infrastructure で実装されているか
- [ ] Result パターンでエラーハンドリング
- [ ] DI Container に登録
- [ ] API レスポンスをドメインモデルに変換しているか
- [ ] API キーが Constructor Injection されているか

**ファイル配置**:
- Interface: `src/domain/{context}/service/I{Name}Service.ts`
- Implementation: `src/infrastructure/api/{Name}Service.ts`

**テンプレート - Interface (Domain Layer)**:

```typescript
import { Result } from '../../../shared/domain/Result';
import { {DomainError} } from '../error/{ContextError}';

/**
 * {ServiceName} サービスインターフェース
 * Infrastructure層で実装される
 */
export interface I{ServiceName}Service {
  /**
   * {Description of main operation}
   */
  {methodName}(
    {params}: {Type},
  ): Promise<Result<{ReturnType}, {DomainError}>>;
}
```

**テンプレート - Implementation (Infrastructure Layer)**:

```typescript
import { Result } from '../../shared/domain/Result';
import { I{ServiceName}Service } from '../../domain/{context}/service/I{ServiceName}Service';
import { {DomainError} } from '../../domain/{context}/error/{Context}Error';

/**
 * {External API Name} を使用した{ServiceName}サービス実装
 */
export class {ServiceName}Service implements I{ServiceName}Service {
  private readonly baseUrl = 'https://api.example.com';

  constructor(private readonly apiKey: string) {}

  async {methodName}(
    {params}: {Type},
  ): Promise<Result<{ReturnType}, {DomainError}>> {
    try {
      const response = await fetch(`${this.baseUrl}/endpoint`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Request body
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return Result.fail(
          new {DomainError}(
            `API request failed: ${errorData.message || response.statusText}`,
          ),
        );
      }

      const data = await response.json();

      // DTO からドメインエンティティに変換
      const domainObject = this.mapToDomain(data);

      return Result.ok(domainObject);
    } catch (error) {
      return Result.fail(
        new {DomainError}(
          `Failed to {operation}: ${(error as Error).message}`,
          error,
        ),
      );
    }
  }

  private mapToDomain(data: any): {ReturnType} {
    // API レスポンスからドメインモデルへの変換ロジック
    // TODO: 実装する
  }
}
```

---

### 5. Custom Hook 追加時

**チェックリスト**:
- [ ] Use Case を DI Container から解決
- [ ] loading, error 状態を管理
- [ ] useCallback でメモ化
- [ ] index.ts から export
- [ ] Result パターンで成功/失敗を判定
- [ ] 適切なエラーハンドリング (try-catch-finally)

**ファイル配置**:
- Hook: `src/presentation/hooks/use{Name}.ts`

**テンプレート**:

```typescript
import { useCallback, useState } from 'react';
import { container } from '../../di/container';
import { {UseCaseName} } from '../../application/use-case/{UseCaseName}';
import type { {InputDTO} } from '../../application/dto/{InputDTO}';
import type { {OutputDTO} } from '../../application/dto/{OutputDTO}';

/**
 * {UseCaseName}を呼び出すカスタムフック
 */
export const use{ActionName} = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {actionName} = useCallback(
    async ({params}): Promise<{ReturnType}> => {
      setLoading(true);
      setError(null);

      try {
        // DIコンテナからUse Caseを取得
        const useCase = container.resolve<{UseCaseName}>('{UseCaseName}');

        // Use Caseを実行
        const result = await useCase.execute({
          // 入力パラメータ
        });

        // Result パターンで成功/失敗を判定
        if (result.isSuccess) {
          return result.value;
        } else {
          setError(result.error.message);
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { {actionName}, loading, error };
};
```

**index.ts への追加**:

```typescript
// src/presentation/hooks/index.ts
export * from './use{ActionName}';
```

---

### 6. Test 追加時

**チェックリスト**:
- [ ] Domain Layer: 外部依存なしのユニットテスト
- [ ] Application Layer: モックを使用した Use Case テスト
- [ ] Infrastructure Layer: 統合テスト
- [ ] Presentation Layer: Hook テスト
- [ ] AAA パターン (Arrange-Act-Assert) に従う
- [ ] エッジケースをカバー

**ファイル配置**:
- `src/{layer}/**/__tests__/{Name}.test.ts`

**テンプレート - Domain Layer (Value Object)**:

```typescript
import { describe, it, expect } from 'vitest';
import { {ValueObjectName} } from '../{ValueObjectName}.vo';

describe('{ValueObjectName}', () => {
  describe('create', () => {
    it('should create valid value object', () => {
      const result = {ValueObjectName}.create('valid-value');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.getValue()).toBe('valid-value');
    });

    it('should fail with invalid value', () => {
      const result = {ValueObjectName}.create('');

      expect(result.isFailure).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const vo1 = {ValueObjectName}.create('value').value!;
      const vo2 = {ValueObjectName}.create('value').value!;

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for different values', () => {
      const vo1 = {ValueObjectName}.create('value1').value!;
      const vo2 = {ValueObjectName}.create('value2').value!;

      expect(vo1.equals(vo2)).toBe(false);
    });
  });
});
```

**テンプレート - Application Layer (Use Case)**:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { {UseCaseName} } from '../{UseCaseName}';
import { I{Service}Service } from '../../domain/{context}/service/I{Service}Service';
import { Result } from '../../shared/domain/Result';

describe('{UseCaseName}', () => {
  let useCase: {UseCaseName};
  let mockService: I{Service}Service;

  beforeEach(() => {
    // モックの作成
    mockService = {
      {method}: vi.fn(),
    };

    useCase = new {UseCaseName}(mockService);
  });

  describe('execute', () => {
    it('should execute successfully', async () => {
      // Arrange
      const mockData = { /* ... */ };
      vi.mocked(mockService.{method}).mockResolvedValue(Result.ok(mockData));

      // Act
      const result = await useCase.execute({ /* input */ });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockService.{method}).toHaveBeenCalledWith(/* expected args */);
    });

    it('should handle failure', async () => {
      // Arrange
      vi.mocked(mockService.{method}).mockResolvedValue(
        Result.fail(new Error('Service failed'))
      );

      // Act
      const result = await useCase.execute({ /* input */ });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toBe('Service failed');
    });
  });
});
```

**テンプレート - Presentation Layer (Hook)**:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { use{HookName} } from './use{HookName}';
import { container } from '../../di/container';
import { {UseCaseName} } from '../../application/use-case/{UseCaseName}';
import { Result } from '../../shared/domain/Result';

// DI Container のモック
vi.mock('../../di/container', () => ({
  container: {
    resolve: vi.fn(),
  },
}));

describe('use{HookName}', () => {
  let mockUseCase: {UseCaseName};

  beforeEach(() => {
    mockUseCase = {
      execute: vi.fn(),
    } as unknown as {UseCaseName};

    vi.mocked(container.resolve).mockReturnValue(mockUseCase);
  });

  it('should successfully execute', async () => {
    const mockOutput = { /* ... */ };
    vi.mocked(mockUseCase.execute).mockResolvedValue(Result.ok(mockOutput));

    const { result } = renderHook(() => use{HookName}());

    // 初期状態の検証
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    // 実行
    const output = await result.current.{actionName}(/* params */);

    // 最終状態の検証
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(output).toEqual(mockOutput);
    });
  });

  it('should handle error', async () => {
    vi.mocked(mockUseCase.execute).mockResolvedValue(
      Result.fail(new Error('Use case failed'))
    );

    const { result } = renderHook(() => use{HookName}());

    await result.current.{actionName}(/* params */);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Use case failed');
    });
  });
});
```

---

### 7. Component リファクタリング時

**チェックリスト**:
- [ ] ビジネスロジックを Use Case に移動
- [ ] Custom Hook を作成
- [ ] Presentational/Container 分離 (必要に応じて)
- [ ] 既存機能を維持
- [ ] 直接的な API 呼び出しを削除
- [ ] utils/ からのインポートを削除

**リファクタリングパターン**:

**Before** (ビジネスロジックがコンポーネント内):

```typescript
// ❌ Bad: コンポーネント内に直接API呼び出し
const handleSubmit = async () => {
  setLoading(true);
  try {
    const response = await fetch('https://api.example.com/endpoint', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    setData(result);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

**After** (Use Case + Custom Hook):

```typescript
// ✅ Good: Use Case を使用
import { use{FeatureName} } from '../presentation/hooks';

const { {actionName}, loading, error } = use{FeatureName}();

const handleSubmit = async () => {
  const result = await {actionName}(data);

  if (result) {
    // 成功処理
  } else {
    // エラー処理 (error state はフックが管理)
  }
};
```

---

### 8. Domain モデルレビュー時

**チェックリスト**:
- [ ] イミュータビリティ
  - すべてのプロパティが readonly
  - コンストラクタが private
  - 更新メソッドは新しいインスタンスを返す
- [ ] ビジネスルールの配置
  - ビジネスロジックがエンティティ/VO 内に実装されている
  - Use Case や Component にビジネスロジックが漏れていない
- [ ] 外部依存なし
  - Pure TypeScript のみ使用
  - React, Axios などのインポートがない
- [ ] 適切な Entity/Value Object の選択
  - Entity: ID による識別、ライフサイクル
  - Value Object: 値による等価性、イミュータブル
- [ ] バリデーション
  - create メソッドで実施
  - Result パターンでエラーを返す

**レビュー例**:

```typescript
// ✅ Good: イミュータブルな Entity
class ShiftEvent extends Entity<ShiftEventProps> {
  private constructor(props: ShiftEventProps, id?: string) {
    super(props, id);
  }

  static create(
    summary: ShiftType,
    start: Date,
    end: Date,
    id?: string,
  ): Result<ShiftEvent, ValidationError> {
    // バリデーション
    if (start >= end) {
      return Result.fail(new ValidationError('Start must be before end'));
    }

    return Result.ok(new ShiftEvent({ summary, start, end }, id));
  }

  // ビジネスロジック
  canEdit(): boolean {
    return this.isFutureEvent();
  }

  isFutureEvent(): boolean {
    return this.props.start > new Date();
  }

  // イミュータブルな更新
  updateSummary(newSummary: ShiftType): Result<ShiftEvent, ValidationError> {
    return Result.ok(new ShiftEvent({
      ...this.props,
      summary: newSummary,
    }, this.id));
  }
}

// ❌ Bad: ミュータブルな Entity
class ShiftEvent {
  public summary: string; // ❌ mutable
  public start: Date;

  updateSummary(newSummary: string): void {
    this.summary = newSummary; // ❌ direct mutation
  }
}
```

---

### 9. Architecture レビュー時

**チェックリスト**:
- [ ] レイヤー分離
  - Domain Layer が外部依存を持っていないか
  - Application Layer が Infrastructure の具象クラスに依存していないか
  - Presentation Layer がビジネスロジックを持っていないか
- [ ] 依存関係の方向
  - Presentation → Application → Domain ← Infrastructure
  - 依存性逆転の原則 (DIP) が守られているか
- [ ] Repository パターン
  - Interface が Domain 層にあるか
  - Implementation が Infrastructure 層にあるか
- [ ] Use Case パターン
  - 単一責任原則が守られているか
  - DTO でレイヤー間のデータ変換が行われているか

**レビュー観点**:

1. **Domain Purity**: Domain Layer に外部ライブラリへの依存がないか
   ```typescript
   // ✅ Good
   import { Entity } from '../../../shared/domain/Entity';
   import { Result } from '../../../shared/domain/Result';

   // ❌ Bad
   import axios from 'axios';
   import { useState } from 'react';
   ```

2. **Dependency Direction**: 依存の方向が正しいか
   ```typescript
   // ✅ Good: Use Case が Interface に依存
   class ParseShiftImageUseCase {
     constructor(
       private readonly service: IShiftExtractionService, // Interface
     ) {}
   }

   // ❌ Bad: Use Case が具象クラスに依存
   class ParseShiftImageUseCase {
     constructor(
       private readonly service: GeminiShiftExtractionService, // 具象クラス
     ) {}
   }
   ```

3. **Business Logic Location**: ビジネスロジックの配置
   ```typescript
   // ✅ Good: Domain にビジネスロジック
   class ShiftEvent extends Entity<ShiftEventProps> {
     canEdit(): boolean {
       return this.isFutureEvent();
     }
   }

   // ❌ Bad: Use Case にビジネスロジック
   class EditEventUseCase {
     execute(event: ShiftEvent) {
       if (event.start > new Date()) { // ビジネスルール
         // ...
       }
     }
   }
   ```

---

## まとめ

これらのガイドラインは、Claude が各種開発タスクを実行する際に参照すべき基準です。常に以下を心がけてください:

1. **アーキテクチャ原則の遵守**: DDD とクリーンアーキテクチャの原則に従う
2. **レイヤー分離**: 各レイヤーの責務を明確にし、依存関係の方向を守る
3. **型安全性**: Result パターンと適切な型定義を使用
4. **テスタビリティ**: モック可能な設計とユニットテストの作成
5. **保守性**: 明確な命名、適切なドキュメント、Single Responsibility Principle

詳細な実装例や既存コードの参照先については、`.claude/commands/` 配下の各コマンドファイルを確認してください。
