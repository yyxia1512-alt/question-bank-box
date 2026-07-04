const assert = require('node:assert/strict');
const test = require('node:test');

const { editQuestion, softDeleteQuestion } = require('../../core/domain/questionAdmin');

const baseQuestion = {
  id: 'q1',
  revision: 1,
  status: 'active',
  stem: 'old stem',
  answer: ['A'],
  options: [
    { id: 'A', text: 'old A' },
    { id: 'B', text: 'old B' },
  ],
};

test('editing a question increments revision and records a before snapshot', () => {
  const result = editQuestion(baseQuestion, {
    stem: 'new stem',
    answer: ['B'],
  });

  assert.equal(result.question.revision, 2);
  assert.equal(result.question.stem, 'new stem');
  assert.deepEqual(result.question.answer, ['B']);
  assert.equal(result.revision.questionId, 'q1');
  assert.equal(result.revision.before.revision, 1);
  assert.equal(result.revision.after.revision, 2);
});

test('editing a question marks stats for refresh', () => {
  const result = editQuestion(baseQuestion, { answer: ['B'] });

  assert.deepEqual(result.refresh, {
    questionIds: ['q1'],
    reason: 'question_changed',
  });
});

test('soft delete keeps history by changing status and incrementing revision', () => {
  const result = softDeleteQuestion(baseQuestion);

  assert.equal(result.question.status, 'deleted');
  assert.equal(result.question.revision, 2);
  assert.equal(result.refresh.reason, 'question_deleted');
});
