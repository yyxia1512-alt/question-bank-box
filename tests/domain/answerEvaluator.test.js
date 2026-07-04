const assert = require('node:assert/strict');
const test = require('node:test');

const { evaluateAnswer } = require('../../core/domain/answerEvaluator');

const singleChoiceQuestion = {
  id: 'q-single',
  type: 'single_choice',
  options: [
    { id: 'A', text: 'A' },
    { id: 'B', text: 'B' },
    { id: 'C', text: 'C' },
    { id: 'D', text: 'D' },
  ],
  answer: ['B'],
};

const multipleChoiceQuestion = {
  id: 'q-multiple',
  type: 'multiple_choice',
  options: [
    { id: 'A', text: 'A' },
    { id: 'B', text: 'B' },
    { id: 'C', text: 'C' },
    { id: 'D', text: 'D' },
  ],
  answer: ['A', 'C'],
};

const trueFalseQuestion = {
  id: 'q-true-false',
  type: 'true_false',
  options: [
    { id: 'true', text: '正确' },
    { id: 'false', text: '错误' },
  ],
  answer: ['false'],
};

test('marks a correct single-choice answer', () => {
  const result = evaluateAnswer(singleChoiceQuestion, ['B']);

  assert.equal(result.isCorrect, true);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.extra, []);
});

test('marks an incorrect single-choice answer with missing and extra options', () => {
  const result = evaluateAnswer(singleChoiceQuestion, ['A']);

  assert.equal(result.isCorrect, false);
  assert.deepEqual(result.missing, ['B']);
  assert.deepEqual(result.extra, ['A']);
});

test('marks a multiple-choice answer correct regardless of answer order', () => {
  const result = evaluateAnswer(multipleChoiceQuestion, ['C', 'A']);

  assert.equal(result.isCorrect, true);
  assert.deepEqual(result.normalizedAnswer, ['A', 'C']);
});

test('marks missing multiple-choice selections', () => {
  const result = evaluateAnswer(multipleChoiceQuestion, ['A']);

  assert.equal(result.isCorrect, false);
  assert.deepEqual(result.missing, ['C']);
  assert.deepEqual(result.extra, []);
});

test('marks true-false answers', () => {
  const result = evaluateAnswer(trueFalseQuestion, ['false']);

  assert.equal(result.isCorrect, true);
});

test('rejects empty answers', () => {
  const result = evaluateAnswer(singleChoiceQuestion, []);

  assert.equal(result.isCorrect, false);
  assert.equal(result.reason, 'empty_answer');
});

test('rejects answers that do not exist in options', () => {
  const result = evaluateAnswer(singleChoiceQuestion, ['E']);

  assert.equal(result.isCorrect, false);
  assert.equal(result.reason, 'invalid_option');
  assert.deepEqual(result.invalid, ['E']);
});
