---
description: Review the codebase architecture against DDD and Clean Architecture principles
---

# Architecture Review

プロジェクト全体のアーキテクチャをDDD（Domain-Driven Design）とクリーンアーキテクチャの原則に基づいてレビューしてください。

## レビュー項目

### 1. レイヤー分離
- Domain Layer が外部依存を持っていないか
- Application Layer が Infrastructure の具象クラスに直接依存していないか
- Presentation Layer がビジネスロジックを持っていないか

### 2. 依存関係の方向
- 依存性逆転の原則（DIP）が守られているか
- 依存の方向が正しいか（Presentation → Application → Domain ← Infrastructure）

### 3. ドメインモデル
- エンティティが不変（イミュータブル）か
- Value Object が適切に使用されているか
- ビジネスルールがドメイン層に実装されているか

### 4. Use Case パターン
- 各 Use Case が単一責任か
- DTOでデータ変換が適切に行われているか

### 5. Repository パターン
- Repository インターフェースが Domain Layer に定義されているか
- Infrastructure Layer で適切に実装されているか

### 6. エラーハンドリング
- ドメイン例外が適切に定義されているか
- Result パターンまたは適切なエラーハンドリングが実装されているか

## 出力形式

レビュー結果を以下の形式で出力してください：

```markdown
## Architecture Review Report

### ✅ Good Points
- [良い点のリスト]

### ⚠️ Issues Found
- [問題点と該当ファイル]
  - ファイルパス:行番号
  - 問題の詳細
  - 推奨される修正方法

### 📊 Metrics
- Domain Layer Purity: X% (外部依存のないファイルの割合)
- Use Case Compliance: X% (単一責任原則を守っているUse Caseの割合)
- Layer Violation Count: X件

### 🎯 Recommendations
- [優先度の高い推奨事項]
```

## 実行方法

コードベース全体を分析し、上記の観点からレビューを実施してください。
