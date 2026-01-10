import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

interface UserProfileProps {
  name: string;
  email?: string;
  picture?: string;
}

/**
 * ユーザープロフィール Value Object
 */
export class UserProfile extends ValueObject<UserProfileProps> {
  private constructor(props: UserProfileProps) {
    super(props);
  }

  static create(
    name: string,
    email?: string,
    picture?: string,
  ): Result<UserProfile, ValidationError> {
    if (!name || name.trim() === '') {
      return Result.fail(
        new ValidationError('Name is required'),
      );
    }

    return Result.ok(
      new UserProfile({
        name: name.trim(),
        email: email?.trim(),
        picture,
      }),
    );
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get picture(): string | undefined {
    return this.props.picture;
  }

  hasEmail(): boolean {
    return !!this.props.email;
  }

  hasPicture(): boolean {
    return !!this.props.picture;
  }
}
