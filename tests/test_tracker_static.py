from pathlib import Path
import unittest


class TrackerStaticTests(unittest.TestCase):
    def test_tracker_defines_all_render_and_progress_helpers(self):
        page = Path(__file__).parents[1] / "index.html"
        source = page.read_text(encoding="utf-8")

        for name in ("escapeHtml", "autoUpdateStatus", "updateMiniDots"):
            self.assertIn(f"function {name}(", source)
