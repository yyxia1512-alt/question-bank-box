import { QuestionSnapshot } from './QuestionTypes';

export interface EvaluationResult {
  isCorrect: boolean;
  normalizedAnswer: string[];
  normalizedUserAnswer: string[];
  missing: string[];
  extra: string[];
  invalid: string[];
  reason: string;
}

export function evaluateAnswer(question: QuestionSnapshot, userAnswer: string[]): EvaluationResult {
  const expected = normalizeChoices(question.answer);
  const actual = normalizeChoices(userAnswer);
  const optionIds = question.options.map((option) => option.id);
  const invalid = actual.filter((choice) => optionIds.indexOf(choice) < 0);

  if (actual.length === 0) {
    return buildResult(false, expected, actual, expected, [], invalid, 'empty_answer');
  }
  if (invalid.length > 0) {
    return buildResult(false, expected, actual, [], [], invalid, 'invalid_option');
  }

  const missing = expected.filter((choice) => actual.indexOf(choice) < 0);
  const extra = actual.filter((choice) => expected.indexOf(choice) < 0);
  const correct = missing.length === 0 && extra.length === 0;
  return buildResult(correct, expected, actual, missing, extra, [], '');
}

function normalizeChoices(choices: string[]): string[] {
  const unique: string[] = [];
  choices.forEach((choice) => {
    if (unique.indexOf(choice) < 0) {
      unique.push(choice);
    }
  });
  return unique.sort();
}

function buildResult(
  isCorrect: boolean,
  normalizedAnswer: string[],
  normalizedUserAnswer: string[],
  missing: string[],
  extra: string[],
  invalid: string[],
  reason: string
): EvaluationResult {
  return {
    isCorrect,
    normalizedAnswer,
    normalizedUserAnswer,
    missing,
    extra,
    invalid,
    reason
  };
}
