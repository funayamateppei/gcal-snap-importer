# リファクタリング完了サマリー

このドキュメントは、GCal Snap Importer に実施したDDD/クリーンアーキテクチャへのリファクタリングの概要をまとめます。

## 📋 実施内容

### ✅ 完了した項目

#### 1. アーキテクチャ設計
- **4層アーキテクチャ**を定義: Domain, Application, Infrastructure, Presentation
- **6つのBounded Context**を設計:
  1. Authentication（認証）
  2. Shift Parsing（シフト解析）
  3. Event Management（イベント管理）
  4. Calendar Integration（カレンダー連携）
  5. Configuration（設定管理）
  6. Workflow（ワークフロー）

#### 2. Domain Layer（ドメイン層）の実装
**共通基底クラス** (`src/shared/domain/`):
- `Entity` - ID による識別を持つドメインオブジェクト
- `ValueObject` - 値による識別を持つイミュータブルなオブジェクト
- `Result` - エラーハンドリングのための Result パターン
- `DomainError` - ドメイン固有の例外クラス

**エンティティ** (`src/domain/{context}/entity/`):
- `UserSession` - ユーザー認証セッション
- `ShiftImage` - アップロードされたシフト画像
- `ExtractedShift` - 抽出された1日分のシフト
- `ExtractedShiftSchedule` - 複数日分のシフトスケジュール
- `ShiftEvent` - カレンダーイベント
- `CalendarEventBatch` - 一括登録用のイベントコレクション
- `AppConfiguration` - アプリケーション設定

**Value Objects** (`src/domain/{context}/value-object/`):
- `UserProfile` - ユーザープロフィール
- `ShiftSymbol` - シフト記号 (A/B/C/OTHER)
- `ShiftDate` - シフト日付
- `ShiftType` - シフト種別（早番/中番/遅番/休み）
- `TimeWindow` - 時間枠
- `RegistrationResult` - 登録結果
- `APIKey` - Gemini APIキー
- `WorkflowStep` - ワークフローステップ

**リポジトリインターフェース** (`src/domain/{context}/repository/`):
- `IUserSessionRepository`
- `IShiftRepository`
- `IEventRepository`

**サービスインターフェース** (`src/domain/{context}/service/`):
- `IAuthenticationService`
- `IShiftExtractionService`
- `ICalendarService`

#### 3. Application Layer（アプリケーション層）の実装
**Use Cases** (`src/application/use-case/`):
- `LoginUseCase` - ログイン処理
- `LogoutUseCase` - ログアウト処理
- `ParseShiftImageUseCase` - シフト画像の解析
- `RegisterEventsUseCase` - イベントの一括登録

**DTOs** (`src/application/dto/`):
- `ShiftEventDTO` - シフトイベントのデータ転送オブジェクト
- `UserProfileDTO` - ユーザープロフィールのデータ転送オブジェクト
- Mapper クラス - Entity ⇔ DTO の変換

#### 4. Infrastructure Layer（インフラストラクチャ層）の実装
**API Clients** (`src/infrastructure/api/`):
- `GoogleAuthenticationService` - Google OAuth 認証
- `GeminiShiftExtractionService` - Gemini AI を使用したシフト抽出
- `GoogleCalendarService` - Google Calendar API 連携

**Repository Implementations** (`src/infrastructure/repository/`):
- `SessionStorageUserSessionRepository` - セッション永続化
- `LocalStorageShiftRepository` - シフトデータ永続化
- `LocalStorageEventRepository` - イベントデータ永続化

#### 5. Dependency Injection（依存性注入）
**DI Container** (`src/di/container.ts`):
- すべてのサービス・リポジトリ・ユースケースの依存関係を管理
- Singleton パターンで実装
- Gemini API Key を動的に注入可能

#### 6. Presentation Layer（プレゼンテーション層）のサポート
**Custom Hooks** (`src/presentation/hooks/`):
- `useLogin` - LoginUseCase を呼び出すフック
- `useLogout` - LogoutUseCase を呼び出すフック
- `useParseShiftImage` - ParseShiftImageUseCase を呼び出すフック
- `useRegisterEvents` - RegisterEventsUseCase を呼び出すフック

#### 7. ドキュメント整備
**新規作成**:
- `docs/ARCHITECTURE.md` - アーキテクチャの詳細説明
- `.claude/commands/coding-rule.md` - コーディング規約（統合版）
- `.claude/commands/architecture-review.md` - アーキテクチャレビュースキル
- `.claude/commands/add-usecase.md` - Use Case 追加スキル
- `.claude/commands/add-domain-entity.md` - Domain Entity 追加スキル
- `docs/REFACTORING_SUMMARY.md` - 本ドキュメント

**更新**:
- `README.md` - アーキテクチャ情報、プロジェクト構成を追加

**削除**:
- `docs/PLAN.md` - 内容を README に統合
- `docs/CODING_RULES.md` - `.claude/commands/coding-rule.md` に統合

#### 8. Barrel Exports（インデックスファイル）
- `src/domain/index.ts` - ドメイン層のエクスポート
- `src/application/index.ts` - アプリケーション層のエクスポート
- `src/infrastructure/index.ts` - インフラストラクチャ層のエクスポート
- `src/presentation/hooks/index.ts` - プレゼンテーション層フックのエクスポート

## 📁 新しいディレクトリ構造

```
src/
├── shared/
│   └── domain/                  # ✅ NEW: 共通ドメインオブジェクト
│       ├── Entity.ts
│       ├── ValueObject.ts
│       ├── Result.ts
│       └── DomainError.ts
│
├── domain/                      # ✅ NEW: ドメイン層（6つの Bounded Context）
│   ├── authentication/
│   │   ├── entity/              # UserSession
│   │   ├── value-object/        # UserProfile
│   │   ├── service/             # IAuthenticationService
│   │   ├── repository/          # IUserSessionRepository
│   │   └── error/               # AuthenticationError
│   ├── shift-parsing/
│   ├── event-management/
│   ├── calendar-integration/
│   ├── configuration/
│   └── workflow/
│
├── application/                 # ✅ NEW: アプリケーション層
│   ├── base/                    # UseCase インターフェース
│   ├── use-case/                # 4つの Use Cases
│   └── dto/                     # DTOs & Mappers
│
├── infrastructure/              # ✅ NEW: インフラストラクチャ層
│   ├── api/                     # 3つの API Clients
│   └── repository/              # 3つの Repository 実装
│
├── di/                          # ✅ NEW: DI Container
│   └── container.ts
│
├── presentation/                # ✅ NEW: プレゼンテーション層
│   └── hooks/                   # 4つの Custom Hooks
│
├── pages/                       # ⚠️ EXISTING: 既存のページコンポーネント
├── components/                  # ⚠️ EXISTING: 既存のUIコンポーネント
├── hooks/                       # ⚠️ EXISTING: 既存のカスタムフック
├── store/                       # ⚠️ EXISTING: Zustand ストア
└── utils/                       # ⚠️ EXISTING: ユーティリティ（一部移行済み）
```

## 🎯 次のステップ（未完了の作業）

### 1. Presentation Layer のリファクタリング

既存の Pages コンポーネントを新しいカスタムフックを使用するように書き換えます。

**優先度: 高**

#### AuthPage の例

**Before（現在）**:
```typescript
// src/pages/AuthPage.tsx
const handleLogin = async (token: string) => {
  // 直接 API を呼び出している
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profile = await response.json();
  setUserProfile(profile);
};
```

**After（推奨）**:
```typescript
// src/pages/AuthPage.tsx
import { useLogin } from '../presentation/hooks';

const AuthPage = () => {
  const { login, loading, error } = useLogin();

  const handleLogin = async (token: string) => {
    const profile = await login(token);
    if (profile) {
      // 成功時の処理
      navigate('/api-key');
    }
  };

  // ...
};
```

#### UploadPage の例

**Before（現在）**:
```typescript
// src/pages/UploadPage.tsx
const handleAnalyze = async () => {
  const events = await parseShiftImage(apiKey, imageBase64, year);
  setEvents(events);
};
```

**After（推奨）**:
```typescript
// src/pages/UploadPage.tsx
import { useParseShiftImage } from '../presentation/hooks';

const UploadPage = () => {
  const { parseImage, loading, error } = useParseShiftImage();

  const handleAnalyze = async () => {
    const result = await parseImage(imageBase64, fileName, year);
    if (result) {
      setEvents(result.events);
    }
  };

  // ...
};
```

#### PreviewPage の例

**Before（現在）**:
```typescript
// src/pages/PreviewPage.tsx
const handleRegister = async () => {
  const results = await insertCalendarEventsBatch(accessToken, events);
  // ...
};
```

**After（推奨）**:
```typescript
// src/pages/PreviewPage.tsx
import { useRegisterEvents } from '../presentation/hooks';

const PreviewPage = () => {
  const { registerEvents, loading, error } = useRegisterEvents();

  const handleRegister = async () => {
    const result = await registerEvents(events, accessToken);
    if (result) {
      console.log(`${result.successCount}/${result.totalCount} events registered`);
    }
  };

  // ...
};
```

### 2. Zustand Store の段階的な置き換え

現在の `src/store/useAppStore.ts` は、新しいアーキテクチャと並行して動作させながら、段階的に削除していきます。

**アプローチ**:
1. まず、Pages で新しいカスタムフックを使用する
2. Zustand ストアは、グローバルなUI状態（現在のステップ、ローディング状態など）のみに限定
3. ビジネスロジックはすべて Use Case に移行
4. 最終的に、Zustand は必要最小限の UI 状態のみを管理

### 3. 既存の utils の整理

**移行済み**:
- `src/utils/gemini.ts` → `src/infrastructure/api/GeminiShiftExtractionService.ts`
- `src/utils/calendar.ts` → `src/infrastructure/api/GoogleCalendarService.ts`

**残存ファイル**:
- `src/utils/prompt.ts` - そのまま利用（Gemini プロンプト生成）
- `src/utils/mockData.ts` - そのまま利用（開発用モックデータ）

### 4. テストの追加

**優先度: 中**

- Domain Layer のユニットテスト
- Use Case のテスト（モックを使用）
- Integration テスト

### 5. 型エラーの修正

ビルド時に発生する可能性のある型エラーを修正します。

```bash
npm run build
```

## 📚 使用方法ガイド

### カスタムフックの使用例

#### 1. ログイン処理

```typescript
import { useLogin } from '../presentation/hooks';

function MyComponent() {
  const { login, loading, error } = useLogin();

  const handleLogin = async (accessToken: string) => {
    const profile = await login(accessToken);

    if (profile) {
      console.log('Logged in:', profile.name);
    } else {
      console.error('Login failed:', error);
    }
  };

  return <button onClick={() => handleLogin(token)}>Login</button>;
}
```

#### 2. シフト画像の解析

```typescript
import { useParseShiftImage } from '../presentation/hooks';

function MyComponent() {
  const { parseImage, loading, error } = useParseShiftImage();

  const handleParse = async (base64: string, filename: string) => {
    const result = await parseImage(base64, filename, 2026);

    if (result) {
      console.log(`Extracted ${result.extractedCount} shifts`);
      console.log('Events:', result.events);
    }
  };

  return loading ? <Spinner /> : <button onClick={handleParse}>Parse</button>;
}
```

#### 3. イベントの一括登録

```typescript
import { useRegisterEvents } from '../presentation/hooks';

function MyComponent() {
  const { registerEvents, loading, error } = useRegisterEvents();

  const handleRegister = async (events: ShiftEventDTO[], token: string) => {
    const result = await registerEvents(events, token);

    if (result) {
      if (result.isFullSuccess()) {
        alert(`All ${result.successCount} events registered!`);
      } else {
        alert(`${result.successCount}/${result.totalCount} events registered`);
        console.error('Errors:', result.errors);
      }
    }
  };

  return <button onClick={handleRegister}>Register to Calendar</button>;
}
```

### DI Container の初期化

アプリケーションの起動時に DI Container を初期化します。

```typescript
// src/main.tsx または App.tsx
import { initializeContainer } from './di/container';

// Gemini API Key を取得（LocalStorage から）
const apiKey = localStorage.getItem('geminiApiKey') || '';

// DI Container を初期化
initializeContainer(apiKey);
```

## 🎓 学習リソース

リファクタリングされたコードを理解するために、以下のドキュメントを参照してください：

1. **[アーキテクチャ設計](../docs/ARCHITECTURE.md)** - 全体的なアーキテクチャの説明
2. **[コーディング規約](./../.claude/commands/coding-rule.md)** - コーディングルールとパターン
3. **Claude Code スキルコマンド** (`.claude/commands/`)
   - `/architecture-review` - アーキテクチャレビュー
   - `/add-usecase` - Use Case 追加
   - `/add-domain-entity` - Domain Entity 追加

## ✨ 主な改善点

### Before → After

| 項目 | Before | After |
|------|--------|-------|
| **アーキテクチャ** | 単一レイヤー、密結合 | 4層アーキテクチャ、疎結合 |
| **ビジネスロジック** | Pages/Components に散在 | Domain Layer に集約 |
| **テスタビリティ** | 低（外部依存が直接）| 高（DI でモック可能）|
| **保守性** | 低（変更の影響範囲が大きい）| 高（レイヤー分離により限定的）|
| **拡張性** | 低（新機能追加が困難）| 高（Use Case を追加するだけ）|
| **型安全性** | 中（any 型が散在）| 高（Result パターン、厳密な型定義）|
| **エラーハンドリング** | try-catch のみ | Result パターン + Domain Errors |

## 🚀 次回の開発で...

新しい機能を追加する際は、以下の手順に従います：

1. **ドメインモデルの定義** - Entity/Value Object を作成
2. **リポジトリの定義** - データアクセスのインターフェースを作成
3. **Use Case の実装** - ビジネスロジックを実装
4. **Infrastructure の実装** - API Client/Repository の具象クラスを実装
5. **カスタムフックの作成** - Use Case を呼び出すフックを作成
6. **UI の実装** - Page/Component でフックを使用

詳細は `.claude/commands/add-usecase.md` と `.claude/commands/add-domain-entity.md` を参照してください。

---

**作成日**: 2026-01-10
**対象バージョン**: v1.0.0（リファクタリング完了時点）
