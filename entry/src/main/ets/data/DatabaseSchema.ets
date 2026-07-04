export const DATABASE_NAME: string = 'question_bank_box.db';
export const DATABASE_VERSION: number = 1;

export const CREATE_TABLE_SQL: string[] = [
  `CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    status TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    type TEXT NOT NULL,
    stem TEXT NOT NULL,
    explanation TEXT,
    status TEXT NOT NULL,
    revision INTEGER NOT NULL,
    source TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS options (
    id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    text TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    PRIMARY KEY (question_id, id)
  )`,
  `CREATE TABLE IF NOT EXISTS question_answers (
    question_id TEXT NOT NULL,
    option_id TEXT NOT NULL,
    PRIMARY KEY (question_id, option_id)
  )`,
  `CREATE TABLE IF NOT EXISTS question_revisions (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    before_json TEXT NOT NULL,
    after_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS practice_sessions (
    id TEXT PRIMARY KEY,
    filter_json TEXT NOT NULL,
    question_ids_json TEXT NOT NULL,
    position INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS answer_records (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    question_id TEXT NOT NULL,
    question_revision INTEGER NOT NULL,
    user_answer_json TEXT NOT NULL,
    correct_answer_json TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    answered_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS question_stats (
    question_id TEXT PRIMARY KEY,
    latest_revision INTEGER NOT NULL,
    answered_count INTEGER NOT NULL,
    wrong_count INTEGER NOT NULL,
    latest_is_correct INTEGER,
    needs_practice INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS module_stats (
    module_id TEXT PRIMARY KEY,
    total_count INTEGER NOT NULL,
    practiced_count INTEGER NOT NULL,
    wrong_count INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS wrong_question_overrides (
    question_id TEXT PRIMARY KEY,
    hidden INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS import_exports (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    package_name TEXT NOT NULL,
    package_version TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`
];
