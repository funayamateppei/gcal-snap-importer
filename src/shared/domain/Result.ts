/**
 * Result パターン
 * 成功または失敗を表現する型安全なコンテナ
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }

  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * 成功時に値を変換する
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this.error);
    }
    return Result.ok(fn(this.value));
  }

  /**
   * 成功時に別のResultを返す処理を実行
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this.error);
    }
    return fn(this.value);
  }

  /**
   * エラー時の処理を実行
   */
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.ok(this.value);
    }
    return Result.fail(fn(this.error));
  }

  /**
   * 値を取得（失敗時はデフォルト値）
   */
  getOrElse(defaultValue: T): T {
    return this.isSuccess ? this.value : defaultValue;
  }

  /**
   * async/await で使いやすいヘルパー
   */
  static async fromPromise<T, E = Error>(
    promise: Promise<T>,
    errorMapper?: (error: unknown) => E,
  ): Promise<Result<T, E>> {
    try {
      const value = await promise;
      return Result.ok(value);
    } catch (error) {
      const mappedError = errorMapper ? errorMapper(error) : (error as E);
      return Result.fail(mappedError);
    }
  }
}
