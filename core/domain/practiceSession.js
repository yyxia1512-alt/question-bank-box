function createPracticeSession(questions, filter, options = {}) {
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
  const ordered = weightedShuffle(selected, options.random || Math.random);

  return {
    filter,
    position: 0,
    questionIds: ordered.map((question) => question.id),
    questionSnapshots: ordered.map((question) => ({
      id: question.id,
      revision: question.revision,
    })),
  };
}

function weightedShuffle(questions, random) {
  const remaining = questions.slice();
  const result = [];

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
    result.push(remaining.splice(selectedIndex, 1)[0]);
  }

  return result;
}

function questionWeight(question) {
  if (typeof question.practiceWeight !== 'number') {
    return 1;
  }
  return Math.max(question.practiceWeight, 0);
}

module.exports = {
  createPracticeSession,
  weightedShuffle,
};
