import { RebuiltStats } from '../domain/StatisticsService';
import {
  AnswerRecord,
  ImportMode,
  PracticeFilter,
  QbankPackageData,
  QuestionImportResult,
  QuestionModule,
  QuestionSnapshot
} from '../domain/QuestionTypes';

export interface QuestionRepository {
  listModules(): Promise<QuestionModule[]>;
  listQuestions(filter?: PracticeFilter): Promise<QuestionSnapshot[]>;
  getQuestion(questionId: string): Promise<QuestionSnapshot | undefined>;
  saveAnswerRecord(record: AnswerRecord): Promise<void>;
  listAnswerRecords(questionId?: string): Promise<AnswerRecord[]>;
  importPackage(data: QbankPackageData, mode: ImportMode): Promise<QuestionImportResult>;
  rebuildStats(): Promise<RebuiltStats>;
}
