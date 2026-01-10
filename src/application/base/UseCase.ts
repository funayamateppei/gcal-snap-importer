import { Result } from '../../shared/domain/Result';

/**
 * Use Case インターフェース
 * すべてのユースケースはこのインターフェースを実装する
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<Result<TOutput, Error>>;
}
