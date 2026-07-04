import { AnswerRecord, QuestionSnapshot, QuestionStatus } from './QuestionTypes';
import { getWrongQuestionState, WrongQuestionOverride } from './WrongQuestionService';

export interface QuestionStat {
  questionId: string;
  latestRevision: number;
  answeredCount: number;
  wrongCount: number;
  latestIsCorrect: boolean | null;
  needsPractice: boolean;
  hidden: boolean;
  consecutiveCorrect: number;
  appearanceWeight: number;
}

export interface ModuleStat {
  moduleId: string;
  totalCount: number;
  practicedCount: number;
  wrongCount: number;
}

export interface RebuiltStats {
  questionStats: Record<string, QuestionStat>;
  moduleStats: Record<string, ModuleStat>;
}

export function rebuildStats(
  questions: QuestionSnapshot[],
  answerRecords: AnswerRecord[],
  overrides: Record<string, WrongQuestionOverride>
): RebuiltStats {
  const questionStats: Record<string, QuestionStat> = {};
  const moduleStats: Record<string, ModuleStat> = {};

  questions
    .filter((question) => question.status === QuestionStatus.Active)
    .forEach((question) => {
      const allRecords = answerRecords
        .filter((record) => record.questionId === question.id)
        .sort((left, right) => left.answeredAt - right.answeredAt);
      const currentRecords = allRecords.filter((record) => record.questionRevision === question.revision);
      const latest = currentRecords.length > 0 ? currentRecords[currentRecords.length - 1] : undefined;
      const hidden = overrides[question.id] ? overrides[question.id].hidden : false;
      const wrongCount = currentRecords.filter((record) => !record.isCorrect).length;
      const practiceState = getWrongQuestionState(question, allRecords);
      const visibleState = getWrongQuestionState(question, allRecords, overrides[question.id]);

      questionStats[question.id] = {
        questionId: question.id,
        latestRevision: question.revision,
        answeredCount: currentRecords.length,
        wrongCount,
        latestIsCorrect: latest ? latest.isCorrect : null,
        needsPractice: practiceState.shouldShow,
        hidden,
        consecutiveCorrect: practiceState.consecutiveCorrect,
        appearanceWeight: practiceState.appearanceWeight
      };

      if (!moduleStats[question.moduleId]) {
        moduleStats[question.moduleId] = {
          moduleId: question.moduleId,
          totalCount: 0,
          practicedCount: 0,
          wrongCount: 0
        };
      }
      const moduleStat = moduleStats[question.moduleId];
      moduleStat.totalCount += 1;
      if (currentRecords.length > 0) {
        moduleStat.practicedCount += 1;
      }
      if (visibleState.shouldShow) {
        moduleStat.wrongCount += 1;
      }
    });

  return {
    questionStats,
    moduleStats
  };
}
