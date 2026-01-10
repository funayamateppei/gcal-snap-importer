import { ShiftEvent } from '../../domain/event-management/entity/ShiftEvent.entity';
import { ShiftType } from '../../domain/event-management/value-object/ShiftType.vo';

/**
 * シフトイベント DTO
 * プレゼンテーション層とアプリケーション層の境界でデータを転送
 */
export interface ShiftEventDTO {
  id: string;
  summary: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  allDay: boolean;
}

export class ShiftEventMapper {
  /**
   * Entity → DTO
   */
  static toDTO(entity: ShiftEvent): ShiftEventDTO {
    return {
      id: entity.id,
      summary: entity.summary.getValue(),
      start: entity.getStartISO(),
      end: entity.getEndISO(),
      allDay: entity.allDay,
    };
  }

  /**
   * DTO → Entity
   */
  static toDomain(dto: ShiftEventDTO): ShiftEvent {
    const summaryResult = ShiftType.create(dto.summary);
    if (summaryResult.isFailure) {
      throw new Error(`Invalid shift type: ${dto.summary}`);
    }

    const start = new Date(dto.start);
    const end = new Date(dto.end);

    const entityResult = ShiftEvent.create(
      summaryResult.value,
      start,
      end,
      dto.allDay,
      dto.id,
    );

    if (entityResult.isFailure) {
      throw new Error(entityResult.error.message);
    }

    return entityResult.value;
  }

  /**
   * Entities → DTOs
   */
  static toDTOs(entities: ShiftEvent[]): ShiftEventDTO[] {
    return entities.map(e => this.toDTO(e));
  }

  /**
   * DTOs → Entities
   */
  static toDomains(dtos: ShiftEventDTO[]): ShiftEvent[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
