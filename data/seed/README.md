# Seed Question Bank

This directory documents the generated seed question bank used by the first app version.
The generated question bank itself is not committed to the public repository.

- Source PDF: `/Users/bytedance/Documents/专业知识考试题库（2026年修订版）.pdf`
- Generated JSON: `qbank-v2026.05.json` (local only)
- Generated package: `qbank-v2026.05.zip` (local only)

The HarmonyOS app should import the zip package on first launch when the package is integrated locally or through a private release channel. User-side question bank updates must use the fixed structured package format; the app does not parse PDFs.

Regenerate locally:

```bash
/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  tools/qbank_parser.py \
  /Users/bytedance/Documents/专业知识考试题库（2026年修订版）.pdf \
  --json data/seed/qbank-v2026.05.json \
  --zip data/seed/qbank-v2026.05.zip
```

To integrate the seed package into a local app build, copy it to:

```bash
entry/src/main/resources/rawfile/qbank-v2026.05.zip
```

That rawfile package is intentionally ignored by Git.
