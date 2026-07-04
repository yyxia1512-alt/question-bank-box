import {
  ConsistencyRefreshScope,
  ImportMode,
  QuestionImportResult,
  QbankPackageData
} from '../domain/QuestionTypes';

export function buildQuestionImportResult(mode: ImportMode, data: QbankPackageData): QuestionImportResult {
  const questionIds = data.questions.map((question) => question.id);
  return {
    mode,
    importedQuestionCount: questionIds.length,
    changedQuestionIds: questionIds,
    refresh: {
      scope: ConsistencyRefreshScope.All,
      questionIds,
      reason: importReason(mode)
    }
  };
}

function importReason(mode: ImportMode): string {
  if (mode === ImportMode.ReplaceAll) {
    return 'import_replace_all';
  }
  if (mode === ImportMode.Append) {
    return 'import_append';
  }
  return 'import_overwrite';
}
