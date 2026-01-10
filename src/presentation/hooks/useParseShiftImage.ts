import { useCallback, useState } from 'react';
import { container } from '../../di/container';
import { ParseShiftImageUseCase } from '../../application/use-case/ParseShiftImageUseCase';
import type { ShiftEventDTO } from '../../application/dto/ShiftEventDTO';

export interface ParseShiftImageResult {
  events: ShiftEventDTO[];
  extractedCount: number;
}

/**
 * シフト画像解析ユースケースを呼び出すカスタムフック
 */
export const useParseShiftImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseImage = useCallback(
    async (
      base64Data: string,
      fileName: string,
      contextYear?: number,
    ): Promise<ParseShiftImageResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const parseUseCase = container.resolve<ParseShiftImageUseCase>('ParseShiftImageUseCase');
        const result = await parseUseCase.execute({
          base64Data,
          fileName,
          contextYear,
        });

        if (result.isSuccess) {
          return result.value;
        } else {
          setError(result.error.message);
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to parse shift image';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { parseImage, loading, error };
};
