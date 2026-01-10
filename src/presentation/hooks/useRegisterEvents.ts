import { useCallback, useState } from 'react';
import { container } from '../../di/container';
import { RegisterEventsUseCase } from '../../application/use-case/RegisterEventsUseCase';
import type { ShiftEventDTO } from '../../application/dto/ShiftEventDTO';

export interface RegisterEventsResult {
  totalCount: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

/**
 * イベント一括登録ユースケースを呼び出すカスタムフック
 */
export const useRegisterEvents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerEvents = useCallback(
    async (
      events: ShiftEventDTO[],
      accessToken: string,
    ): Promise<RegisterEventsResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const registerUseCase = container.resolve<RegisterEventsUseCase>('RegisterEventsUseCase');
        const result = await registerUseCase.execute({
          events,
          accessToken,
        });

        if (result.isSuccess) {
          return result.value;
        } else {
          setError(result.error.message);
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to register events';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { registerEvents, loading, error };
};
