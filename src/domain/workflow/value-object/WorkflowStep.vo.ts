import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

export type WorkflowStepType = 'auth' | 'api_key' | 'upload' | 'preview' | 'complete';

interface WorkflowStepProps {
  value: WorkflowStepType;
}

/**
 * ワークフローステップ Value Object
 * マルチステップウィザードの各ステップを表現
 */
export class WorkflowStep extends ValueObject<WorkflowStepProps> {
  private static readonly STEP_ORDER: WorkflowStepType[] = [
    'auth',
    'api_key',
    'upload',
    'preview',
    'complete',
  ];

  private constructor(props: WorkflowStepProps) {
    super(props);
  }

  static create(value: string): Result<WorkflowStep, ValidationError> {
    if (!this.isValid(value)) {
      return Result.fail(
        new ValidationError(`Invalid workflow step: ${value}`),
      );
    }

    return Result.ok(new WorkflowStep({ value: value as WorkflowStepType }));
  }

  static auth(): WorkflowStep {
    return new WorkflowStep({ value: 'auth' });
  }

  static apiKey(): WorkflowStep {
    return new WorkflowStep({ value: 'api_key' });
  }

  static upload(): WorkflowStep {
    return new WorkflowStep({ value: 'upload' });
  }

  static preview(): WorkflowStep {
    return new WorkflowStep({ value: 'preview' });
  }

  static complete(): WorkflowStep {
    return new WorkflowStep({ value: 'complete' });
  }

  private static isValid(value: string): boolean {
    return this.STEP_ORDER.includes(value as WorkflowStepType);
  }

  getValue(): WorkflowStepType {
    return this.props.value;
  }

  /**
   * 次のステップを取得
   */
  getNext(): Result<WorkflowStep, ValidationError> {
    const currentIndex = WorkflowStep.STEP_ORDER.indexOf(this.props.value);
    if (currentIndex === -1 || currentIndex === WorkflowStep.STEP_ORDER.length - 1) {
      return Result.fail(
        new ValidationError('No next step available'),
      );
    }

    return Result.ok(
      new WorkflowStep({ value: WorkflowStep.STEP_ORDER[currentIndex + 1] }),
    );
  }

  /**
   * 前のステップを取得
   */
  getPrevious(): Result<WorkflowStep, ValidationError> {
    const currentIndex = WorkflowStep.STEP_ORDER.indexOf(this.props.value);
    if (currentIndex <= 0) {
      return Result.fail(
        new ValidationError('No previous step available'),
      );
    }

    return Result.ok(
      new WorkflowStep({ value: WorkflowStep.STEP_ORDER[currentIndex - 1] }),
    );
  }

  /**
   * 最初のステップかどうか
   */
  isFirst(): boolean {
    return this.props.value === WorkflowStep.STEP_ORDER[0];
  }

  /**
   * 最後のステップかどうか
   */
  isLast(): boolean {
    return this.props.value === WorkflowStep.STEP_ORDER[WorkflowStep.STEP_ORDER.length - 1];
  }

  /**
   * ステップのインデックスを取得（0始まり）
   */
  getIndex(): number {
    return WorkflowStep.STEP_ORDER.indexOf(this.props.value);
  }

  /**
   * 別のステップより前かどうか
   */
  isBefore(other: WorkflowStep): boolean {
    return this.getIndex() < other.getIndex();
  }

  /**
   * 別のステップより後かどうか
   */
  isAfter(other: WorkflowStep): boolean {
    return this.getIndex() > other.getIndex();
  }

  toString(): string {
    return this.props.value;
  }
}
