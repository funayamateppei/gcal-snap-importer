import { DomainError } from '../../../shared/domain/DomainError';

/**
 * ワークフロー無効遷移エラー
 */
export class InvalidWorkflowTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super('INVALID_WORKFLOW_TRANSITION', `Cannot transition from ${from} to ${to}`);
  }
}

/**
 * ワークフロー前提条件エラー
 */
export class WorkflowPrerequisiteError extends DomainError {
  constructor(step: string, prerequisite: string) {
    super('WORKFLOW_PREREQUISITE_ERROR', `Step ${step} requires ${prerequisite}`);
  }
}
