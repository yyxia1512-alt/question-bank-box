export interface SeedModuleSummary {
  id: string;
  name: string;
  count: number;
}

export const SEED_QUESTION_BANK_VERSION: string = '2026.05';
export const SEED_QUESTION_COUNT: number = 475;
export const SEED_PACKAGE_RAWFILE: string = 'qbank-v2026.05.zip';

export const SEED_MODULES: SeedModuleSummary[] = [
  { id: 'legal-regulations', name: '相关法律法规', count: 164 },
  { id: 'real-estate-registration', name: '不动产登记', count: 204 },
  { id: 'cadastral-survey', name: '地籍调查', count: 18 },
  { id: 'registration-records', name: '登记资料管理', count: 41 },
  { id: 'case-study', name: '综合案例', count: 48 }
];
