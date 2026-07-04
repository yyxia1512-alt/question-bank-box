export enum QuestionType {
  SingleChoice = 'single_choice',
  MultipleChoice = 'multiple_choice',
  TrueFalse = 'true_false'
}

export enum QuestionStatus {
  Active = 'active',
  Deleted = 'deleted'
}

export enum ImportMode {
  ReplaceAll = 'replace_all',
  Append = 'append',
  Overwrite = 'overwrite'
}

export enum ConsistencyRefreshScope {
  All = 'all',
  Questions = 'questions'
}

export interface ConsistencyRefreshRequest {
  scope: ConsistencyRefreshScope;
  questionIds: string[];
  reason: string;
}

export interface QuestionModule {
  id: string;
  name: string;
  order: number;
  status: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionSnapshot {
  id: string;
  moduleId: string;
  type: QuestionType;
  stem: string;
  options: QuestionOption[];
  answer: string[];
  explanation: string;
  status: QuestionStatus;
  revision: number;
  practiceWeight?: number;
}

export interface PracticeFilter {
  scope: string;
  moduleId?: string;
  questionType?: QuestionType;
}

export interface AnswerRecord {
  questionId: string;
  questionRevision: number;
  userAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  answeredAt: number;
}

export interface QbankManifest {
  name: string;
  version: string;
  formatVersion: number;
  questionCount: number;
}

export interface QbankQuestionData {
  id: string;
  moduleId: string;
  type: QuestionType;
  stem: string;
  options: QuestionOption[];
  answer: string[];
  explanation: string;
  status: QuestionStatus;
  revision: number;
}

export interface QbankPackageData {
  manifest: QbankManifest;
  modules: QuestionModule[];
  questions: QbankQuestionData[];
}

export interface QuestionImportResult {
  mode: ImportMode;
  importedQuestionCount: number;
  changedQuestionIds: string[];
  refresh: ConsistencyRefreshRequest;
}
