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
  const session = createPracticeSession(questions, { scope: 'all' }, { random: randomSequence(0.5, 0.9) });

  assert.deepEqual(session.questionIds, ['q2', 'q3', 'q1']);
  assert.equal(session.position, 0);
});

test('creates a module session when only module is selected', () => {
  const session = createPracticeSession(questions, { scope: 'module', moduleId: 'legal' }, { random: randomSequence(0.9) });

  assert.deepEqual(session.questionIds, ['q2', 'q1']);
});

test('creates a module-and-type session when question type is selected', () => {
  const session = createPracticeSession(
    questions,
    {
      scope: 'module_type',
      moduleId: 'legal',
      questionType: 'multiple_choice',
    },
    { random: randomSequence(0.5) },
  );

  assert.deepEqual(session.questionIds, ['q2']);
});

test('stores question revisions in the session snapshot', () => {
  const session = createPracticeSession(questions, { scope: 'all' }, { random: randomSequence(0.5, 0.9) });

  assert.deepEqual(session.questionSnapshots, [
    { id: 'q2', revision: 1 },
    { id: 'q3', revision: 1 },
    { id: 'q1', revision: 1 },
  ]);
});

test('uses practice weights when building a random queue', () => {
  const session = createPracticeSession(
    [
      { id: 'q1', moduleId: 'legal', type: 'single_choice', status: 'active', revision: 1, practiceWeight: 0.1 },
      { id: 'q2', moduleId: 'legal', type: 'single_choice', status: 'active', revision: 1, practiceWeight: 1 },
      { id: 'q3', moduleId: 'legal', type: 'single_choice', status: 'active', revision: 1, practiceWeight: 1 },
    ],
    { scope: 'all' },
    { random: randomSequence(0.2, 0.9) },
  );

  assert.deepEqual(session.questionIds, ['q2', 'q3', 'q1']);
});

function randomSequence(...values) {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1];
    index += 1;
    return value;
  };
}
