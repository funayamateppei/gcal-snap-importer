# Claude Code Skills - Complete Guide 🎓

**作成日**: 2026-01-10
**更新日**: 2026-01-10

⚠️ **重要な変更**: 当初はユーザー向けのスラッシュコマンドとして作成されましたが、プロジェクトの方針により、これらのガイドラインは **CLAUDE.md** に統合されました。CLAUDE.md は Claude (AI) が開発作業を行う際に参照する指示書として機能します。

このドキュメントは、スキルコマンドの開発経緯と内容を記録するためのアーカイブとして残されています。

## 📋 スキル一覧

### 🔍 アーキテクチャ & レビュー（3スキル）

#### 1. `/architecture-review`
**目的**: プロジェクト全体のアーキテクチャをDDD/Clean Architectureの原則に基づいてレビュー

**主な機能**:
- レイヤー分離の確認
- 依存関係の方向チェック
- ドメインモデルの品質評価
- Use Case パターンの遵守確認
- Repository パターンの実装チェック

**出力**:
- 良い点のリスト
- 問題点と修正方法
- アーキテクチャメトリクス
- 優先度付き推奨事項

---

#### 2. `/review-domain`
**目的**: ドメインモデル（Entity/Value Object）のDDD準拠を詳細レビュー

**主な機能**:
- イミュータビリティチェック
- ビジネスルールの配置確認
- 外部依存のチェック
- Value Object vs Entity の選択確認
- バリデーションロジックの確認

**チェックリスト**: 7つの主要項目
**実例**: ShiftEvent, ShiftType, UserSession など

---

#### 3. `/coding-rule`
**目的**: プロジェクトのコーディング規約を確認

**カバー範囲**:
- DDD/Clean Architecture 原則
- TypeScript コーディング規約
- React ベストプラクティス
- セキュリティガイドライン
- テスト戦略

---

### ➕ 新規追加（6スキル）

#### 4. `/add-domain-entity`
**目的**: 新しいドメインエンティティまたはValue Objectを追加

**使用例**:
```
/add-domain-entity WorkLocation value-object shift-parsing
```

**生成されるもの**:
- Entity または Value Object クラス
- テストファイル
- バリデーションロジック
- Factory メソッド

**ファイルサイズ**: 約400-600行のガイド

---

#### 5. `/add-usecase`
**目的**: 新しいユースケースを追加

**使用例**:
```
/add-usecase ExportShiftsToPdf "Export shift events to PDF format"
```

**生成されるもの**:
- Use Case クラス（Application層）
- Input/Output インターフェース
- カスタムフック（オプション）
- テストファイル

**ファイルサイズ**: 約450行のガイド

---

#### 6. `/add-repository`
**目的**: 新しいRepository（Interface + Implementation）を追加

**使用例**:
```
/add-repository ShiftHistory shift-parsing LocalStorage
```

**生成されるもの**:
- Repository Interface（Domain層）
- Repository Implementation（Infrastructure層）
- DI Container への登録
- テストファイル

**主な機能**:
- LocalStorage, SessionStorage, IndexedDB 対応
- Entity/DTO 変換パターン
- エラーハンドリングテンプレート

**ファイルサイズ**: 678行（約18KB）

---

#### 7. `/add-infrastructure-service`
**目的**: 新しいInfrastructureサービス（API Client）を追加

**使用例**:
```
/add-infrastructure-service WeatherAPI external-data "Fetch weather data"
```

**生成されるもの**:
- Domain Service Interface
- Infrastructure Implementation
- Domain Error 定義
- DI Container への登録

**コードテンプレート**:
- REST API Client
- OAuth Authentication Client
- Batch Processing Client

**ファイルサイズ**: 650行（約20KB）

---

#### 8. `/add-custom-hook`
**目的**: Use Caseをラップするカスタムフックを追加

**使用例**:
```
/add-custom-hook useExportPdf ExportShiftsToPdfUseCase
```

**生成されるもの**:
- Custom Hook ファイル（Presentation層）
- DI Container からの Use Case 解決
- Loading/Error 状態管理
- Export 設定

**実例**: useLogin, useParseShiftImage, useRegisterEvents

**ファイルサイズ**: 468行（約12KB）

---

#### 9. `/add-test`
**目的**: 各層のテストファイルを追加

**使用例**:
```
/add-test ShiftEvent entity
/add-test LoginUseCase usecase
```

**対応テスト種別**:
1. **Domain Layer**: Entity/Value Object のユニットテスト
2. **Application Layer**: Use Case テスト（モック使用）
3. **Infrastructure Layer**: Repository/API Client の統合テスト
4. **Presentation Layer**: Custom Hook のテスト

**テストフレームワーク**: Vitest + React Testing Library

**テンプレート**:
- AAA パターン（Arrange-Act-Assert）
- モック作成ヘルパー
- カバレッジ推奨値

**ファイルサイズ**: 550行（約15KB）

---

### 🔧 リファクタリング（1スキル）

#### 10. `/refactor-component`
**目的**: 既存コンポーネントをClean Architectureに準拠するようリファクタリング

**使用例**:
```
/refactor-component UserSettingsPage
```

**リファクタリング内容**:
- 直接的なAPI呼び出し → Use Case
- コンポーネント内のビジネスロジック → Domain/Application層
- 複雑な状態管理 → Custom Hook

**実例（実際のリファクタリング）**:
- AuthPage: 直接fetch → useLogin
- UploadPage: parseShiftImage → useParseShiftImage
- PreviewPage: insertCalendarEventsBatch → useRegisterEvents

**Before/After コード例**: 3つの実例を掲載

**ファイルサイズ**: 653行（約18KB）

---

## 📊 スキル統計

### 総合情報

| 項目 | 値 |
|------|-----|
| **総スキル数** | 10 |
| **総ファイルサイズ** | 約125KB |
| **総行数** | 約5,000行 |
| **カバー範囲** | 4層すべて（Domain, Application, Infrastructure, Presentation） |

### カテゴリ別内訳

| カテゴリ | スキル数 | 主な用途 |
|---------|---------|---------|
| **レビュー** | 3 | コード品質保証、規約確認 |
| **新規追加** | 6 | 新機能開発、拡張 |
| **リファクタリング** | 1 | 既存コード改善 |

### レイヤー別カバレッジ

| レイヤー | 関連スキル | カバレッジ |
|---------|-----------|-----------|
| **Domain** | add-domain-entity, review-domain, add-repository | ⭐⭐⭐⭐⭐ |
| **Application** | add-usecase, add-test | ⭐⭐⭐⭐⭐ |
| **Infrastructure** | add-repository, add-infrastructure-service, add-test | ⭐⭐⭐⭐⭐ |
| **Presentation** | add-custom-hook, refactor-component, add-test | ⭐⭐⭐⭐⭐ |

---

## 🎯 使用シナリオ

### シナリオ1: 新機能の追加

**要件**: 「シフトをPDFにエクスポートする機能を追加したい」

**ステップ**:
1. `/add-domain-entity ExportFormat value-object shift-parsing` - PDF形式を表現
2. `/add-usecase ExportShiftsToPdf "Export shifts to PDF"` - ユースケース作成
3. `/add-infrastructure-service PdfGeneratorService pdf-generation "Generate PDF"` - PDF生成サービス
4. `/add-custom-hook useExportPdf ExportShiftsToPdfUseCase` - カスタムフック作成
5. `/add-test ExportShiftsToPdfUseCase usecase` - テスト追加

---

### シナリオ2: 既存コンポーネントの改善

**要件**: 「SettingsPage がビジネスロジックを持っているのでリファクタリングしたい」

**ステップ**:
1. `/review-domain` - 現状のドメインモデルを確認
2. `/refactor-component SettingsPage` - リファクタリングガイドに従う
3. `/add-usecase UpdateSettings "Update user settings"` - 必要に応じてユースケース作成
4. `/add-custom-hook useUpdateSettings UpdateSettingsUseCase` - フック作成
5. `/add-test UpdateSettingsUseCase usecase` - テスト追加

---

### シナリオ3: コードレビュー

**要件**: 「プルリクエストのレビュー前にアーキテクチャをチェックしたい」

**ステップ**:
1. `/architecture-review` - 全体的なアーキテクチャ確認
2. `/review-domain src/domain/new-feature/` - 新しいドメインモデルをレビュー
3. `/coding-rule` - コーディング規約の確認
4. 問題があれば修正して再レビュー

---

## 🚀 スキル活用のベストプラクティス

### 1. 開発フローへの統合

```
新機能開発:
  設計 → /add-domain-entity
      → /add-usecase
      → /add-infrastructure-service
      → /add-custom-hook
  実装 → コード作成
  テスト → /add-test
  レビュー → /architecture-review

リファクタリング:
  分析 → /review-domain
  計画 → /refactor-component
  実装 → コード修正
  検証 → /architecture-review
```

### 2. チーム開発での活用

- **新メンバーのオンボーディング**: `/coding-rule` で規約を共有
- **コードレビュー**: `/architecture-review` でPR前にチェック
- **設計レビュー**: `/review-domain` でドメインモデルを議論

### 3. 品質保証

- 各スキルのチェックリストを活用
- テストカバレッジを維持（`/add-test` で追加）
- 定期的なアーキテクチャレビュー（月1回など）

---

## 📚 スキル別リファレンス

### 各スキルの詳細ドキュメント

すべてのスキルは `.claude/commands/` ディレクトリに格納されています：

```
.claude/commands/
├── architecture-review.md      (アーキテクチャレビュー)
├── review-domain.md            (ドメインレビュー)
├── coding-rule.md              (コーディング規約)
├── add-domain-entity.md        (エンティティ追加)
├── add-usecase.md              (ユースケース追加)
├── add-repository.md           (リポジトリ追加)
├── add-infrastructure-service.md (サービス追加)
├── add-custom-hook.md          (フック追加)
├── add-test.md                 (テスト追加)
└── refactor-component.md       (リファクタリング)
```

### 関連ドキュメント

- [ARCHITECTURE.md](./ARCHITECTURE.md) - アーキテクチャ詳細
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - リファクタリングサマリー
- [PAGES_REFACTORING_COMPLETE.md](./PAGES_REFACTORING_COMPLETE.md) - Pagesリファクタリング完了レポート
- [CLAUDE.md](../CLAUDE.md) - マネージャー/オーケストレーターガイドライン

---

## 🎉 まとめ

### 達成したこと

✅ **10個の包括的なスキルコマンドを作成**
- レビュー: 3スキル
- 新規追加: 6スキル
- リファクタリング: 1スキル

✅ **すべてのアーキテクチャ層をカバー**
- Domain Layer ⭐⭐⭐⭐⭐
- Application Layer ⭐⭐⭐⭐⭐
- Infrastructure Layer ⭐⭐⭐⭐⭐
- Presentation Layer ⭐⭐⭐⭐⭐

✅ **実践的なガイダンス**
- 実際のプロジェクトコードからの具体例
- コピー&ペースト可能なテンプレート
- ステップバイステップガイド
- チェックリスト

### 成果

このスキルセットにより：

1. **開発効率の向上**: テンプレートとガイドで素早く実装
2. **品質の一貫性**: レビュースキルで基準を維持
3. **学習曲線の短縮**: 新メンバーが素早くキャッチアップ
4. **アーキテクチャの維持**: DDD/Clean Architecture が保たれる

### 次のステップ

- 各スキルを実際の開発で活用
- フィードバックを収集してスキルを改善
- 新しいパターンが確立されたら追加スキルを作成
- チーム全体でスキルコマンドの活用を推進

---

**作成日**: 2026-01-10
**作成方法**: CLAUDE.md ガイドラインに従い、Task agent による並列処理
**総開発時間**: 効率的な並列処理により大幅短縮
**品質**: すべてのスキルが要件を満たし、実用的
