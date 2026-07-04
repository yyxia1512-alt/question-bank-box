from __future__ import annotations

import hashlib
import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


EXPECTED_COUNTS: dict[tuple[int, str], int] = {
    (1, "single_choice"): 81,
    (1, "multiple_choice"): 39,
    (1, "true_false"): 44,
    (2, "single_choice"): 81,
    (2, "multiple_choice"): 65,
    (2, "true_false"): 58,
    (3, "single_choice"): 9,
    (3, "multiple_choice"): 8,
    (3, "true_false"): 1,
    (4, "single_choice"): 10,
    (4, "multiple_choice"): 20,
    (4, "true_false"): 11,
    (5, "single_choice"): 29,
    (5, "multiple_choice"): 17,
    (5, "true_false"): 2,
}

MODULE_ORDER = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5}
QUESTION_TYPE = {
    "单选题": "single_choice",
    "多选题": "multiple_choice",
    "判断题": "true_false",
}
MODULE_IDS = {
    1: "legal-regulations",
    2: "real-estate-registration",
    3: "cadastral-survey",
    4: "registration-records",
    5: "case-study",
}

SECTION_RE = re.compile(r"^第([一二三四五])部分\s+(.+)$")
TYPE_RE = re.compile(r"^[一二三]、\s*(单选题|多选题|判断题)\s*$")
QUESTION_START_RE = re.compile(r"^(\d+)(?:\.|\s+)\s*(.*)")
PAGE_FOOTER_RE = re.compile(r"^-\s*\d+\s*-$")


def parse_pdf(pdf_path: Path) -> dict[str, Any]:
    try:
        import pdfplumber
    except ImportError as exc:
        raise RuntimeError("pdfplumber is required to parse the source PDF") from exc

    texts: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_no, page in enumerate(pdf.pages, start=1):
            if page_no <= 2:
                continue
            texts.append(page.extract_text() or "")
    return parse_text("\n".join(texts))


def parse_text(text: str) -> dict[str, Any]:
    raw_items = _split_questions(text)
    modules = _modules_from_items(raw_items)
    questions = [_build_question(item) for item in raw_items]
    return {
        "manifest": {
            "name": "题库匣种子题库",
            "version": "2026.05",
            "format_version": 1,
            "source": "专业知识考试题库（2026年修订版）.pdf",
            "question_count": len(questions),
        },
        "modules": modules,
        "questions": questions,
    }


def validate_bank(
    bank: dict[str, Any], expected_counts: dict[tuple[int, str], int] | None = None
) -> None:
    counts = expected_counts if expected_counts is not None else EXPECTED_COUNTS
    actual: dict[tuple[int, str], int] = {}
    module_ids = {module["id"] for module in bank["modules"]}
    question_ids: set[str] = set()

    for question in bank["questions"]:
        question_id = question["id"]
        if question_id in question_ids:
            raise ValueError(f"duplicate question id: {question_id}")
        question_ids.add(question_id)

        module_id = question["module_id"]
        if module_id not in module_ids:
            raise ValueError(f"question {question_id} references missing module {module_id}")

        question_type = question["type"]
        if question_type not in {"single_choice", "multiple_choice", "true_false"}:
            raise ValueError(f"question {question_id} has unsupported type {question_type}")

        answer = question["answer"]
        options = question["options"]
        if question_type == "single_choice" and len(answer) != 1:
            raise ValueError(f"single choice {question_id} must have exactly one answer")
        if question_type == "multiple_choice" and len(answer) < 1:
            raise ValueError(f"multiple choice {question_id} must have at least one answer")
        if question_type == "true_false" and answer not in [["true"], ["false"]]:
            raise ValueError(f"true/false {question_id} answer must be true or false")

        option_ids = {option["id"] for option in options}
        missing = [choice for choice in answer if choice not in option_ids]
        if missing:
            raise ValueError(f"question {question_id} answer references missing options: {missing}")

        key = (question["module_order"], question_type)
        actual[key] = actual.get(key, 0) + 1

    if actual != counts:
        raise ValueError(f"question count mismatch: expected {counts}, got {actual}")


def write_seed_package(bank: dict[str, Any], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payloads = {
        "manifest.json": _json_bytes(
            {
                **bank["manifest"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "module_count": len(bank["modules"]),
            }
        ),
        "modules.json": _json_bytes(bank["modules"]),
        "questions.json": _json_bytes(bank["questions"]),
    }
    checksums = {
        name: hashlib.sha256(content).hexdigest() for name, content in payloads.items()
    }
    payloads["checksums.json"] = _json_bytes(checksums)

    with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for name, content in payloads.items():
            zf.writestr(name, content)


def _split_questions(text: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    current_section: int | None = None
    current_section_name: str | None = None
    current_type: str | None = None
    expected_next = 1
    current: dict[str, Any] | None = None

    def flush_current() -> None:
        nonlocal current
        if current is not None:
            items.append(current)
            current = None

    def start_question(number: int, rest: str) -> dict[str, Any]:
        if current_section is None or current_section_name is None or current_type is None:
            raise ValueError("question found before section/type heading")
        return {
            "module_order": current_section,
            "module_name": current_section_name,
            "type": current_type,
            "number": number,
            "lines": [rest.strip()] if rest.strip() else [],
        }

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or PAGE_FOOTER_RE.fullmatch(line):
            continue

        section_match = SECTION_RE.match(line)
        if section_match:
            flush_current()
            current_section = MODULE_ORDER[section_match.group(1)]
            current_section_name = section_match.group(2).strip()
            current_type = None
            expected_next = 1
            continue

        type_match = TYPE_RE.match(line)
        if type_match:
            flush_current()
            current_type = QUESTION_TYPE[type_match.group(1)]
            expected_next = 1
            continue

        start_match = QUESTION_START_RE.match(line)
        if (
            start_match
            and current_section is not None
            and current_type is not None
            and int(start_match.group(1)) == expected_next
        ):
            flush_current()
            current = start_question(int(start_match.group(1)), start_match.group(2))
            expected_next += 1
            continue

        if current is None:
            continue

        embedded = _find_embedded_expected_question(line, expected_next)
        if embedded is None:
            current["lines"].append(line)
            continue

        before = line[: embedded.start()].strip()
        after = line[embedded.start() :].strip()
        if before:
            current["lines"].append(before)
        flush_current()
        after_match = QUESTION_START_RE.match(after)
        if after_match is None:
            raise ValueError(f"failed to parse embedded question: {after}")
        current = start_question(int(after_match.group(1)), after_match.group(2))
        expected_next += 1

    flush_current()
    return items


def _find_embedded_expected_question(line: str, expected_number: int) -> re.Match[str] | None:
    dotted = re.search(
        rf"\s({expected_number})\.\s*(?=[\u4e00-\u9fff“《甲乙丙])", line
    )
    spaced = re.search(
        rf"\s({expected_number})\s+(?=[\u4e00-\u9fff“《甲乙丙])", line
    )
    candidates: list[re.Match[str]] = []
    if dotted is not None:
        candidates.append(dotted)
    if spaced is not None:
        prefix = line[max(0, spaced.start() - 120) : spaced.start()]
        if "答案" in prefix or "解析" in prefix or re.search(r"[。；;]$", prefix.strip()):
            candidates.append(spaced)
    if not candidates:
        return None
    return min(candidates, key=lambda match: match.start())


def _modules_from_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: dict[int, str] = {}
    for item in items:
        seen[item["module_order"]] = item["module_name"]
    return [
        {"id": MODULE_IDS[order], "order": order, "name": seen[order], "status": "active"}
        for order in sorted(seen)
    ]


def _build_question(item: dict[str, Any]) -> dict[str, Any]:
    question_type = item["type"]
    raw_text = "\n".join(item["lines"]).strip()
    squashed = re.sub(r"\s+", "", raw_text)
    answer = _extract_answer(question_type, squashed, item)
    body, explanation = _split_body_and_explanation(raw_text, question_type)
    options = _extract_options(question_type, body)
    stem = _extract_stem(question_type, body, options)
    normalized_answer = _normalize_answer(question_type, answer)

    return {
        "id": f"q-{item['module_order']}-{question_type}-{item['number']:03d}",
        "module_id": MODULE_IDS[item["module_order"]],
        "module_order": item["module_order"],
        "number": item["number"],
        "type": question_type,
        "stem": stem,
        "options": options,
        "answer": normalized_answer,
        "explanation": explanation,
        "status": "active",
        "revision": 1,
        "source": "pdf-2026.05",
    }


def _extract_answer(question_type: str, squashed: str, item: dict[str, Any]) -> str:
    if question_type in {"single_choice", "multiple_choice"}:
        match = re.search(r"答案[:：\.]([A-E]+)", squashed)
        if match:
            return match.group(1)
    else:
        match = re.search(r"[（(]([√×xX对错])[）)]", squashed)
        if match:
            return match.group(1)
    raise ValueError(
        f"missing answer for module {item['module_order']} {question_type} #{item['number']}"
    )


def _normalize_answer(question_type: str, answer: str) -> list[str]:
    if question_type == "true_false":
        normalized = {"√": "true", "对": "true", "×": "false", "x": "false", "X": "false", "错": "false"}
        return [normalized[answer]]
    return list(answer)


def _split_body_and_explanation(raw_text: str, question_type: str) -> tuple[str, str]:
    text = re.sub(r"答\s*案\s*[:：\.]\s*[A-E]+", "答案：", raw_text)
    if question_type == "true_false":
        text = re.sub(r"[（(]\s*[√×xX对错]\s*[）)]", "", text, count=1)

    answer_marker = re.search(r"答案[:：]", text)
    parse_marker = re.search(r"解析\s*[:：]", text)

    if parse_marker:
        body_end = answer_marker.start() if answer_marker else parse_marker.start()
        explanation = text[parse_marker.end() :].strip()
        return text[:body_end].strip(), _clean_text(explanation)
    if answer_marker:
        return text[: answer_marker.start()].strip(), _clean_text(text[answer_marker.end() :])
    return text.strip(), ""


def _extract_options(question_type: str, body: str) -> list[dict[str, str]]:
    if question_type == "true_false":
        return [{"id": "true", "text": "正确"}, {"id": "false", "text": "错误"}]

    flat = _clean_text(body)
    matches = list(re.finditer(r"(?<![A-Za-z])([A-E])(?:[\.、]|\s+)", flat))
    options: list[dict[str, str]] = []
    for idx, match in enumerate(matches):
        option_id = match.group(1)
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(flat)
        option_text = flat[start:end].strip(" ：:;；")
        if option_text:
            options.append({"id": option_id, "text": option_text})
    return options


def _extract_stem(question_type: str, body: str, options: list[dict[str, str]]) -> str:
    if question_type == "true_false":
        return _clean_text(body)

    flat = _clean_text(body)
    if options:
        first_option = re.search(r"(?<![A-Za-z])([A-E])(?:[\.、]|\s+)", flat)
        if first_option:
            return flat[: first_option.start()].strip()
    return flat


def _clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _json_bytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True).encode("utf-8")


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Parse the source PDF into qbank seed data")
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--json", type=Path, required=True)
    parser.add_argument("--zip", type=Path, required=True)
    args = parser.parse_args()

    bank = parse_pdf(args.pdf)
    validate_bank(bank)
    args.json.parent.mkdir(parents=True, exist_ok=True)
    args.json.write_bytes(_json_bytes(bank))
    write_seed_package(bank, args.zip)


if __name__ == "__main__":
    main()
