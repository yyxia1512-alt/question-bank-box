import { AnswerRecord, PracticeFilter, QuestionSnapshot } from '../domain/QuestionTypes';

export interface QuestionRepository {
  listQuestions(filter?: PracticeFilter): Promise<QuestionSnapshot[]>;
  getQuestion(questionId: string): Promise<QuestionSnapshot | undefined>;
  saveAnswerRecord(record: AnswerRecord): Promise<void>;
  listAnswerRecords(questionId?: string): Promise<AnswerRecord[]>;
}
