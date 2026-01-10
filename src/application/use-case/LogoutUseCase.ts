import type { UseCase } from '../base/UseCase';
import { Result } from '../../shared/domain/Result';
import type { IUserSessionRepository } from '../../domain/authentication/repository/IUserSessionRepository';

export type LogoutUseCaseInput = void;

export interface LogoutUseCaseOutput {
  success: boolean;
}

/**
 * ログアウトユースケース
 * セッションをクリアし、ログアウト処理を行う
 */
export class LogoutUseCase implements UseCase<LogoutUseCaseInput, LogoutUseCaseOutput> {
  constructor(
    private readonly sessionRepository: IUserSessionRepository,
  ) {}

  async execute(): Promise<Result<LogoutUseCaseOutput, Error>> {
    try {
      // セッションをクリア
      const clearResult = await this.sessionRepository.clear();

      if (clearResult.isFailure) {
        return Result.fail(clearResult.error);
      }

      return Result.ok({
        success: true,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
