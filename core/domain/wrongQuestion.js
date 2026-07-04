function getWrongQuestionState({ question, records, override }) {
  if (question.status !== 'active') {
    return { shouldShow: false, reason: 'deleted' };
  }
  if (override && override.hidden) {
    return { shouldShow: false, reason: 'hidden_by_user' };
  }

  const related = records
    .filter((record) => record.questionId === question.id)
    .sort((left, right) => left.answeredAt - right.answeredAt);

  const currentRevision = related.filter(
    (record) => record.questionRevision === question.revision,
  );
  if (currentRevision.length === 0 && related.length > 0) {
    return { shouldShow: true, reason: 'revision_reset' };
  }
  if (currentRevision.length === 0) {
    return { shouldShow: false, reason: 'never_answered' };
  }

  const latest = currentRevision[currentRevision.length - 1];
  if (latest.isCorrect) {
    return { shouldShow: false, reason: 'current_correct' };
  }
  return { shouldShow: true, reason: 'incorrect' };
}

module.exports = {
  getWrongQuestionState,
};
