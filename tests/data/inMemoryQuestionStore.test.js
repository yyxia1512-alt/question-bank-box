const assert = require('node:assert/strict');
const test = require('node:test');

const { InMemoryQuestionStore } = require('../../core/data/inMemoryQuestionStore');
const { editQuestion } = require('../../core/domain/questionAdmin');

function packageData() {
  return {
    manifest: { name: 'test bank', version: '1.0.0', format_version: 1 },
    modules: [
      { id: 'legal', name: '法律', order: 1, status: 'active' },
      { id: 'case', name: '案例', order: 2, status: 'active' },
    ],
    questions: [
      {
        id: 'q1',
        module_id: 'legal',
        moduleId: 'legal',
        type: 'single_choice',
        stem: '题干一',
        options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }],
        answer: ['A'],
        explanation: '解析一',
        status: 'active',
        revision: 1,
      },
      {
        id: 'q2',
        module_id: 'case',
        moduleId: 'case',
        type: 'true_false',
        stem: '题干二',
        options: [{ id: 'true', text: '正确' }, { id: 'false', text: '错误' }],
        answer: ['false'],
        explanation: '解析二',
        status: 'active',
        revision: 1,
      },
    ],
  };
}

test('imports a valid package and lists active questions', () => {
  const store = new InMemoryQuestionStore();
  const result = store.importPackage(packageData());

  const questions = store.listQuestions({ scope: 'all' });

  assert.deepEqual(questions.map((question) => question.id), ['q1', 'q2']);
  assert.equal(result.mode, 'replace_all');
  assert.deepEqual(result.refresh, { scope: 'all', reason: 'import_replace_all' });
  assert.equal(result.stats.moduleStats.legal.totalCount, 1);
});

test('rejects invalid package imports without clearing existing data', () => {
  const store = new InMemoryQuestionStore();
  store.importPackage(packageData());
  const invalid = packageData();
  invalid.questions[0].answer = ['Z'];

  assert.throws(() => store.importPackage(invalid), /invalid package/);

  assert.deepEqual(store.listQuestions({ scope: 'all' }).map((question) => question.id), ['q1', 'q2']);
});

test('filters imported questions by module and type', () => {
  const store = new InMemoryQuestionStore();
  store.importPackage(packageData());

  const questions = store.listQuestions({
    scope: 'module_type',
    moduleId: 'legal',
    questionType: 'single_choice',
  });

  assert.deepEqual(questions.map((question) => question.id), ['q1']);
});

test('records answers and rebuilds stats', () => {
  const store = new InMemoryQuestionStore();
  store.importPackage(packageData());

  store.saveAnswerRecord({
    questionId: 'q1',
    questionRevision: 1,
    userAnswer: ['B'],
    correctAnswer: ['A'],
    isCorrect: false,
    answeredAt: 10,
  });

  const stats = store.rebuildStats();

  assert.equal(stats.questionStats.q1.needsPractice, true);
  assert.equal(stats.moduleStats.legal.wrongCount, 1);
});

test('applies a question edit and refreshes affected stats', () => {
  const store = new InMemoryQuestionStore();
  store.importPackage(packageData());
  store.saveAnswerRecord({
    questionId: 'q1',
    questionRevision: 1,
    userAnswer: ['A'],
    correctAnswer: ['A'],
    isCorrect: true,
    answeredAt: 10,
  });

  const change = editQuestion(store.getQuestion('q1'), { answer: ['B'] });
  store.applyQuestionChange(change);

  const stats = store.rebuildStats();

  assert.equal(store.getQuestion('q1').revision, 2);
  assert.equal(stats.questionStats.q1.needsPractice, true);
  assert.equal(store.listRevisions('q1').length, 1);
});

test('append import adds only new questions and rejects duplicate ids', () => {
  const store = new InMemoryQuestionStore();
  store.importPackage(packageData());
  const duplicate = packageData();

  assert.throws(() => store.appendPackage(duplicate), /already exists/);

  const extra = packageData();
  extra.questions = [
    {
      ...extra.questions[0],
      id: 'q3',
      stem: '追加题干',
    },
  ];
  const result = store.appendPackage(extra);

  assert.deepEqual(store.listQuestions({ scope: 'all' }).map((question) => question.id), ['q1', 'q2', 'q3']);
  assert.equal(result.mode, 'append');
  assert.deepEqual(result.refresh, { scope: 'all', reason: 'import_append' });
  assert.equal(result.stats.moduleStats.legal.totalCount, 2);
});

test('overwrite import updates existing questions with revision history', () => {
  const store = new InMemoryQuestionStore();
  store.importPackage(packageData());
  store.saveAnswerRecord({
    questionId: 'q1',
    questionRevision: 1,
    userAnswer: ['A'],
    correctAnswer: ['A'],
    isCorrect: true,
    answeredAt: 10,
  });
  const update = packageData();
  update.questions = [
    {
      ...update.questions[0],
      stem: '覆盖后的题干',
      answer: ['B'],
    },
  ];

  const result = store.overwritePackage(update);

  assert.equal(store.getQuestion('q1').stem, '覆盖后的题干');
  assert.equal(store.getQuestion('q1').revision, 2);
  assert.equal(store.listRevisions('q1').length, 1);
  assert.equal(result.mode, 'overwrite');
  assert.deepEqual(result.refresh, { scope: 'all', reason: 'import_overwrite' });
  assert.equal(result.stats.questionStats.q1.needsPractice, true);
});
