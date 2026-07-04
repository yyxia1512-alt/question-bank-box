# 题库匣 / Question Bank Box

Offline HarmonyOS question bank practice app.

## Current State

Implemented:

- Approved product and architecture design document.
- PDF preprocessing tool for the 2026 question bank.
- PDF preprocessing tool for generating local seed question bank JSON and `qbank.zip`.
- Portable domain tests for answer evaluation, practice filtering, wrong-question state, question editing, and import validation.
- HarmonyOS ArkTS Stage project skeleton.
- Initial ArkUI pages for practice, wrong questions, question bank management, and stats.
- ArkTS domain/service boundary files and database schema definitions.
- Transaction-oriented import mode contract for replace-all, append, and overwrite flows.

Not complete yet:

- Full RDB runtime implementation.
- Full edit forms and import/export UI.
- DevEco Studio build verification.

The local machine used for this implementation does not currently have `ohpm` or `hvigorw`, so HarmonyOS build verification must be run in DevEco Studio or an environment with the HarmonyOS toolchain installed.

## Verification

Run domain and import tests:

```bash
npm test
```

Run PDF parser tests. The real-PDF count test is skipped when the source PDF is not present locally:

```bash
npm run test:parser
```

Regenerate seed package:

```bash
/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  tools/qbank_parser.py \
  /Users/bytedance/Documents/专业知识考试题库（2026年修订版）.pdf \
  --json data/seed/qbank-v2026.05.json \
  --zip data/seed/qbank-v2026.05.zip
```

## Seed Question Bank

The generated seed data is local-only and intentionally ignored by Git:

- `data/seed/qbank-v2026.05.json`
- `data/seed/qbank-v2026.05.zip`
- `entry/src/main/resources/rawfile/qbank-v2026.05.zip`

To integrate the first-launch seed package into a local app build, generate it from the private source PDF and copy the zip to `entry/src/main/resources/rawfile/qbank-v2026.05.zip`.

```bash
bash tools/integrate_seed_package.sh data/seed/qbank-v2026.05.zip
```

User-side imports should use the fixed structured format documented in `docs/import-format.md`; user-side PDF parsing is intentionally unsupported.

## Design Docs

- `docs/plans/2026-07-04-question-bank-app-design.md`
- `docs/plans/2026-07-04-question-bank-box-implementation.md`
