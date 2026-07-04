const { validateQbankPackageData } = require('../import/qbankPackage');
const { rebuildStats } = require('../domain/statistics');

class InMemoryQuestionStore {
  constructor() {
    this.modules = new Map();
    this.questions = new Map();
    this.answerRecords = [];
    this.revisions = [];
    this.overrides = [];
  }

  importPackage(data) {
    const validation = validateQbankPackageData(data);
    if (!validation.valid) {
      const message = validation.errors.map((item) => item.message).join('; ');
      throw new Error(`invalid package: ${message}`);
    }

    this.modules = new Map(data.modules.map((module) => [module.id, clone(module)]));
    this.questions = new Map(
      data.questions.map((question) => [
        question.id,
        normalizeQuestion(question),
      ]),
    );
    this.answerRecords = [];
    this.revisions = [];
    this.overrides = [];
  }

  listQuestions(filter = { scope: 'all' }) {
    return Array.from(this.questions.values())
      .filter((question) => question.status === 'active')
      .filter((question) => {
        if (filter.scope === 'module') {
          return question.moduleId === filter.moduleId;
        }
        if (filter.scope === 'module_type') {
          return question.moduleId === filter.moduleId && question.type === filter.questionType;
        }
        return true;
      })
      .map(clone);
  }

  getQuestion(questionId) {
    const question = this.questions.get(questionId);
    return question ? clone(question) : undefined;
  }

  saveAnswerRecord(record) {
    this.answerRecords.push(clone(record));
  }

  listAnswerRecords(questionId) {
    return this.answerRecords
      .filter((record) => !questionId || record.questionId === questionId)
      .map(clone);
  }

  applyQuestionChange(change) {
    this.questions.set(change.question.id, clone(change.question));
    this.revisions.push(clone(change.revision));
    return this.rebuildStats();
  }

  listRevisions(questionId) {
    return this.revisions
      .filter((revision) => revision.questionId === questionId)
      .map(clone);
  }

  rebuildStats() {
    return rebuildStats({
      questions: Array.from(this.questions.values()),
      answerRecords: this.answerRecords,
      overrides: this.overrides,
    });
  }
}

function normalizeQuestion(question) {
  return {
    id: question.id,
    moduleId: question.moduleId || question.module_id,
    type: question.type,
    stem: question.stem,
    options: clone(question.options),
    answer: clone(question.answer),
    explanation: question.explanation,
    status: question.status,
    revision: question.revision,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  InMemoryQuestionStore,
};
