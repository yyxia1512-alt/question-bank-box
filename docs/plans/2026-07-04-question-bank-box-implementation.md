# Question Bank Box Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the first production-oriented offline HarmonyOS question bank app from the approved design document.

**Architecture:** Implement the verifiable data pipeline and domain logic first, then wire it into a HarmonyOS ArkTS Stage project. The PDF parser produces a versioned `qbank.zip` seed package for local/private integration only; the public repository must not contain the extracted full question bank. The app imports that package into local storage and uses domain services for answer evaluation, practice sessions, wrong-question state, and question maintenance.

**Tech Stack:** Python for PDF preprocessing and seed package generation; Node.js built-in test runner for portable domain tests; HarmonyOS ArkTS/ArkUI Stage project files for the mobile app.

## Task 1: PDF Parser And Seed Package

**Files:**
- Create: `tools/qbank_parser.py`
- Create: `tests/test_qbank_parser.py`
- Create: `data/seed/README.md`
- Generate locally only: `data/seed/qbank-v2026.05.json`
- Generate locally only: `data/seed/qbank-v2026.05.zip`

**Steps:**
1. Write parser tests for module/type counts, answer extraction variants, embedded next-question splitting, and case text containing numbers.
2. Run `python3 -m unittest tests/test_qbank_parser.py` and verify tests fail because parser does not exist.
3. Implement the minimal state-machine parser.
4. Run parser tests and the real PDF extraction when the private PDF is available locally.
5. Verify output totals: 475 questions and all module/type counts match the design doc.
6. Do not commit generated full question bank JSON/zip to the public repository.
7. Commit `feat: add seed question bank parser`.

## Task 2: Domain Model And Answer Evaluation

**Files:**
- Create: `core/domain/questionBank.js`
- Create: `core/domain/answerEvaluator.js`
- Create: `tests/domain/answerEvaluator.test.js`

**Steps:**
1. Write failing tests for single-choice, multiple-choice, true/false, empty answer, invalid option, and unordered multi-choice correctness.
2. Run `node --test tests/domain/answerEvaluator.test.js` and verify expected failures.
3. Implement minimal domain objects and `evaluateAnswer`.
4. Run tests and verify green.
5. Commit `feat: add answer evaluator`.

## Task 3: Practice Session And Wrong Question Rules

**Files:**
- Create: `core/domain/practiceSession.js`
- Create: `core/domain/wrongQuestion.js`
- Create: `tests/domain/practiceSession.test.js`
- Create: `tests/domain/wrongQuestion.test.js`

**Steps:**
1. Write failing tests for full-bank, module, and module-plus-type filtering.
2. Write failing tests proving soft-deleted questions are excluded from new sessions.
3. Write failing tests for wrong-question inclusion, manual hide, and reset-after-question-revision.
4. Implement minimal services.
5. Run all Node domain tests.
6. Commit `feat: add practice and wrong question rules`.

## Task 4: Import Format Validation

**Files:**
- Create: `core/import/qbankPackage.js`
- Create: `tests/import/qbankPackage.test.js`
- Create: `docs/import-format.md`

**Steps:**
1. Write failing tests for valid package JSON, duplicate IDs, missing modules, invalid answers, and unsupported question type.
2. Implement JSON schema-style validation without external dependencies.
3. Document the fixed `qbank.zip` format.
4. Run import tests.
5. Commit `feat: validate qbank package format`.

## Task 5: HarmonyOS Project Skeleton

**Files:**
- Create: `AppScope/app.json5`
- Create: `build-profile.json5`
- Create: `hvigorfile.ts`
- Create: `oh-package.json5`
- Create: `entry/build-profile.json5`
- Create: `entry/src/main/module.json5`
- Create: `entry/src/main/resources/base/profile/main_pages.json`
- Create: `entry/src/main/ets/entryability/EntryAbility.ets`
- Create: `entry/src/main/ets/pages/Index.ets`
- Create: `entry/src/main/ets/pages/Practice.ets`
- Create: `entry/src/main/ets/pages/WrongQuestions.ets`
- Create: `entry/src/main/ets/pages/Admin.ets`
- Create: `entry/src/main/ets/pages/Stats.ets`

**Steps:**
1. Add HarmonyOS Stage project files with app name `题库匣` and internal name `QuestionBankBox`.
2. Add initial ArkUI pages matching the approved navigation.
3. Keep UI data static until storage wiring is implemented.
4. Verify file structure and JSON syntax locally.
5. Commit `feat: scaffold harmony app`.

## Task 6: ArkTS Domain Port And Local Repository Boundary

**Files:**
- Create: `entry/src/main/ets/domain/QuestionTypes.ets`
- Create: `entry/src/main/ets/domain/AnswerEvaluator.ets`
- Create: `entry/src/main/ets/domain/PracticeSessionService.ets`
- Create: `entry/src/main/ets/domain/WrongQuestionService.ets`
- Create: `entry/src/main/ets/data/QuestionRepository.ets`
- Create: `entry/src/main/ets/data/SeedQuestionBank.ets`

**Steps:**
1. Port the tested JavaScript domain logic to ArkTS.
2. Add repository interfaces before concrete RDB implementation.
3. Load seed data through a static adapter first.
4. Wire practice page to domain services.
5. Commit `feat: add arkts domain services`.

## Task 7: Persistence And Admin Flow

**Files:**
- Create: `entry/src/main/ets/data/DatabaseSchema.ets`
- Create: `entry/src/main/ets/data/QuestionAdminService.ets`
- Modify: `entry/src/main/ets/pages/Admin.ets`
- Modify: `entry/src/main/ets/pages/Stats.ets`

**Steps:**
1. Add schema definitions matching the design document.
2. Add transaction-oriented admin service APIs.
3. Implement UI stubs for edit confirmation and consistency refresh status.
4. Commit `feat: add persistence admin boundary`.

## Task 8: Verification, Docs, And Push

**Files:**
- Modify: `README.md`
- Modify: `docs/plans/2026-07-04-question-bank-app-design.md` if implementation clarifies any confirmed detail.

**Steps:**
1. Run Python parser tests.
2. Run Node domain/import tests.
3. Run local JSON syntax checks.
4. Record HarmonyOS build limitation if `ohpm/hvigorw` is unavailable.
5. Commit docs and push `main`.
