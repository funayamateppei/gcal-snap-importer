---
description: Coding rules and conventions for GCal Snap Importer project
---

# Coding Rules - GCal Snap Importer

このプロジェクトは **DDD (Domain-Driven Design)** と **クリーンアーキテクチャ** の原則に従います。

> **Note**: このドキュメントはプロジェクト全体のコーディング規約を定義します。
> Claude Code のスキルコマンドとしても利用できます: `/coding-rule`

## アーキテクチャ原則

### レイヤー構造

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI)           │ ← React Components, Pages, Hooks
├─────────────────────────────────────┤
│   Application Layer                 │ ← Use Cases, DTOs, Application Services
├─────────────────────────────────────┤
│   Domain Layer                      │ ← Entities, Value Objects, Domain Services
├─────────────────────────────────────┤
│   Infrastructure Layer              │ ← API Clients, Repositories, External Services
└─────────────────────────────────────┘
```

### 依存関係のルール

1. **依存性逆転の原則 (DIP)**
   - 上位レイヤーは下位レイヤーに依存してはならない
   - すべてのレイヤーは Domain Layer の抽象（インターフェース）に依存する
   - Infrastructure Layer は Domain Layer のインターフェースを実装する

2. **依存の方向**
   ```
   Presentation → Application → Domain ← Infrastructure
   ```

3. **禁止事項**
   - ❌ Domain Layer が外部ライブラリに依存すること
   - ❌ Application Layer が Infrastructure の具象クラスに直接依存すること
   - ❌ Presentation Layer がビジネスロジックを持つこと

## ドメイン境界 (Bounded Contexts)

### 1. Authentication Context
- **責務**: ユーザー認証、セッション管理
- **主要エンティティ**: `UserSession`
- **主要サービス**: `AuthenticationService`, `UserProfileService`

### 2. ShiftParsing Context
- **責務**: 画像からシフト情報を抽出
- **主要エンティティ**: `ShiftImage`, `ExtractedShiftSchedule`
- **主要 Value Objects**: `ShiftSymbol`
- **主要サービス**: `ShiftExtractionService`

### 3. EventManagement Context
- **責務**: シフトイベントの編集・管理
- **主要エンティティ**: `ShiftEvent`
- **主要 Value Objects**: `ShiftType`, `TimeWindow`
- **主要サービス**: `EventEditingService`

### 4. CalendarIntegration Context
- **責務**: Google Calendar との同期
- **主要エンティティ**: `CalendarEventBatch`
- **主要サービス**: `CalendarRegistrationService`

### 5. Configuration Context
- **責務**: アプリケーション設定の管理
- **主要エンティティ**: `AppConfiguration`

### 6. Workflow Context
- **責務**: マルチステップウィザードの制御
- **主要 Value Objects**: `WorkflowStep`
- **主要サービス**: `WorkflowOrchestrator`

## コーディング規約

### TypeScript

#### 1. 型定義
```typescript
// ✅ Good: Domain の Value Object として定義
class ShiftSymbol {
  private constructor(private readonly value: 'A' | 'B' | 'C' | 'OTHER') {}

  static create(value: string): Result<ShiftSymbol, Error> {
    // バリデーション
  }

  getValue(): string {
    return this.value;
  }
}

// ❌ Bad: プリミティブ型を直接使用
type ShiftSymbol = 'A' | 'B' | 'C' | 'OTHER';
```

#### 2. エラーハンドリング
```typescript
// ✅ Good: Result パターンまたはドメイン例外
class ShiftExtractionFailedError extends DomainError {
  constructor(message: string) {
    super('SHIFT_EXTRACTION_FAILED', message);
  }
}

// Use Case での使用例
async execute(image: ShiftImage): Promise<Result<ExtractedShiftSchedule, ShiftExtractionFailedError>> {
  try {
    const schedule = await this.shiftExtractionService.extract(image);
    return Result.ok(schedule);
  } catch (error) {
    return Result.fail(new ShiftExtractionFailedError(error.message));
  }
}

// ❌ Bad: 汎用的な Error をスロー
throw new Error('Failed to extract shift');
```

#### 3. 不変性
```typescript
// ✅ Good: イミュータブルなエンティティ
class ShiftEvent {
  private constructor(
    private readonly summary: string,
    private readonly start: Date,
    private readonly end: Date,
  ) {}

  // 新しいインスタンスを返す
  updateSummary(newSummary: string): ShiftEvent {
    return new ShiftEvent(newSummary, this.start, this.end);
  }
}

// ❌ Bad: ミュータブルなプロパティ
class ShiftEvent {
  summary: string;
  start: Date;

  updateSummary(newSummary: string): void {
    this.summary = newSummary; // 状態変更
  }
}
```

### ファイル命名規則

```
src/
├── domain/
│   ├── {context}/
│   │   ├── entity/        # PascalCase + .entity.ts
│   │   ├── value-object/  # PascalCase + .vo.ts
│   │   ├── service/       # PascalCase + .service.ts
│   │   ├── repository/    # PascalCase + .repository.ts (interface)
│   │   └── error/         # PascalCase + .error.ts
│
├── application/
│   ├── use-case/          # PascalCase + .usecase.ts
│   └── dto/               # PascalCase + .dto.ts
│
├── infrastructure/
│   ├── api/               # PascalCase + .client.ts
│   └── repository/        # PascalCase + .repository.impl.ts
│
└── presentation/
    ├── pages/             # PascalCase + Page.tsx
    └── components/        # PascalCase + .tsx
```

### Use Case パターン

```typescript
// ✅ Good: Single Responsibility
export class ParseShiftImageUseCase {
  constructor(
    private readonly shiftExtractionService: ShiftExtractionService,
    private readonly shiftRepository: ShiftRepository,
  ) {}

  async execute(input: ParseShiftImageInput): Promise<ParseShiftImageOutput> {
    // 1. バリデーション
    const image = ShiftImage.create(input.base64Data);
    if (image.isFailure) {
      throw new ValidationError(image.error);
    }

    // 2. ドメインサービス呼び出し
    const schedule = await this.shiftExtractionService.extract(image.value);

    // 3. 永続化
    await this.shiftRepository.save(schedule);

    // 4. DTO に変換して返却
    return ParseShiftImageOutput.from(schedule);
  }
}

// ❌ Bad: Use Case が複数の責務を持つ
export class ManageShiftsUseCase {
  async parseImage() { /* ... */ }
  async editEvent() { /* ... */ }
  async registerToCalendar() { /* ... */ }
}
```

### Repository パターン

```typescript
// Domain Layer (interface)
export interface ShiftRepository {
  save(schedule: ExtractedShiftSchedule): Promise<void>;
  findAll(): Promise<ExtractedShiftSchedule[]>;
}

// Infrastructure Layer (implementation)
export class LocalStorageShiftRepository implements ShiftRepository {
  async save(schedule: ExtractedShiftSchedule): Promise<void> {
    const dto = ExtractedShiftScheduleDTO.from(schedule);
    localStorage.setItem('shifts', JSON.stringify(dto));
  }

  async findAll(): Promise<ExtractedShiftSchedule[]> {
    const data = localStorage.getItem('shifts');
    if (!data) return [];
    const dto = JSON.parse(data);
    return ExtractedShiftSchedule.fromDTO(dto);
  }
}
```

### Dependency Injection

```typescript
// ✅ Good: Constructor Injection
class RegisterEventsUseCase {
  constructor(
    private readonly calendarService: CalendarRegistrationService,
    private readonly eventRepository: EventRepository,
  ) {}
}

// Application 層で DI コンテナを使用
const useCase = new RegisterEventsUseCase(
  new GoogleCalendarService(apiClient),
  new LocalStorageEventRepository(),
);

// ❌ Bad: 具象クラスへの直接依存
class RegisterEventsUseCase {
  private calendarService = new GoogleCalendarService(); // ハードコーディング
}
```

### React Components (Presentation Layer)

#### 1. Presentational vs Container
```typescript
// ✅ Good: Presentational Component (純粋なUI)
type EventListProps = {
  events: ShiftEventDTO[];
  onEdit: (eventId: string) => void;
  onDelete: (eventId: string) => void;
};

export const EventList: React.FC<EventListProps> = ({ events, onEdit, onDelete }) => {
  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

// ✅ Good: Container Component (Use Case 呼び出し)
export const EventListContainer: React.FC = () => {
  const { events, editEvent, deleteEvent } = useEventManagement(); // Custom Hook

  return (
    <EventList
      events={events}
      onEdit={editEvent}
      onDelete={deleteEvent}
    />
  );
};

// ❌ Bad: ビジネスロジックが混在
export const EventList: React.FC = () => {
  const [events, setEvents] = useState([]);

  const handleDelete = (id: string) => {
    // ❌ コンポーネント内でビジネスロジック
    const filtered = events.filter(e => e.id !== id);
    setEvents(filtered);
    localStorage.setItem('events', JSON.stringify(filtered));
  };
};
```

#### 2. Custom Hooks でユースケースをラップ
```typescript
// ✅ Good: Use Case を呼び出すカスタムフック
export const useEventManagement = () => {
  const [events, setEvents] = useState<ShiftEventDTO[]>([]);

  const editEvent = useCallback(async (eventId: string, summary: string) => {
    const useCase = container.resolve(EditEventUseCase);
    const result = await useCase.execute({ eventId, summary });

    if (result.isSuccess) {
      setEvents(result.value.events);
    }
  }, []);

  return { events, editEvent };
};
```

### テスト戦略

```typescript
// Domain Layer: 単体テスト（外部依存なし）
describe('ShiftEvent', () => {
  it('should create valid shift event', () => {
    const event = ShiftEvent.create({
      summary: '早番',
      start: new Date('2025-01-10T09:30:00+09:00'),
      end: new Date('2025-01-10T19:00:00+09:00'),
    });

    expect(event.isSuccess).toBe(true);
  });
});

// Application Layer: Use Case テスト（モックを使用）
describe('ParseShiftImageUseCase', () => {
  it('should extract shift events from image', async () => {
    const mockService = {
      extract: jest.fn().mockResolvedValue(mockSchedule),
    };

    const useCase = new ParseShiftImageUseCase(mockService, mockRepository);
    const result = await useCase.execute({ base64Data: 'mock' });

    expect(result.events).toHaveLength(3);
  });
});
```

## コードレビューチェックリスト

### ドメイン層
- [ ] エンティティは不変か？
- [ ] ビジネスルールはドメインサービスに実装されているか？
- [ ] 外部ライブラリへの依存はないか？
- [ ] バリデーションはエンティティ/Value Object で行われているか？

### アプリケーション層
- [ ] Use Case は単一責任か？
- [ ] DTOでデータ変換されているか？
- [ ] インターフェースに依存しているか（具象クラスではなく）？

### インフラ層
- [ ] Repository は Domain の interface を実装しているか？
- [ ] API Client は適切にエラーハンドリングしているか？

### プレゼンテーション層
- [ ] コンポーネントはビジネスロジックを持っていないか？
- [ ] Use Case はカスタムフックでラップされているか？
- [ ] Presentational/Container の分離ができているか？

## 追加のベストプラクティス

### 型安全性 (Type Safety)
- ❌ `any` 型の使用は厳禁（DIコンテナなど正当な理由がある場合は `eslint-disable-next-line` でコメント）
- ❌ `unknown` 型や型アサーション (`as Type`) の使用を避ける
- ✅ 型ガード関数やZodなどのバリデーションライブラリを使用
- ✅ TypeScript の `strict` モードを有効化
- ✅ 型インポートは `import type { ... }` を使用（`verbatimModuleSyntax` 対応）

### React ベストプラクティス
- ✅ 関数コンポーネントのみを使用（クラスコンポーネント禁止）
- ✅ フックのルールに従う（条件付きフック禁止）
- ✅ `useEffect` の依存配列を正確に指定
- ✅ 複雑なロジックはカスタムフックに切り出す

### スタイリング
- ✅ Tailwind CSS のユーティリティクラスを使用
- ✅ モバイルファーストのブレークポイント（`md:`, `lg:`）を使用
- ❌ インラインスタイルの使用を避ける

### セキュリティ
- ⚠️ API キーはクライアントサイドの `localStorage` のみに保存
- ❌ APIキーやシークレットをGitにコミットしない
- ✅ OAuth には公式 SDK（Google Identity Services）を使用

## 参考資料

- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript DDD Example](https://github.com/stemmlerjs/ddd-forum)
- [React Best Practices](https://react.dev/learn)
- [Tailwind CSS](https://tailwindcss.com/docs)
