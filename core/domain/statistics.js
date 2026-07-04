const { getWrongQuestionState } = require('./wrongQuestion');

function rebuildStats({ questions, answerRecords, overrides }) {
  const overrideByQuestion = new Map(overrides.map((override) => [override.questionId, override]));
  const activeQuestions = questions.filter((question) => question.status === 'active');
  const questionStats = {};
  const moduleStats = {};

  for (const question of activeQuestions) {
    const allRecords = answerRecords
      .filter((record) => record.questionId === question.id)
      .sort((left, right) => left.answeredAt - right.answeredAt);
    const currentRecords = allRecords.filter(
      (record) => record.questionRevision === question.revision,
    );
    const latest = currentRecords[currentRecords.length - 1];
    const hidden = Boolean(overrideByQuestion.get(question.id)?.hidden);
    const wrongCount = currentRecords.filter((record) => !record.isCorrect).length;
    const practiceState = getWrongQuestionState({
      question,
      records: allRecords,
      override: null,
    });
    const visibleState = getWrongQuestionState({
      question,
      records: allRecords,
      override: overrideByQuestion.get(question.id),
    });

    questionStats[question.id] = {
      questionId: question.id,
      latestRevision: question.revision,
      answeredCount: currentRecords.length,
      wrongCount,
      latestIsCorrect: latest ? latest.isCorrect : null,
      needsPractice: practiceState.shouldShow,
      hidden,
      consecutiveCorrect: practiceState.consecutiveCorrect,
      appearanceWeight: practiceState.appearanceWeight,
    };

    if (!moduleStats[question.moduleId]) {
      moduleStats[question.moduleId] = {
        moduleId: question.moduleId,
        totalCount: 0,
        practicedCount: 0,
        wrongCount: 0,
      };
    }
    const module = moduleStats[question.moduleId];
    module.totalCount += 1;
    if (currentRecords.length > 0) {
      module.practicedCount += 1;
    }
    if (visibleState.shouldShow) {
      module.wrongCount += 1;
    }
  }

  return { questionStats, moduleStats };
}

module.exports = {
  rebuildStats,
};
