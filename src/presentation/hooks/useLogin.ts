import { useCallback, useState } from 'react';
import { container } from '../../di/container';
import { LoginUseCase } from '../../application/use-case/LoginUseCase';
import type { UserProfileDTO } from '../../application/dto/UserProfileDTO';

/**
 * ログインユースケースを呼び出すカスタムフック
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (accessToken: string): Promise<UserProfileDTO | null> => {
    setLoading(true);
    setError(null);

    try {
      const loginUseCase = container.resolve<LoginUseCase>('LoginUseCase');
      const result = await loginUseCase.execute({ accessToken });

      if (result.isSuccess) {
        return result.value.profile;
      } else {
        setError(result.error.message);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error };
};
