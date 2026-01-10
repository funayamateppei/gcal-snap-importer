import { UserProfile } from '../../domain/authentication/value-object/UserProfile.vo';

/**
 * ユーザープロフィール DTO
 */
export interface UserProfileDTO {
  name: string;
  email?: string;
  picture?: string;
}

export class UserProfileMapper {
  /**
   * Value Object → DTO
   */
  static toDTO(vo: UserProfile): UserProfileDTO {
    return {
      name: vo.name,
      email: vo.email,
      picture: vo.picture,
    };
  }

  /**
   * DTO → Value Object
   */
  static toDomain(dto: UserProfileDTO): UserProfile {
    const result = UserProfile.create(dto.name, dto.email, dto.picture);

    if (result.isFailure) {
      throw new Error(result.error.message);
    }

    return result.value;
  }
}
