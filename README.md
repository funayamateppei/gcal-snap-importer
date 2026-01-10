# GCal Snap Importer

シフト表の画像を読み取り、AI (Gemini) で解析して Google カレンダーに一括登録する Web アプリケーション。
Backend を持たず、Frontend (React/TypeScript) のみで動作します。

**アーキテクチャ**: [DDD (Domain-Driven Design)](https://www.domainlanguage.com/ddd/) と [クリーンアーキテクチャ](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) に基づいて設計されています。

📖 **詳細なドキュメント**:
- [アーキテクチャ設計](./docs/ARCHITECTURE.md)
- [コーディング規約](./.claude/commands/coding-rule.md)

## 主な機能 (Features)

1.  **Google 認証**:
    - Google アカウントでログインし、Google カレンダーへの予定作成権限を取得します。
2.  **Gemini API 利用**:
    - 画像解析のために Google Gemini API を使用します。
    - API Key はユーザー自身が入力し、ブラウザの LocalStorage に暗号化せず保存します（Client-side only）。
3.  **シフト表解析**:
    - アップロードされたシフト表画像を Gemini に送信します。
    - 特定のルール（「長與」列の抽出、A/B/C 記号のシフト変換）に基づいて JSON データを生成します。
4.  **プレビュー & 編集**:
    - 解析結果（日付、タイトル、開始・終了時刻）をリストまたはカレンダー形式でプレビュー表示します。
    - 登録前に内容を修正可能です。
5.  **カレンダー登録**:
    - 確定した予定を Google カレンダーに一括登録します。

## 技術スタック (Tech Stack)

### Frontend
- **Framework**: React 19, Vite
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Styling**: Tailwind CSS 4.1, PostCSS
- **State Management**: Zustand
- **Routing**: React Router v7
- **Validation**: Zod

### Architecture
- **Design Pattern**: DDD (Domain-Driven Design), Clean Architecture
- **Dependency Injection**: Custom DI Container
- **Error Handling**: Result Pattern

### External Services
- **AI**: Google Generative AI SDK (Gemini 2.5 Flash)
- **Auth**: Google OAuth (@react-oauth/google)
- **Calendar**: Google Calendar API v3

## 解析ルール (Analysis Rules)

- **ターゲット**: 「長與」列のシフト記号
- **シフト定義**:
  - A: 早番 (09:30 - 19:00)
  - B: 中番 (10:30 - 20:00)
  - C: 遅番 (11:30 - 21:00)
  - その他 (所, 法, 指, 公, 休 など): 登録しない（無視）

## 開発フロー

1.  `npm install`
2.  `npm run dev`でローカルサーバー起動

## プロジェクト構成

```
src/
├── shared/domain/           # 共通ドメインオブジェクト (Entity, ValueObject, Result)
├── domain/                  # ドメイン層（6つの Bounded Context）
│   ├── authentication/      # 認証コンテキスト
│   ├── shift-parsing/       # シフト解析コンテキスト
│   ├── event-management/    # イベント管理コンテキスト
│   ├── calendar-integration/# カレンダー連携コンテキスト
│   ├── configuration/       # 設定管理コンテキスト
│   └── workflow/            # ワークフローコンテキスト
├── application/             # アプリケーション層 (Use Cases, DTOs)
├── infrastructure/          # インフラストラクチャ層 (API Clients, Repositories)
├── presentation/            # プレゼンテーション層 (React Components)
└── di/                      # Dependency Injection Container
```

詳細は [アーキテクチャドキュメント](./docs/ARCHITECTURE.md) を参照してください。

## サンプルデータ

シフト表のサンプル画像は `sample/` ディレクトリに配置されています。
動作確認やテストに使用してください。詳細は [`sample/README.md`](./sample/README.md) を参照してください。

## 開発ガイド

### カスタムフックの使用

このプロジェクトは DDD/クリーンアーキテクチャに基づいており、ビジネスロジックは Use Case として実装されています。
UI コンポーネントから Use Case を呼び出す際は、専用のカスタムフックを使用してください。

**利用可能なフック** (`src/presentation/hooks/`):
- `useLogin()` - ログイン処理
- `useLogout()` - ログアウト処理
- `useParseShiftImage()` - シフト画像の解析
- `useRegisterEvents()` - イベントの一括登録

**使用例**:
```typescript
import { useLogin } from '../presentation/hooks';

function AuthPage() {
  const { login, loading, error } = useLogin();

  const handleLogin = async (accessToken: string) => {
    const profile = await login(accessToken);
    if (profile) {
      console.log('Logged in:', profile.name);
    }
  };

  return <button onClick={() => handleLogin(token)}>Login</button>;
}
```

詳細は [リファクタリングサマリー](./docs/REFACTORING_SUMMARY.md) を参照してください。

## Claude への開発ガイドライン

このプロジェクトでは、Claude (AI) が開発作業を行う際に参照するガイドラインを [CLAUDE.md](./CLAUDE.md) に記載しています。

CLAUDE.md には以下の内容が含まれています：
- **マネージャー/オーケストレーター原則**: Claude は直接実装せず、Task agent に委託する
- **PDCA サイクル**: Plan-Do-Check-Act による品質保証
- **並列処理**: 独立したタスクは並列で実行
- **作業別ガイドライン**: Domain Entity, Use Case, Repository, Infrastructure Service, Custom Hook, Test, Component Refactoring, Domain Review, Architecture Review の9つのガイドライン

### 利用可能なスラッシュコマンド

Claude Code のスラッシュコマンドとして以下が利用可能です：
- `/architecture-review` - アーキテクチャ全体のレビュー
- `/coding-rule` - コーディング規約の確認
- `/add-domain-entity` - 新しいドメインエンティティの追加
- `/add-usecase` - 新しいユースケースの追加

詳細は `.claude/commands/` ディレクトリを参照してください。
