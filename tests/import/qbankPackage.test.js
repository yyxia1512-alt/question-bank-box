const assert = require('node:assert/strict');
const test = require('node:test');

const { validateQbankPackageData } = require('../../core/import/qbankPackage');

function validPackage() {
  return {
    manifest: {
      name: '题库匣种子题库',
      version: '2026.05',
      format_version: 1,
    },
    modules: [{ id: 'legal', name: '相关法律法规', order: 1, status: 'active' }],
    questions: [
      {
        id: 'q1',
        module_id: 'legal',
        type: 'single_choice',
        stem: '题干',
        options: [
          { id: 'A', text: '选项 A' },
          { id: 'B', text: '选项 B' },
        ],
        answer: ['A'],
        explanation: '解析',
        status: 'active',
        revision: 1,
      },
    ],
  };
}

test('accepts a valid qbank package shape', () => {
  const result = validateQbankPackageData(validPackage());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('rejects duplicate question ids', () => {
  const data = validPackage();
  data.questions.push({ ...data.questions[0] });

  const result = validateQbankPackageData(data);

  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /duplicate question id/);
});

test('rejects manifest question count mismatch when provided', () => {
  const data = validPackage();
  data.manifest.question_count = 2;

  const result = validateQbankPackageData(data);

  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /question_count/);
});

test('rejects questions that reference missing modules', () => {
  const data = validPackage();
  data.questions[0].module_id = 'missing';

  const result = validateQbankPackageData(data);

  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /missing module/);
});

test('rejects unsupported question types', () => {
  const data = validPackage();
  data.questions[0].type = 'essay';

  const result = validateQbankPackageData(data);

  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /unsupported type/);
});

test('rejects single-choice questions with multiple answers', () => {
  const data = validPackage();
  data.questions[0].answer = ['A', 'B'];

  const result = validateQbankPackageData(data);

  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /single_choice/);
});

test('rejects answers that do not exist in options', () => {
  const data = validPackage();
  data.questions[0].answer = ['C'];

  const result = validateQbankPackageData(data);

  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /missing option/);
});

test('rejects true-false answers outside true and false', () => {
  const data = validPackage();
  data.questions[0].type = 'true_false';
  data.questions[0].options = [
    { id: 'true', text: '正确' },
    { id: 'false', text: '错误' },
  ];
  data.questions[0].answer = ['A'];

  const result = validateQbankPackageData(data);

  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /true_false/);
});
