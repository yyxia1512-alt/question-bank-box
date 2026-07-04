import { AnswerRecord, QuestionSnapshot, QuestionStatus } from './QuestionTypes';

const DEFAULT_REQUIRED_CORRECT_STREAK = 3;

export interface WrongQuestionOverride {
  hidden: boolean;
}

export interface WrongQuestionState {
  shouldShow: boolean;
  reason: string;
  consecutiveCorrect: number;
  appearanceWeight: number;
}

export interface WrongQuestionMastery {
  hasWrongAnswer: boolean;
  latestIsCorrect: boolean;
  consecutiveCorrect: number;
}

export function getWrongQuestionState(
  question: QuestionSnapshot,
  records: AnswerRecord[],
  override?: WrongQuestionOverride
): WrongQuestionState {
  if (question.status !== QuestionStatus.Active) {
    return buildState(false, 'deleted', 0, 0);
  }
  if (override && override.hidden) {
    return buildState(false, 'hidden_by_user', 0, 0);
  }

  const related = records
    .filter((record) => record.questionId === question.id)
    .sort((left, right) => left.answeredAt - right.answeredAt);
  const currentRevision = related.filter((record) => record.questionRevision === question.revision);

  if (currentRevision.length === 0 && related.length > 0) {
    return buildState(true, 'revision_reset', 0, 1);
  }
  if (currentRevision.length === 0) {
    return buildState(false, 'never_answered', 0, 0);
  }

  const mastery = getWrongQuestionMastery(currentRevision);
  if (!mastery.hasWrongAnswer) {
    return buildState(false, 'current_correct', mastery.consecutiveCorrect, 0);
  }
  if (!mastery.latestIsCorrect) {
    return buildState(true, 'incorrect', 0, 1);
  }
  if (mastery.consecutiveCorrect >= DEFAULT_REQUIRED_CORRECT_STREAK) {
    return buildState(false, 'mastered', mastery.consecutiveCorrect, 0);
  }

  return buildState(
    true,
    'needs_reinforcement',
    mastery.consecutiveCorrect,
    1 / (mastery.consecutiveCorrect + 1)
  );
}

export function getWrongQuestionMastery(records: AnswerRecord[]): WrongQuestionMastery {
  const ordered = records.slice().sort((left, right) => left.answeredAt - right.answeredAt);
  const latest = ordered.length > 0 ? ordered[ordered.length - 1] : undefined;
  let consecutiveCorrect = 0;
  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    if (!ordered[index].isCorrect) {
      break;
    }
    consecutiveCorrect += 1;
  }

  return {
    hasWrongAnswer: ordered.some((record) => !record.isCorrect),
    latestIsCorrect: latest ? latest.isCorrect : false,
    consecutiveCorrect
  };
}

function buildState(
  shouldShow: boolean,
  reason: string,
  consecutiveCorrect: number,
  appearanceWeight: number
): WrongQuestionState {
  return {
    shouldShow,
    reason,
    consecutiveCorrect,
    appearanceWeight
  };
}
