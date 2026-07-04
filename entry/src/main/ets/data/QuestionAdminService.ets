import {
  ConsistencyRefreshRequest,
  ConsistencyRefreshScope,
  QuestionSnapshot,
  QuestionStatus
} from '../domain/QuestionTypes';

export interface QuestionRevisionChange {
  questionId: string;
  beforeJson: string;
  afterJson: string;
}

export interface QuestionAdminResult {
  question: QuestionSnapshot;
  revision: QuestionRevisionChange;
  refresh: ConsistencyRefreshRequest;
}

export function editQuestion(question: QuestionSnapshot, patch: Partial<QuestionSnapshot>): QuestionAdminResult {
  const before = JSON.stringify(question);
  const next: QuestionSnapshot = {
    ...question,
    ...patch,
    revision: question.revision + 1
  };
  return buildResult(question, next, before, 'question_changed');
}

export function softDeleteQuestion(question: QuestionSnapshot): QuestionAdminResult {
  const before = JSON.stringify(question);
  const next: QuestionSnapshot = {
    ...question,
    status: QuestionStatus.Deleted,
    revision: question.revision + 1
  };
  return buildResult(question, next, before, 'question_deleted');
}

function buildResult(
  beforeQuestion: QuestionSnapshot,
  afterQuestion: QuestionSnapshot,
  beforeJson: string,
  reason: string
): QuestionAdminResult {
  return {
    question: afterQuestion,
    revision: {
      questionId: beforeQuestion.id,
      beforeJson,
      afterJson: JSON.stringify(afterQuestion)
    },
    refresh: {
      scope: ConsistencyRefreshScope.Questions,
      questionIds: [beforeQuestion.id],
      reason
    }
  };
}
