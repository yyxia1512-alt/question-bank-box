function evaluateAnswer(question, userAnswer) {
  const expected = normalizeChoices(question.answer);
  const actual = normalizeChoices(userAnswer);
  const optionIds = new Set(question.options.map((option) => option.id));
  const invalid = actual.filter((choice) => !optionIds.has(choice));

  if (actual.length === 0) {
    return result(false, expected, actual, expected, [], 'empty_answer', invalid);
  }
  if (invalid.length > 0) {
    return result(false, expected, actual, [], [], 'invalid_option', invalid);
  }

  const missing = expected.filter((choice) => !actual.includes(choice));
  const extra = actual.filter((choice) => !expected.includes(choice));
  return result(missing.length === 0 && extra.length === 0, expected, actual, missing, extra, null, []);
}

function normalizeChoices(choices) {
  return Array.from(new Set(choices)).sort();
}

function result(isCorrect, normalizedAnswer, normalizedUserAnswer, missing, extra, reason, invalid) {
  return {
    isCorrect,
    normalizedAnswer,
    normalizedUserAnswer,
    missing,
    extra,
    reason,
    invalid,
  };
}

module.exports = {
  evaluateAnswer,
};
