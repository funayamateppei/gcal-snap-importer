import { DomainError } from '../../../shared/domain/DomainError';

/**
 * 認証失敗エラー
 */
export class AuthenticationFailedError extends DomainError {
  constructor(message: string = 'Authentication failed') {
    super('AUTHENTICATION_FAILED', message);
  }
}

/**
 * セッション期限切れエラー
 */
export class SessionExpiredError extends DomainError {
  constructor() {
    super('SESSION_EXPIRED', 'Session has expired');
  }
}

export type AuthenticationError = AuthenticationFailedError | SessionExpiredError;
