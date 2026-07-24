from pathlib import Path
import unittest


class TrackerStaticTests(unittest.TestCase):
    def test_tracker_defines_all_render_and_progress_helpers(self):
        page = Path(__file__).parents[1] / "index.html"
        source = page.read_text(encoding="utf-8")

        for name in ("escapeHtml", "autoUpdateStatus", "updateMiniDots"):
            self.assertIn(f"function {name}(", source)

    def test_launch_status_does_not_guess_from_deadline_or_process_text(self):
        page = Path(__file__).parents[1] / "index.html"
        source = page.read_text(encoding="utf-8")

        self.assertNotIn("const match = text.match(", source)
        self.assertIn("待官网核验", source)

    def test_priority_companies_have_explicit_launch_metadata(self):
        page = Path(__file__).parents[1] / "index.html"
        source = page.read_text(encoding="utf-8")

        for company_id in ("jd", "pdd", "dji", "huolala", "hisense", "icbc"):
            start = source.index(f'id:"{company_id}"')
            end = source.index("\n  },", start)
            record = source[start:end]
            self.assertIn("launchStatus:", record)
            self.assertIn("launchDate:", record)

    def test_applied_records_override_unverified_launch_status(self):
        page = Path(__file__).parents[1] / "index.html"
        source = page.read_text(encoding="utf-8")

        self.assertIn("launchEvidence: 'application'", source)
        self.assertIn("已于 ${observed} 投递", source)

    def test_excel_2027_supplements_are_loaded_without_overwriting_official_links(self):
        page = Path(__file__).parents[1] / "index.html"
        source = page.read_text(encoding="utf-8")

        self.assertIn('src="excel-2027-supplements.js"', source)
        self.assertIn("mergeExcelSupplements()", source)
        self.assertIn("sourceUrl", source)
        self.assertIn("EXCEL_2027_EXISTING_DETAILS", source)
        self.assertIn("launchEvidence = 'source_table'", source)
        self.assertIn("已开启（来源表，启动日期待官网核验）", source)
