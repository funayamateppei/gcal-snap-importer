import { useCallback, useState } from 'react';
import { container } from '../../di/container';
import { LogoutUseCase } from '../../application/use-case/LogoutUseCase';

/**
 * ログアウトユースケースを呼び出すカスタムフック
 */
export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const logoutUseCase = container.resolve<LogoutUseCase>('LogoutUseCase');
      const result = await logoutUseCase.execute();

      if (result.isSuccess) {
        return result.value.success;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logout, loading, error };
};
