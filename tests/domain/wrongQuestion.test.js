const assert = require('node:assert/strict');
const test = require('node:test');

const { getWrongQuestionState } = require('../../core/domain/wrongQuestion');

test('shows a question when the latest current-revision answer is incorrect', () => {
  const state = getWrongQuestionState({
    question: { id: 'q1', revision: 1, status: 'active' },
    records: [{ questionId: 'q1', questionRevision: 1, isCorrect: false, answeredAt: 10 }],
    override: null,
  });

  assert.equal(state.shouldShow, true);
  assert.equal(state.reason, 'incorrect');
});

test('hides a wrong question when user manually removes it from display', () => {
  const state = getWrongQuestionState({
    question: { id: 'q1', revision: 1, status: 'active' },
    records: [{ questionId: 'q1', questionRevision: 1, isCorrect: false, answeredAt: 10 }],
    override: { hidden: true },
  });

  assert.equal(state.shouldShow, false);
  assert.equal(state.reason, 'hidden_by_user');
});

test('resets a revised question to needs practice when only old-version records exist', () => {
  const state = getWrongQuestionState({
    question: { id: 'q1', revision: 2, status: 'active' },
    records: [{ questionId: 'q1', questionRevision: 1, isCorrect: true, answeredAt: 10 }],
    override: null,
  });

  assert.equal(state.shouldShow, true);
  assert.equal(state.reason, 'revision_reset');
});

test('does not show a question whose latest current-revision answer is correct', () => {
  const state = getWrongQuestionState({
    question: { id: 'q1', revision: 1, status: 'active' },
    records: [
      { questionId: 'q1', questionRevision: 1, isCorrect: false, answeredAt: 10 },
      { questionId: 'q1', questionRevision: 1, isCorrect: true, answeredAt: 20 },
    ],
    override: null,
  });

  assert.equal(state.shouldShow, true);
  assert.equal(state.reason, 'needs_reinforcement');
  assert.equal(state.consecutiveCorrect, 1);
  assert.equal(state.appearanceWeight, 0.5);
});

test('removes a wrong question only after enough consecutive correct answers', () => {
  const state = getWrongQuestionState({
    question: { id: 'q1', revision: 1, status: 'active' },
    records: [
      { questionId: 'q1', questionRevision: 1, isCorrect: false, answeredAt: 10 },
      { questionId: 'q1', questionRevision: 1, isCorrect: true, answeredAt: 20 },
      { questionId: 'q1', questionRevision: 1, isCorrect: true, answeredAt: 30 },
      { questionId: 'q1', questionRevision: 1, isCorrect: true, answeredAt: 40 },
    ],
    override: null,
  });

  assert.equal(state.shouldShow, false);
  assert.equal(state.reason, 'mastered');
  assert.equal(state.consecutiveCorrect, 3);
  assert.equal(state.appearanceWeight, 0);
});

test('resets wrong-question mastery after a later incorrect answer', () => {
  const state = getWrongQuestionState({
    question: { id: 'q1', revision: 1, status: 'active' },
    records: [
      { questionId: 'q1', questionRevision: 1, isCorrect: false, answeredAt: 10 },
      { questionId: 'q1', questionRevision: 1, isCorrect: true, answeredAt: 20 },
      { questionId: 'q1', questionRevision: 1, isCorrect: false, answeredAt: 30 },
    ],
    override: null,
  });

  assert.equal(state.shouldShow, true);
  assert.equal(state.reason, 'incorrect');
  assert.equal(state.consecutiveCorrect, 0);
  assert.equal(state.appearanceWeight, 1);
});

test('does not show soft-deleted questions', () => {
  const state = getWrongQuestionState({
    question: { id: 'q1', revision: 1, status: 'deleted' },
    records: [{ questionId: 'q1', questionRevision: 1, isCorrect: false, answeredAt: 10 }],
    override: null,
  });

  assert.equal(state.shouldShow, false);
  assert.equal(state.reason, 'deleted');
});
