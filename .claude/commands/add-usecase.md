---
description: Add a new Use Case following DDD and Clean Architecture patterns
---

# Add Use Case

新しいユースケースをDDDとクリーンアーキテクチャのパターンに従って追加します。

## 使用方法

```
/add-usecase <UseCaseName> <description>
```

例:
```
/add-usecase ExportShiftsToPdf "Export shift events to PDF format"
```

## 自動生成されるファイル

### 1. Use Case クラス
`src/application/use-case/{UseCaseName}.usecase.ts`

```typescript
import { UseCase } from '../base/UseCase';
import { Result } from '../../shared/Result';

export interface {UseCaseName}Input {
  // TODO: 入力パラメータを定義
}

export interface {UseCaseName}Output {
  // TODO: 出力パラメータを定義
}

export class {UseCaseName} implements UseCase<{UseCaseName}Input, {UseCaseName}Output> {
  constructor(
    // TODO: 必要な依存関係を注入
  ) {}

  async execute(input: {UseCaseName}Input): Promise<Result<{UseCaseName}Output, Error>> {
    try {
      // TODO: ユースケースロジックを実装

      return Result.ok({
        // TODO: 出力を返す
      });
    } catch (error) {
      return Result.fail(error);
    }
  }
}
```

### 2. カスタムフック (オプション)
`src/presentation/hooks/use{UseCaseName}.ts`

```typescript
import { useCallback } from 'react';
import { {UseCaseName} } from '../../application/use-case/{UseCaseName}.usecase';
import { container } from '../../di/container';

export const use{UseCaseName} = () => {
  const execute = useCallback(async (input: {UseCaseName}Input) => {
    const useCase = container.resolve({UseCaseName});
    return await useCase.execute(input);
  }, []);

  return { execute };
};
```

### 3. テストファイル
`src/application/use-case/__tests__/{UseCaseName}.test.ts`

```typescript
import { {UseCaseName} } from '../{UseCaseName}.usecase';

describe('{UseCaseName}', () => {
  let useCase: {UseCaseName};

  beforeEach(() => {
    // TODO: モックの準備
    useCase = new {UseCaseName}(/* mock dependencies */);
  });

  it('should execute successfully', async () => {
    // TODO: テストケースを実装
  });
});
```

## チェックリスト

生成後、以下を確認してください：

- [ ] Input/Output インターフェースが適切に定義されている
- [ ] 必要な依存関係が Constructor Injection されている
- [ ] エラーハンドリングが適切に実装されている
- [ ] 単一責任原則が守られている
- [ ] テストケースが実装されている
- [ ] DI コンテナに登録されている

## 実装手順

1. ユースケース名と説明を提供してください
2. 必要な依存関係（Domain Services, Repositories）を特定します
3. 上記のファイルを生成します
4. TODO コメントに従って実装を完了してください
