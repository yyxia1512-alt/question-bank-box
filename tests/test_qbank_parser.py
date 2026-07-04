import json
import tempfile
import unittest
from pathlib import Path

from tools.qbank_parser import (
    EXPECTED_COUNTS,
    parse_pdf,
    parse_text,
    validate_bank,
    write_seed_package,
)


PDF_PATH = Path("/Users/bytedance/Documents/专业知识考试题库（2026年修订版）.pdf")


class QuestionBankParserTest(unittest.TestCase):
    @unittest.skipUnless(PDF_PATH.exists(), "source PDF is not committed to the public repo")
    def test_parse_real_pdf_counts_match_spec(self):
        bank = parse_pdf(PDF_PATH)

        self.assertEqual(475, len(bank["questions"]))
        actual = {}
        for question in bank["questions"]:
            key = (question["module_order"], question["type"])
            actual[key] = actual.get(key, 0) + 1

        self.assertEqual(EXPECTED_COUNTS, actual)
        validate_bank(bank)

    def test_extracts_answer_label_variants(self):
        text = """
第一部分 相关法律法规
一、 单选题
1.示例单选题题干一（ ）。
A.选项甲 B.选项乙 C.选项丙 D.选项丁 答
案：A
解析：示例解析一
2.示例单选题题干二（ ）。
A.选项甲 B.选项乙 C.选项丙 D.选项丁
答案.D
解析：示例解析二
"""
        bank = parse_text(text)

        self.assertEqual(["A", "D"], [q["answer"][0] for q in bank["questions"]])
        validate_bank(bank, expected_counts={(1, "single_choice"): 2})

    def test_splits_embedded_next_question_only_when_expected(self):
        text = """
第一部分 相关法律法规
一、 单选题
1.示例单选题题干一（ ）。
A.选项甲 B.选项乙 C.选项丙 D.选项丁
答案：D
解析：示例解析一 2 示例单选题题干二（ ）
A.选项甲 B.选项乙 C.选项丙 D.选项丁
答案：C
解析：示例解析二
"""
        bank = parse_text(text)

        self.assertEqual(2, len(bank["questions"]))
        self.assertEqual("D", bank["questions"][0]["answer"][0])
        self.assertEqual("C", bank["questions"][1]["answer"][0])
        validate_bank(bank, expected_counts={(1, "single_choice"): 2})

    def test_does_not_split_case_numbers_as_question_numbers(self):
        text = """
第五部分 综合案例
一、 单选题
1.甲、乙为示例人物，约定“某项内容归 2 岁子女所有”。2022 年 2 月，双方提交示例申请。下列表述正确的是（ ）
A.登记给甲 B.登记给乙 C.按新协议办理 D.不得办理
答案：C
解析：案例题
2.甲公司于 2022 年 2 月提交示例申请，下列表述正确的是（ ）
A.甲 B.乙 C.丙 D.丁
答案：A
解析：案例题
"""
        bank = parse_text(text)

        self.assertEqual([1, 2], [q["number"] for q in bank["questions"]])
        self.assertIn("2 岁子女", bank["questions"][0]["stem"])
        validate_bank(bank, expected_counts={(5, "single_choice"): 2})

    def test_writes_seed_package_with_manifest_and_checksums(self):
        text = """
第一部分 相关法律法规
三、 判断题
1.示例判断题题干。（×）
解析：示例解析
"""
        bank = parse_text(text)

        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "qbank.zip"
            write_seed_package(bank, output)
            self.assertTrue(output.exists())

            import zipfile

            with zipfile.ZipFile(output) as zf:
                manifest = json.loads(zf.read("manifest.json").decode("utf-8"))
                self.assertEqual("题库匣种子题库", manifest["name"])
                self.assertIn("questions.json", zf.namelist())
                self.assertIn("checksums.json", zf.namelist())


if __name__ == "__main__":
    unittest.main()
