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
