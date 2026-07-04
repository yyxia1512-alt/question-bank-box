const assert = require('node:assert/strict');
const test = require('node:test');

const { rebuildStats } = require('../../core/domain/statistics');

const questions = [
  { id: 'q1', moduleId: 'legal', revision: 1, status: 'active' },
  { id: 'q2', moduleId: 'legal', revision: 2, status: 'active' },
  { id: 'q3', moduleId: 'case', revision: 1, status: 'deleted' },
];

test('rebuilds question stats from current-revision answer records', () => {
  const stats = rebuildStats({
    questions,
    answerRecords: [
      { questionId: 'q1', questionRevision: 1, isCorrect: false, answeredAt: 10 },
      { questionId: 'q1', questionRevision: 1, isCorrect: true, answeredAt: 20 },
    ],
    overrides: [],
  });

  assert.deepEqual(stats.questionStats.q1, {
    questionId: 'q1',
    latestRevision: 1,
    answeredCount: 2,
    wrongCount: 1,
    latestIsCorrect: true,
    needsPractice: false,
    hidden: false,
  });
});

test('marks revised questions as needing practice when only old records exist', () => {
  const stats = rebuildStats({
    questions,
    answerRecords: [
      { questionId: 'q2', questionRevision: 1, isCorrect: true, answeredAt: 10 },
    ],
    overrides: [],
  });

  assert.equal(stats.questionStats.q2.needsPractice, true);
  assert.equal(stats.questionStats.q2.answeredCount, 0);
});

test('keeps hidden wrong questions out of visible wrong count', () => {
  const stats = rebuildStats({
    questions,
    answerRecords: [
      { questionId: 'q1', questionRevision: 1, isCorrect: false, answeredAt: 10 },
    ],
    overrides: [{ questionId: 'q1', hidden: true }],
  });

  assert.equal(stats.questionStats.q1.needsPractice, true);
  assert.equal(stats.questionStats.q1.hidden, true);
  assert.equal(stats.moduleStats.legal.wrongCount, 0);
});

test('rebuilds module stats using active questions only', () => {
  const stats = rebuildStats({
    questions,
    answerRecords: [
      { questionId: 'q1', questionRevision: 1, isCorrect: true, answeredAt: 10 },
      { questionId: 'q2', questionRevision: 2, isCorrect: false, answeredAt: 20 },
      { questionId: 'q3', questionRevision: 1, isCorrect: false, answeredAt: 30 },
    ],
    overrides: [],
  });

  assert.deepEqual(stats.moduleStats.legal, {
    moduleId: 'legal',
    totalCount: 2,
    practicedCount: 2,
    wrongCount: 1,
  });
  assert.equal(stats.moduleStats.case, undefined);
});
