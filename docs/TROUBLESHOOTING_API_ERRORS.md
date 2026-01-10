# API エラーのトラブルシューティング

**作成日**: 2026-01-10

このドキュメントは、Google Calendar API と Gemini API で発生する 403 エラーの解決方法を説明します。

---

## 🔴 エラー 1: Gemini API 403 Forbidden

### エラーメッセージ

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent 403 (Forbidden)
```

### 原因

- Gemini API Key が未設定、または無効です
- API Key が LocalStorage に保存されていません

### 解決方法

#### 1. Gemini API Key を取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. API Key をコピー

#### 2. アプリケーションで API Key を設定

1. アプリケーションで「API Key 設定」ページに移動
2. コピーした Gemini API Key を入力
3. 「次へ進む」をクリック

#### 3. LocalStorage を確認（開発者向け）

ブラウザの開発者ツールで LocalStorage を確認：

```javascript
// Console で実行
localStorage.getItem('gemini_api_key')
```

値が null または空の場合は、API Key が保存されていません。

---

## 🔴 エラー 2: Google Calendar API 403 Permission Denied

### エラーメッセージ

```json
{
  "error": {
    "code": 403,
    "message": "Method doesn't allow unregistered callers (callers without established identity). Please use API Key or other form of API consumer identity to call this API.",
    "status": "PERMISSION_DENIED"
  }
}
```

### 原因

Google Calendar API のバッチエンドポイントが以下のいずれかを要求しています：

1. **Google Cloud API Key が未設定**（プロジェクトによっては必須）
2. **OAuth トークンが無効または期限切れ**
3. **Calendar API が有効化されていない**
4. **OAuth スコープが不足**

### 解決方法

#### ステップ 1: Google Cloud Console でプロジェクトを確認

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 該当プロジェクトを選択

#### ステップ 2: Calendar API を有効化

1. 「APIとサービス」→「ライブラリ」に移動
2. "Google Calendar API" を検索
3. 「有効にする」をクリック（既に有効な場合はスキップ）

#### ステップ 3: Google API Key を作成（推奨）

Calendar API のバッチエンドポイントは、プロジェクトによっては API Key を要求します。

1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「APIキー」をクリック
3. 作成された API Key をコピー
4. **重要**: 「キーを制限」をクリックして以下を設定：
   - **アプリケーションの制限**: HTTP リファラー（推奨）
     - 許可するリファラー: `https://your-domain.com/*`（本番環境）
     - 開発環境: `http://localhost:*` も追加
   - **API の制限**: 「キーを制限」を選択
     - Google Calendar API のみを許可
5. 「保存」をクリック

#### ステップ 4: .env ファイルに API Key を追加

`.env` ファイルを編集（またはコピー）：

```bash
# .env.example から .env にコピー
cp .env.example .env
```

`.env` ファイルに以下を追加：

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-google-api-key-here
```

#### ステップ 5: OAuth 2.0 認証情報を確認

1. 「APIとサービス」→「認証情報」に移動
2. OAuth 2.0 クライアント ID を選択
3. **承認済みの JavaScript 生成元** を確認：
   - `http://localhost:5173`（開発環境）
   - `https://your-production-domain.com`（本番環境）
4. **承認済みのリダイレクト URI** を確認：
   - `http://localhost:5173`
   - `https://your-production-domain.com`

#### ステップ 6: OAuth 同意画面を確認

1. 「APIとサービス」→「OAuth 同意画面」に移動
2. **スコープ** セクションで以下が含まれていることを確認：
   - `https://www.googleapis.com/auth/calendar.events`（イベントの作成・編集）
   - `https://www.googleapis.com/auth/userinfo.profile`（ユーザープロフィール）

3. **テストユーザー**（外部アプリの場合）:
   - 使用する Google アカウントを「テストユーザー」に追加

#### ステップ 7: アプリケーションを再起動

```bash
# 開発サーバーを再起動
npm run dev
```

#### ステップ 8: 再度ログイン

1. アプリケーションで一度ログアウト
2. 再度 Google アカウントでログイン
3. OAuth スコープの確認画面で「許可」をクリック

---

## 🔍 デバッグ方法

### 1. アクセストークンの確認

ブラウザの開発者ツールで SessionStorage を確認：

```javascript
// Console で実行
const storageKey = 'gcal-snap-importer-storage';
const storage = JSON.parse(sessionStorage.getItem(storageKey));
console.log('Access Token:', storage?.state?.accessToken);
```

トークンが null または undefined の場合は、ログインしていません。

### 2. ネットワークタブでエラー詳細を確認

1. 開発者ツールの「ネットワーク」タブを開く
2. イベント登録を実行
3. 失敗したリクエストをクリック
4. 「レスポンス」タブでエラーメッセージの詳細を確認

### 3. OAuth スコープの確認

アプリケーションのコードで要求しているスコープを確認：

```typescript
// src/pages/AuthPage.tsx
const login = useGoogleLogin({
  scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile',
});
```

このスコープが OAuth 同意画面で設定されているものと一致することを確認してください。

---

## 🛠️ よくある問題と解決策

### 問題 1: "Access blocked: This app's request is invalid"

**原因**: OAuth 同意画面が未設定または不完全

**解決策**:
1. OAuth 同意画面で「アプリ名」「ユーザーサポートメール」「デベロッパーの連絡先情報」を設定
2. 外部アプリの場合は、自分のアカウントを「テストユーザー」に追加

### 問題 2: "This app isn't verified"

**原因**: アプリが Google の確認プロセスを完了していない

**解決策**:
- 開発中は「詳細」→「（アプリ名）に移動（安全ではありません）」をクリックして続行
- 本番環境では、Google の確認プロセスを完了する

### 問題 3: API Key を設定したのにまだ 403 エラーが出る

**原因**:
- API Key の制限設定が間違っている
- ブラウザキャッシュ
- 環境変数が反映されていない

**解決策**:
1. API Key の制限を一時的に「なし」に設定してテスト
2. ブラウザのキャッシュをクリア
3. 開発サーバーを完全に再起動：
   ```bash
   # Ctrl+C で停止
   npm run dev
   ```
4. `.env` ファイルが正しく読み込まれているか確認：
   ```javascript
   console.log('API Key:', import.meta.env.VITE_GOOGLE_API_KEY);
   ```

### 問題 4: ローカル開発では動くが、デプロイ後に 403 エラー

**原因**:
- GitHub Secrets に環境変数が設定されていない
- 本番ドメインが OAuth 認証情報に追加されていない

**解決策**:
1. GitHub リポジトリの「Settings」→「Secrets and variables」→「Actions」
2. `VITE_GOOGLE_CLIENT_ID` と `VITE_GOOGLE_API_KEY` を追加
3. Google Cloud Console で本番ドメインを「承認済みの JavaScript 生成元」に追加

---

## ✅ 確認チェックリスト

すべて ✅ になれば、API エラーは解決するはずです：

### Gemini API
- [ ] Gemini API Key を取得済み
- [ ] アプリケーションで API Key を設定済み
- [ ] LocalStorage に `gemini_api_key` が保存されている

### Google Calendar API
- [ ] Google Cloud プロジェクトを作成済み
- [ ] Calendar API を有効化済み
- [ ] Google API Key を作成済み（推奨）
- [ ] `.env` ファイルに `VITE_GOOGLE_API_KEY` を設定済み
- [ ] OAuth 2.0 クライアント ID を作成済み
- [ ] `.env` ファイルに `VITE_GOOGLE_CLIENT_ID` を設定済み
- [ ] 承認済みの JavaScript 生成元を設定済み
- [ ] OAuth 同意画面で必要なスコープを追加済み
- [ ] テストユーザーを追加済み（外部アプリの場合）
- [ ] 開発サーバーを再起動済み
- [ ] アプリケーションで再ログイン済み

---

## 📚 参考リンク

- [Google AI Studio - API Key](https://aistudio.google.com/app/apikey)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Calendar API ドキュメント](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 の設定](https://developers.google.com/identity/protocols/oauth2)
- [API Key の制限設定](https://cloud.google.com/docs/authentication/api-keys#securing_an_api_key)

---

**最終更新**: 2026-01-10
