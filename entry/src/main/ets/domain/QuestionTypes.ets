export enum QuestionType {
  SingleChoice = 'single_choice',
  MultipleChoice = 'multiple_choice',
  TrueFalse = 'true_false'
}

export enum QuestionStatus {
  Active = 'active',
  Deleted = 'deleted'
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
