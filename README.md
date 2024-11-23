## Issues Created Today

Total Issues Created: 1

- Issue #160


======================================
          Code Review Report
======================================

        Date: 2024-11-23

  Repository: ums91/Wolfpack

-------------------------------------
        Pull Request Summary
-------------------------------------
No pull requests available.
Summary:
All good, no pull requests to review.

-------------------------------------
    Individual Pull Request Details
-------------------------------------
No individual pull requests to review.
Everything is running smoothly.

=====================================
            End of Report
=====================================

## SAST SCAN

Run started:2024-11-23 02:45:00.905781

Test results:
>> Issue: [B113:request_without_timeout] Call to requests without timeout
   Severity: Medium   Confidence: Low
   CWE: CWE-400 (https://cwe.mitre.org/data/definitions/400.html)
   More Info: https://bandit.readthedocs.io/en/1.7.10/plugins/b113_request_without_timeout.html
   Location: ./generate_code_review_report.py:17:15
16	    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pulls"
17	    response = requests.get(url, headers=headers)
18	    return response.json() if response.status_code == 200 else []

--------------------------------------------------

Code scanned:
	Total lines of code: 59
	Total lines skipped (#nosec): 0
	Total potential issues skipped due to specifically being disabled (e.g., #nosec BXXX): 0

Run metrics:
	Total issues (by severity):
		Undefined: 0
		Low: 0
		Medium: 1
		High: 0
	Total issues (by confidence):
		Undefined: 0
		Low: 1
		Medium: 0
		High: 0
Files skipped (0):
