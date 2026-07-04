const assert = require('node:assert/strict');
const test = require('node:test');

const { createPracticeSession } = require('../../core/domain/practiceSession');

const questions = [
  { id: 'q1', moduleId: 'legal', type: 'single_choice', status: 'active', revision: 1 },
  { id: 'q2', moduleId: 'legal', type: 'multiple_choice', status: 'active', revision: 1 },
  { id: 'q3', moduleId: 'registration', type: 'single_choice', status: 'active', revision: 1 },
  { id: 'q4', moduleId: 'legal', type: 'true_false', status: 'deleted', revision: 1 },
];

test('creates a full-bank session with all active questions', () => {
  const session = createPracticeSession(questions, { scope: 'all' });

  assert.deepEqual(session.questionIds, ['q1', 'q2', 'q3']);
  assert.equal(session.position, 0);
});

test('creates a module session when only module is selected', () => {
  const session = createPracticeSession(questions, { scope: 'module', moduleId: 'legal' });

  assert.deepEqual(session.questionIds, ['q1', 'q2']);
});

test('creates a module-and-type session when question type is selected', () => {
  const session = createPracticeSession(questions, {
    scope: 'module_type',
    moduleId: 'legal',
    questionType: 'multiple_choice',
  });

  assert.deepEqual(session.questionIds, ['q2']);
});

test('stores question revisions in the session snapshot', () => {
  const session = createPracticeSession(questions, { scope: 'all' });

  assert.deepEqual(session.questionSnapshots, [
    { id: 'q1', revision: 1 },
    { id: 'q2', revision: 1 },
    { id: 'q3', revision: 1 },
  ]);
});
