from pathlib import Path
import json
import os
import subprocess
import unittest


class UpdateCompaniesTests(unittest.TestCase):
    def test_extract_company_from_title_rejects_generic_search_fragments(self):
        repo = Path(__file__).parents[1]
        titles = [
            "华为2027届校园招聘",
            "2027届校园招聘",
            "校园招聘",
            "岗位汇总丨 秋招合集",
            "外企 2027届 管培生 校园招聘 官网",
        ]

        script = f"""
import {{ extractCompanyFromTitle }} from './scripts/update-companies.mjs';
const titles = {json.dumps(titles, ensure_ascii=False)};
console.log(JSON.stringify(titles.map((title) => extractCompanyFromTitle(title))));
"""
        node = os.environ.get(
            "NODE_BINARY",
            "/Users/sunyangsunshine/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node",
        )
        result = subprocess.run(
            [node, "--input-type=module", "-e", script],
            cwd=repo,
            check=True,
            capture_output=True,
            text=True,
        )

        self.assertEqual(
            json.loads(result.stdout),
            ["华为", "", "", "", ""],
        )
