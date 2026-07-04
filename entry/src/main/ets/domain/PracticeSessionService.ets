import { PracticeFilter, QuestionSnapshot, QuestionStatus } from './QuestionTypes';

export interface PracticeQuestionSnapshot {
  id: string;
  revision: number;
}

export interface PracticeSession {
  filter: PracticeFilter;
  position: number;
  questionIds: string[];
  questionSnapshots: PracticeQuestionSnapshot[];
}

export function createPracticeSession(questions: QuestionSnapshot[], filter: PracticeFilter): PracticeSession {
  const selected = questions.filter((question) => {
    if (question.status !== QuestionStatus.Active) {
      return false;
    }
    if (filter.scope === 'module') {
      return question.moduleId === filter.moduleId;
    }
    if (filter.scope === 'module_type') {
      return question.moduleId === filter.moduleId && question.type === filter.questionType;
    }
    return true;
  });

  return {
    filter,
    position: 0,
    questionIds: selected.map((question) => question.id),
    questionSnapshots: selected.map((question) => {
      return {
        id: question.id,
        revision: question.revision
      };
    })
  };
}
