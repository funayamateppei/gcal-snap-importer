import type { UseCase } from '../base/UseCase';
import { Result } from '../../shared/domain/Result';
import type { IAuthenticationService } from '../../domain/authentication/service/IAuthenticationService';
import type { IUserSessionRepository } from '../../domain/authentication/repository/IUserSessionRepository';
import type { UserProfileDTO } from '../dto/UserProfileDTO';
import { UserProfileMapper } from '../dto/UserProfileDTO';
import type { AuthenticationError } from '../../domain/authentication/error/AuthenticationError';

export interface LoginUseCaseInput {
  accessToken: string;
}

export interface LoginUseCaseOutput {
  profile: UserProfileDTO;
  success: boolean;
}

/**
 * ログインユースケース
 * Google OAuthのアクセストークンからユーザーセッションを作成
 */
export class LoginUseCase implements UseCase<LoginUseCaseInput, LoginUseCaseOutput> {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly sessionRepository: IUserSessionRepository,
  ) {}

  async execute(input: LoginUseCaseInput): Promise<Result<LoginUseCaseOutput, Error>> {
    try {
      // 1. セッション作成
      const sessionResult = await this.authService.createSession(input.accessToken);

      if (sessionResult.isFailure) {
        return Result.fail(sessionResult.error as AuthenticationError);
      }

      const session = sessionResult.value;

      // 2. セッションを永続化
      const saveResult = await this.sessionRepository.save(session);

      if (saveResult.isFailure) {
        return Result.fail(saveResult.error);
      }

      // 3. プロフィールをDTOに変換して返却
      return Result.ok({
        profile: UserProfileMapper.toDTO(session.profile),
        success: true,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
