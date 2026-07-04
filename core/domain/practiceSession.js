function createPracticeSession(questions, filter) {
  const selected = questions.filter((question) => {
    if (question.status !== 'active') {
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
    questionSnapshots: selected.map((question) => ({
      id: question.id,
      revision: question.revision,
    })),
  };
}

module.exports = {
  createPracticeSession,
};
