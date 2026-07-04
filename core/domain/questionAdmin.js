function editQuestion(question, patch) {
  const before = clone(question);
  const next = {
    ...question,
    ...patch,
    revision: question.revision + 1,
  };
  return buildChangeResult(before, next, 'question_changed');
}

function softDeleteQuestion(question) {
  const before = clone(question);
  const next = {
    ...question,
    status: 'deleted',
    revision: question.revision + 1,
  };
  return buildChangeResult(before, next, 'question_deleted');
}

function buildChangeResult(before, after, reason) {
  return {
    question: after,
    revision: {
      questionId: before.id,
      before,
      after,
    },
    refresh: {
      questionIds: [before.id],
      reason,
    },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  editQuestion,
  softDeleteQuestion,
};
