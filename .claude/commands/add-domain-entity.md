---
description: Add a new Domain Entity or Value Object following DDD patterns
---

# Add Domain Entity/Value Object

新しいドメインエンティティまたは Value Object を DDD パターンに従って追加します。

## 使用方法

```
/add-domain-entity <EntityName> <type> <context>
```

- `<EntityName>`: エンティティ名（例: ShiftEvent, UserSession）
- `<type>`: `entity` または `value-object`
- `<context>`: ドメイン境界（例: shift-parsing, authentication）

例:
```
/add-domain-entity WorkLocation value-object shift-parsing
```

## 自動生成されるファイル

### Entity の場合

`src/domain/{context}/entity/{EntityName}.entity.ts`

```typescript
import { Entity } from '../../base/Entity';
import { Result } from '../../../shared/Result';

export interface {EntityName}Props {
  // TODO: プロパティを定義
}

export class {EntityName} extends Entity<{EntityName}Props> {
  private constructor(props: {EntityName}Props, id?: string) {
    super(props, id);
  }

  static create(props: {EntityName}Props, id?: string): Result<{EntityName}, Error> {
    // TODO: バリデーション
    return Result.ok(new {EntityName}(props, id));
  }

  // Getters
  get someProperty(): string {
    return this.props.someProperty;
  }

  // Business Logic Methods
  updateSomeProperty(value: string): Result<{EntityName}, Error> {
    // TODO: ビジネスルールの検証
    return Result.ok(new {EntityName}({
      ...this.props,
      someProperty: value,
    }, this.id));
  }
}
```

### Value Object の場合

`src/domain/{context}/value-object/{EntityName}.vo.ts`

```typescript
import { ValueObject } from '../../base/ValueObject';
import { Result } from '../../../shared/Result';

export interface {EntityName}Props {
  // TODO: プロパティを定義
}

export class {EntityName} extends ValueObject<{EntityName}Props> {
  private constructor(props: {EntityName}Props) {
    super(props);
  }

  static create(value: unknown): Result<{EntityName}, Error> {
    // TODO: バリデーション
    if (!this.isValid(value)) {
      return Result.fail(new Error('Invalid {EntityName}'));
    }

    return Result.ok(new {EntityName}({ /* props */ }));
  }

  private static isValid(value: unknown): boolean {
    // TODO: バリデーションロジック
    return true;
  }

  getValue(): string {
    return this.props.value;
  }

  equals(other: {EntityName}): boolean {
    return this.props.value === other.props.value;
  }
}
```

## ドメインモデル設計のガイドライン

### Entity vs Value Object の選択

**Entity を使用する場合：**
- 識別子（ID）が必要
- ライフサイクルを持つ
- 同じ属性でも異なるインスタンスとして扱う
- 例: ShiftEvent, UserSession, CalendarEventBatch

**Value Object を使用する場合：**
- 識別子が不要
- 属性の値で等価性を判断
- イミュータブル（不変）
- 例: ShiftSymbol, ShiftType, TimeWindow, Email

### 不変性の保証

```typescript
// ✅ Good: イミュータブルな更新
updateSummary(newSummary: string): Result<ShiftEvent, Error> {
  return Result.ok(new ShiftEvent({
    ...this.props,
    summary: newSummary,
  }, this.id));
}

// ❌ Bad: ミュータブルな更新
updateSummary(newSummary: string): void {
  this.props.summary = newSummary; // 直接変更
}
```

### ビジネスルールの配置

```typescript
// ✅ Good: エンティティ内にビジネスルール
class ShiftEvent extends Entity<ShiftEventProps> {
  canBeEdited(): boolean {
    const now = new Date();
    return this.props.start > now; // 未来のイベントのみ編集可能
  }

  markAsCompleted(): Result<ShiftEvent, Error> {
    if (!this.canBeEdited()) {
      return Result.fail(new Error('Cannot edit past events'));
    }
    // ...
  }
}

// ❌ Bad: ビジネスルールが外部に漏れる
// Use Case や Component で実装するのは避ける
```

## テストファイル

`src/domain/{context}/entity/__tests__/{EntityName}.test.ts`

```typescript
import { {EntityName} } from '../{EntityName}.entity';

describe('{EntityName}', () => {
  describe('create', () => {
    it('should create valid entity', () => {
      const result = {EntityName}.create({
        // TODO: valid props
      });

      expect(result.isSuccess).toBe(true);
    });

    it('should fail with invalid props', () => {
      const result = {EntityName}.create({
        // TODO: invalid props
      });

      expect(result.isFailure).toBe(true);
    });
  });

  describe('business logic', () => {
    it('should apply business rules correctly', () => {
      // TODO: ビジネスロジックのテスト
    });
  });
});
```

## チェックリスト

- [ ] Entity/Value Object の選択が適切か
- [ ] イミュータブル（不変）な設計になっているか
- [ ] バリデーションが create メソッドで実施されているか
- [ ] ビジネスルールがエンティティ内に実装されているか
- [ ] 外部ライブラリへの依存がないか
- [ ] テストケースが実装されているか
- [ ] equals メソッドが実装されているか（Value Object の場合）
