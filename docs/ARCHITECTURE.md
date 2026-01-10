# Architecture Documentation

このドキュメントは、GCal Snap Importer の **DDD (Domain-Driven Design)** と **クリーンアーキテクチャ** に基づいた設計を説明します。

## 目次

1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [レイヤー構成](#レイヤー構成)
3. [ドメイン境界](#ドメイン境界)
4. [依存関係のルール](#依存関係のルール)
5. [ディレクトリ構造](#ディレクトリ構造)
6. [主要なパターン](#主要なパターン)

## アーキテクチャ概要

本プロジェクトは、**クリーンアーキテクチャ** と **DDD** の原則に従い、以下の目標を達成します：

- **ビジネスロジックの独立性**: ドメイン層は外部依存を持たず、フレームワークやライブラリから独立
- **テスタビリティ**: 各レイヤーが明確に分離され、モックやスタブを使った単体テストが容易
- **保守性**: 関心の分離により、変更の影響範囲が限定的
- **拡張性**: 新しい機能やドメインを追加しやすい設計

## レイヤー構成

```
┌─────────────────────────────────────────────┐
│   Presentation Layer (UI)                   │
│   - React Components                        │
│   - Pages, Custom Hooks                     │
└─────────────────────────────────────────────┘
                    ↓ (depends on)
┌─────────────────────────────────────────────┐
│   Application Layer                         │
│   - Use Cases                               │
│   - DTOs, Application Services              │
└─────────────────────────────────────────────┘
                    ↓ (depends on)
┌─────────────────────────────────────────────┐
│   Domain Layer (Core Business Logic)        │
│   - Entities, Value Objects                 │
│   - Domain Services (Interfaces)            │
│   - Repositories (Interfaces)               │
└─────────────────────────────────────────────┘
                    ↑ (implements)
┌─────────────────────────────────────────────┐
│   Infrastructure Layer                      │
│   - API Clients (Gemini, Google Calendar)   │
│   - Repository Implementations              │
│   - External Service Adapters               │
└─────────────────────────────────────────────┘
```

### 1. Domain Layer（ドメイン層）

**責務**: ビジネスロジックの中核

- **Entities**: 識別子を持つドメインオブジェクト（例: `ShiftEvent`, `UserSession`）
- **Value Objects**: 値で識別されるイミュータブルなオブジェクト（例: `ShiftType`, `APIKey`）
- **Domain Services**: エンティティに属さないビジネスロジック（例: `IShiftExtractionService`）
- **Repositories**: データアクセスの抽象化（インターフェースのみ）
- **Domain Errors**: ドメイン固有の例外

**ルール**:
- ❌ 外部ライブラリに依存しない（React, Gemini SDK など）
- ✅ Pure TypeScript のみを使用
- ✅ すべてイミュータブル（不変）

### 2. Application Layer（アプリケーション層）

**責務**: ユースケースの実行とオーケストレーション

- **Use Cases**: 各機能の実行ロジック（例: `LoginUseCase`, `ParseShiftImageUseCase`）
- **DTOs**: レイヤー間のデータ転送オブジェクト
- **Application Services**: ユースケースの調整役

**ルール**:
- ✅ ドメイン層のインターフェースに依存
- ❌ Infrastructure 層の具象クラスに直接依存しない
- ✅ DTOでドメインオブジェクトと外部データを変換

### 3. Infrastructure Layer（インフラストラクチャ層）

**責務**: 外部システムとの統合

- **API Clients**: 外部API呼び出し（例: `GeminiShiftExtractionService`, `GoogleCalendarService`）
- **Repository Implementations**: データ永続化（例: `SessionStorageUserSessionRepository`）
- **External Service Adapters**: サードパーティサービスのラッパー

**ルール**:
- ✅ ドメイン層のインターフェースを実装
- ✅ 外部ライブラリの詳細を隠蔽

### 4. Presentation Layer（プレゼンテーション層）

**責務**: ユーザーインターフェース

- **Pages**: ルートコンポーネント
- **Components**: 再利用可能なUIコンポーネント
- **Custom Hooks**: プレゼンテーションロジックとUse Caseの呼び出し

**ルール**:
- ❌ ビジネスロジックを持たない
- ✅ Use CaseをCustom Hooksでラップして呼び出す
- ✅ DTOを使用してデータを表示

## ドメイン境界

本プロジェクトは、以下の **6つの Bounded Context** で構成されます：

### 1. Authentication Context（認証）

**責務**: ユーザー認証とセッション管理

- **Entities**: `UserSession`
- **Value Objects**: `UserProfile`
- **Services**: `IAuthenticationService`
- **Repositories**: `IUserSessionRepository`
- **Use Cases**: `LoginUseCase`, `LogoutUseCase`

### 2. Shift Parsing Context（シフト解析）

**責務**: 画像からシフト情報を抽出

- **Entities**: `ShiftImage`, `ExtractedShift`, `ExtractedShiftSchedule`
- **Value Objects**: `ShiftSymbol`, `ShiftDate`
- **Services**: `IShiftExtractionService`
- **Repositories**: `IShiftRepository`
- **Use Cases**: `ParseShiftImageUseCase`

### 3. Event Management Context（イベント管理）

**責務**: シフトイベントの編集・管理

- **Entities**: `ShiftEvent`
- **Value Objects**: `ShiftType`, `TimeWindow`
- **Repositories**: `IEventRepository`

### 4. Calendar Integration Context（カレンダー連携）

**責務**: Google Calendar との同期

- **Entities**: `CalendarEventBatch`
- **Value Objects**: `RegistrationResult`
- **Services**: `ICalendarService`
- **Use Cases**: `RegisterEventsUseCase`

### 5. Configuration Context（設定管理）

**責務**: アプリケーション設定の管理

- **Entities**: `AppConfiguration`
- **Value Objects**: `APIKey`

### 6. Workflow Context（ワークフロー管理）

**責務**: マルチステップウィザードの制御

- **Value Objects**: `WorkflowStep`

## 依存関係のルール

### 依存性逆転の原則 (DIP)

```
Presentation → Application → Domain ← Infrastructure
```

- **上位レイヤーは下位レイヤーに依存してはならない**
- すべてのレイヤーは **Domain Layer の抽象（インターフェース）に依存**
- Infrastructure Layer は Domain Layer のインターフェースを実装

### 禁止事項

- ❌ Domain Layer が外部ライブラリに依存すること
- ❌ Application Layer が Infrastructure の具象クラスに直接依存すること
- ❌ Presentation Layer がビジネスロジックを持つこと

### 依存性の注入 (DI)

```typescript
// DIコンテナで依存関係を解決
const container = initializeContainer(geminiApiKey);

const loginUseCase = container.resolve<LoginUseCase>('LoginUseCase');
```

## ディレクトリ構造

```
src/
├── shared/
│   └── domain/              # 共通ドメインオブジェクト
│       ├── Entity.ts        # Entity 基底クラス
│       ├── ValueObject.ts   # ValueObject 基底クラス
│       ├── Result.ts        # Result パターン
│       └── DomainError.ts   # ドメインエラー基底クラス
│
├── domain/                  # ドメイン層
│   ├── authentication/
│   │   ├── entity/          # UserSession.entity.ts
│   │   ├── value-object/    # UserProfile.vo.ts
│   │   ├── service/         # IAuthenticationService.ts
│   │   ├── repository/      # IUserSessionRepository.ts
│   │   └── error/           # AuthenticationError.ts
│   │
│   ├── shift-parsing/
│   ├── event-management/
│   ├── calendar-integration/
│   ├── configuration/
│   └── workflow/
│
├── application/             # アプリケーション層
│   ├── base/
│   │   └── UseCase.ts       # UseCase インターフェース
│   ├── use-case/
│   │   ├── LoginUseCase.ts
│   │   ├── ParseShiftImageUseCase.ts
│   │   └── RegisterEventsUseCase.ts
│   └── dto/
│       ├── ShiftEventDTO.ts
│       └── UserProfileDTO.ts
│
├── infrastructure/          # インフラストラクチャ層
│   ├── api/
│   │   ├── GeminiShiftExtractionService.ts
│   │   ├── GoogleCalendarService.ts
│   │   └── GoogleAuthenticationService.ts
│   └── repository/
│       └── SessionStorageUserSessionRepository.ts
│
├── di/
│   └── container.ts         # DI コンテナ
│
└── presentation/            # プレゼンテーション層
    ├── pages/               # ルートコンポーネント
    ├── components/          # 再利用可能なUIコンポーネント
    └── hooks/               # カスタムフック
```

## 主要なパターン

### 1. Result パターン

エラーハンドリングを型安全に行うため、Result パターンを採用：

```typescript
const result = await useCase.execute(input);

if (result.isSuccess) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

### 2. Repository パターン

データアクセスを抽象化：

```typescript
// Domain Layer (Interface)
export interface IUserSessionRepository {
  save(session: UserSession): Promise<Result<void, Error>>;
  findCurrent(): Promise<Result<UserSession | null, Error>>;
}

// Infrastructure Layer (Implementation)
export class SessionStorageUserSessionRepository implements IUserSessionRepository {
  // 実装...
}
```

### 3. Use Case パターン

各機能を単一責任のユースケースとして実装：

```typescript
export class LoginUseCase implements UseCase<LoginUseCaseInput, LoginUseCaseOutput> {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly sessionRepository: IUserSessionRepository,
  ) {}

  async execute(input: LoginUseCaseInput): Promise<Result<LoginUseCaseOutput, Error>> {
    // ユースケースロジック
  }
}
```

### 4. DTO (Data Transfer Object) パターン

レイヤー間のデータ変換：

```typescript
// DTO
export interface ShiftEventDTO {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
}

// Mapper
export class ShiftEventMapper {
  static toDTO(entity: ShiftEvent): ShiftEventDTO { /* ... */ }
  static toDomain(dto: ShiftEventDTO): ShiftEvent { /* ... */ }
}
```

## まとめ

このアーキテクチャにより、以下の利点が得られます：

- ✅ **ビジネスロジックの保護**: ドメイン層が外部から独立
- ✅ **テストの容易性**: モックを使った単体テストが簡単
- ✅ **変更の影響範囲の限定**: レイヤー分離により変更が局所的
- ✅ **長期的な保守性**: 明確な構造により新規参加者も理解しやすい

詳細なコーディングルールは [.claude/commands/coding-rule.md](../.claude/commands/coding-rule.md) を参照してください。
