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
    validatePackageOrThrow(data);

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
    return buildImportResult('replace_all', this.rebuildStats());
  }

  appendPackage(data) {
    validatePackageOrThrow(data);
    const duplicate = data.questions.find((question) => this.questions.has(question.id));
    if (duplicate) {
      throw new Error(`question already exists: ${duplicate.id}`);
    }

    const nextModules = new Map(this.modules);
    const nextQuestions = new Map(this.questions);
    for (const module of data.modules) {
      if (!nextModules.has(module.id)) {
        nextModules.set(module.id, clone(module));
      }
    }
    for (const question of data.questions) {
      nextQuestions.set(question.id, normalizeQuestion(question));
    }

    this.modules = nextModules;
    this.questions = nextQuestions;
    return buildImportResult('append', this.rebuildStats());
  }

  overwritePackage(data) {
    validatePackageOrThrow(data);
    const nextModules = new Map(this.modules);
    const nextQuestions = new Map(this.questions);
    const nextRevisions = this.revisions.map(clone);

    for (const module of data.modules) {
      if (!nextModules.has(module.id)) {
        nextModules.set(module.id, clone(module));
      }
    }

    for (const incoming of data.questions) {
      const normalized = normalizeQuestion(incoming);
      const existing = nextQuestions.get(normalized.id);
      if (existing) {
        const updated = { ...normalized, revision: existing.revision + 1 };
        nextQuestions.set(updated.id, updated);
        nextRevisions.push({
          questionId: updated.id,
          before: clone(existing),
          after: clone(updated),
        });
      } else {
        nextQuestions.set(normalized.id, normalized);
      }
    }

    this.modules = nextModules;
    this.questions = nextQuestions;
    this.revisions = nextRevisions;
    return buildImportResult('overwrite', this.rebuildStats());
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

function validatePackageOrThrow(data) {
  const validation = validateQbankPackageData(data);
  if (!validation.valid) {
    const message = validation.errors.map((item) => item.message).join('; ');
    throw new Error(`invalid package: ${message}`);
  }
}

function buildImportResult(mode, stats) {
  return {
    mode,
    refresh: {
      scope: 'all',
      reason: `import_${mode}`,
    },
    stats,
  };
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
