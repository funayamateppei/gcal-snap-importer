/**
 * Dependency Injection Container
 * すべての依存関係を管理し、ユースケースとサービスのインスタンスを提供
 */

// Domain Services & Repositories (Interfaces)
import type { IAuthenticationService } from '../domain/authentication/service/IAuthenticationService';
import type { IUserSessionRepository } from '../domain/authentication/repository/IUserSessionRepository';
import type { IShiftExtractionService } from '../domain/shift-parsing/service/IShiftExtractionService';
import type { IShiftRepository } from '../domain/shift-parsing/repository/IShiftRepository';
import type { IEventRepository } from '../domain/event-management/repository/IEventRepository';
import type { ICalendarService } from '../domain/calendar-integration/service/ICalendarService';

// Infrastructure Implementations
import { GoogleAuthenticationService } from '../infrastructure/api/GoogleAuthenticationService';
import { SessionStorageUserSessionRepository } from '../infrastructure/repository/SessionStorageUserSessionRepository';
import { GeminiShiftExtractionService } from '../infrastructure/api/GeminiShiftExtractionService';
import { LocalStorageShiftRepository } from '../infrastructure/repository/LocalStorageShiftRepository';
import { LocalStorageEventRepository } from '../infrastructure/repository/LocalStorageEventRepository';
import { GoogleCalendarService } from '../infrastructure/api/GoogleCalendarService';

// Use Cases
import { LoginUseCase } from '../application/use-case/LoginUseCase';
import { LogoutUseCase } from '../application/use-case/LogoutUseCase';
import { ParseShiftImageUseCase } from '../application/use-case/ParseShiftImageUseCase';
import { RegisterEventsUseCase } from '../application/use-case/RegisterEventsUseCase';

/**
 * DIコンテナクラス
 */
class DIContainer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private instances: Map<string, any> = new Map();

  // Singleton インスタンス
  private static _instance: DIContainer;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer._instance) {
      DIContainer._instance = new DIContainer();
    }
    return DIContainer._instance;
  }

  /**
   * インスタンスを登録
   */
  register<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  /**
   * インスタンスを取得
   */
  resolve<T>(key: string): T {
    if (!this.instances.has(key)) {
      throw new Error(`Dependency not found: ${key}`);
    }
    return this.instances.get(key) as T;
  }

  /**
   * コンテナをリセット（テスト用）
   */
  reset(): void {
    this.instances.clear();
  }
}

/**
 * DIコンテナの初期化
 * @param geminiApiKey Gemini API Key (optional - デフォルトは空文字列)
 */
export const initializeContainer = (geminiApiKey: string = ''): DIContainer => {
  const container = DIContainer.getInstance();

  // Infrastructure Layer の登録
  container.register<IAuthenticationService>(
    'IAuthenticationService',
    new GoogleAuthenticationService(),
  );

  container.register<IUserSessionRepository>(
    'IUserSessionRepository',
    new SessionStorageUserSessionRepository(),
  );

  container.register<IShiftExtractionService>(
    'IShiftExtractionService',
    new GeminiShiftExtractionService(geminiApiKey),
  );

  container.register<IShiftRepository>(
    'IShiftRepository',
    new LocalStorageShiftRepository(),
  );

  container.register<IEventRepository>(
    'IEventRepository',
    new LocalStorageEventRepository(),
  );

  container.register<ICalendarService>(
    'ICalendarService',
    new GoogleCalendarService(),
  );

  // Use Cases の登録
  container.register(
    'LoginUseCase',
    new LoginUseCase(
      container.resolve<IAuthenticationService>('IAuthenticationService'),
      container.resolve<IUserSessionRepository>('IUserSessionRepository'),
    ),
  );

  container.register(
    'LogoutUseCase',
    new LogoutUseCase(
      container.resolve<IUserSessionRepository>('IUserSessionRepository'),
    ),
  );

  container.register(
    'ParseShiftImageUseCase',
    new ParseShiftImageUseCase(
      container.resolve<IShiftExtractionService>('IShiftExtractionService'),
      container.resolve<IShiftRepository>('IShiftRepository'),
    ),
  );

  container.register(
    'RegisterEventsUseCase',
    new RegisterEventsUseCase(
      container.resolve<ICalendarService>('ICalendarService'),
    ),
  );

  return container;
};

/**
 * Gemini API Keyを更新してShift Extraction Serviceを再登録
 */
export const updateGeminiApiKey = (apiKey: string): void => {
  const container = DIContainer.getInstance();

  // IShiftExtractionServiceを再登録
  container.register<IShiftExtractionService>(
    'IShiftExtractionService',
    new GeminiShiftExtractionService(apiKey),
  );

  // ParseShiftImageUseCaseを再登録
  container.register(
    'ParseShiftImageUseCase',
    new ParseShiftImageUseCase(
      container.resolve<IShiftExtractionService>('IShiftExtractionService'),
      container.resolve<IShiftRepository>('IShiftRepository'),
    ),
  );
};

/**
 * グローバルコンテナインスタンス
 */
export const container = DIContainer.getInstance();
