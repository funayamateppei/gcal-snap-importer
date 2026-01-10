/**
 * Domain Error 基底クラス
 * ドメイン固有のエラーを表現
 */
export abstract class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    // captureStackTrace is V8-specific, so make it optional
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

/**
 * 権限エラー
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message);
  }
}

/**
 * Not Found エラー
 */
export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`);
  }
}
