# Question Bank Package Format

User-side imports use a fixed structured package. The app does not parse PDFs.

## Package

A package is a `qbank.zip` file containing:

- `manifest.json`
- `modules.json`
- `questions.json`
- `checksums.json`

## manifest.json

```json
{
  "name": "题库匣种子题库",
  "version": "2026.05",
  "format_version": 1,
  "question_count": 475
}
```

## modules.json

```json
[
  {
    "id": "legal-regulations",
    "order": 1,
    "name": "相关法律法规",
    "status": "active"
  }
]
```

## questions.json

```json
[
  {
    "id": "q-1-single_choice-001",
    "module_id": "legal-regulations",
    "type": "single_choice",
    "stem": "示例题干内容（ ）",
    "options": [
      { "id": "A", "text": "选项文本" },
      { "id": "B", "text": "选项文本" }
    ],
    "answer": ["B"],
    "explanation": "解析文本",
    "status": "active",
    "revision": 1
  }
]
```

Allowed `type` values:

- `single_choice`
- `multiple_choice`
- `true_false`

Answer rules:

- `single_choice`: exactly one option ID.
- `multiple_choice`: one or more option IDs.
- `true_false`: exactly one of `true` or `false`.

Import rules:

- All IDs must be unique.
- Every question must reference an existing module.
- Every answer must reference an existing option.
- Invalid packages are rejected before any database write.
- `manifest.question_count`, when present, must match the number of questions.

## Import Modes

The app supports two user-facing update modes:

- Append: add new question IDs only. If any incoming question ID already exists, the whole import is rejected.
- Overwrite: update existing question IDs and add new IDs. Updating an existing question increments its revision and records a before/after revision snapshot.

The built-in first-launch seed uses a replace-all import internally.

Every successful import must trigger a full consistency refresh:

- rebuild question stats;
- rebuild module stats;
- re-evaluate wrong-question visibility against current question revisions.

This is required even for append imports because module totals can change.
