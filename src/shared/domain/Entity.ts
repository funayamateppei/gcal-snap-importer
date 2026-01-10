/**
 * Entity 基底クラス
 * IDによって識別されるドメインオブジェクト
 */
export abstract class Entity<T> {
  protected readonly _id: string;
  protected readonly props: T;

  constructor(props: T, id?: string) {
    this._id = id ?? this.generateId();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  /**
   * IDによる等価性判定
   */
  equals(other?: Entity<T>): boolean {
    if (other == null || other == undefined) {
      return false;
    }

    if (!(other instanceof Entity)) {
      return false;
    }

    return this._id === other._id;
  }

  /**
   * ID生成ロジック（オーバーライド可能）
   */
  protected generateId(): string {
    return crypto.randomUUID();
  }
}
