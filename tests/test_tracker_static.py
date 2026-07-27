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

    def test_officially_verified_zhongxing_launch_date_is_recorded(self):
        page = Path(__file__).parents[1] / "index.html"
        source = page.read_text(encoding="utf-8")
        start = source.index('id:"zte"')
        end = source.index("\n  },", start)
        record = source[start:end]

        self.assertIn('launchDate:"2026-06-29"', record)
        self.assertIn('launchEvidence:"official"', record)

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

    def test_tracker_has_application_result_progress_and_filters(self):
        page = Path(__file__).parents[1] / "index.html"
        source = page.read_text(encoding="utf-8")

        self.assertIn('const RESULT_STEPS = ["简历初筛","测评","一面","二面","三面","终面"]', source)
        self.assertIn('id="progressFilter"', source)
        self.assertIn('id="resultFilter"', source)
        self.assertIn("function getApplicationProgress(", source)
        self.assertIn("function getResultStatus(", source)
        self.assertIn("function renderResultTimeline(", source)
        self.assertIn('value="not_started"', source)
        self.assertIn('value="active"', source)

    def test_typing_a_position_does_not_mark_a_company_as_applied(self):
        page = Path(__file__).parents[1] / "index.html"
        source = page.read_text(encoding="utf-8")

        self.assertNotIn("|| Boolean(state.appliedPosition?.trim())", source)
        self.assertNotIn("if (value.trim() && state.status === 'pending')", source)
