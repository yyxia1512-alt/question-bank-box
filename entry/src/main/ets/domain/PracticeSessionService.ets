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

export interface PracticeSessionOptions {
  random?: () => number;
}

export function createPracticeSession(
  questions: QuestionSnapshot[],
  filter: PracticeFilter,
  options?: PracticeSessionOptions
): PracticeSession {
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
  const random = options && options.random ? options.random : Math.random;
  const ordered = weightedShuffle(selected, random);

  return {
    filter,
    position: 0,
    questionIds: ordered.map((question) => question.id),
    questionSnapshots: ordered.map((question) => {
      return {
        id: question.id,
        revision: question.revision
      };
    })
  };
}

export function weightedShuffle(questions: QuestionSnapshot[], random: () => number): QuestionSnapshot[] {
  const remaining = questions.slice();
  const result: QuestionSnapshot[] = [];

  while (remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, question) => sum + questionWeight(question), 0);
    let cursor = random() * totalWeight;
    let selectedIndex = remaining.length - 1;
    for (let index = 0; index < remaining.length; index += 1) {
      cursor -= questionWeight(remaining[index]);
      if (cursor <= 0) {
        selectedIndex = index;
        break;
      }
    }
    const selected = remaining.splice(selectedIndex, 1)[0];
    result.push(selected);
  }

  return result;
}

function questionWeight(question: QuestionSnapshot): number {
  if (typeof question.practiceWeight !== 'number') {
    return 1;
  }
  return Math.max(question.practiceWeight, 0);
}
