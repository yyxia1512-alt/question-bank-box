const SUPPORTED_TYPES = new Set(['single_choice', 'multiple_choice', 'true_false']);

function validateQbankPackageData(data) {
  const errors = [];
  const modules = Array.isArray(data.modules) ? data.modules : [];
  const questions = Array.isArray(data.questions) ? data.questions : [];
  const moduleIds = new Set(modules.map((module) => module.id));
  const questionIds = new Set();

  if (!data.manifest || data.manifest.format_version !== 1) {
    errors.push(error('manifest', 'manifest.format_version must be 1'));
  }

  for (const module of modules) {
    if (!module.id || !module.name) {
      errors.push(error('modules', 'module must include id and name'));
    }
  }

  for (const question of questions) {
    const path = `questions.${question.id || '<missing>'}`;
    if (!question.id) {
      errors.push(error(path, 'question id is required'));
      continue;
    }
    if (questionIds.has(question.id)) {
      errors.push(error(path, `duplicate question id: ${question.id}`));
    }
    questionIds.add(question.id);

    if (!moduleIds.has(question.module_id)) {
      errors.push(error(path, `question references missing module: ${question.module_id}`));
    }
    if (!SUPPORTED_TYPES.has(question.type)) {
      errors.push(error(path, `unsupported type: ${question.type}`));
      continue;
    }

    validateQuestionAnswer(question, path, errors);
  }

  return { valid: errors.length === 0, errors };
}

function validateQuestionAnswer(question, path, errors) {
  const answer = Array.isArray(question.answer) ? question.answer : [];
  const options = Array.isArray(question.options) ? question.options : [];
  const optionIds = new Set(options.map((option) => option.id));

  if (question.type === 'single_choice' && answer.length !== 1) {
    errors.push(error(path, 'single_choice question must have exactly one answer'));
  }
  if (question.type === 'multiple_choice' && answer.length < 1) {
    errors.push(error(path, 'multiple_choice question must have at least one answer'));
  }
  if (question.type === 'true_false') {
    const validTrueFalse = answer.length === 1 && (answer[0] === 'true' || answer[0] === 'false');
    if (!validTrueFalse) {
      errors.push(error(path, 'true_false question answer must be true or false'));
    }
  }

  for (const choice of answer) {
    if (!optionIds.has(choice)) {
      errors.push(error(path, `answer references missing option: ${choice}`));
    }
  }
}

function error(path, message) {
  return { path, message };
}

module.exports = {
  validateQbankPackageData,
};
