/**
 * Value Object 基底クラス
 * 値によって識別されるイミュータブルなドメインオブジェクト
 */
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * 値による等価性判定
   */
  equals(other?: ValueObject<T>): boolean {
    if (other == null || other == undefined) {
      return false;
    }

    if (!(other instanceof ValueObject)) {
      return false;
    }

    return this.deepEquals(this.props, other.props);
  }

  private deepEquals(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) {
      return true;
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }

    if (obj1 === null || obj2 === null) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false;
      }

      if (!this.deepEquals((obj1 as any)[key], (obj2 as any)[key])) {
        return false;
      }
    }

    return true;
  }
}
