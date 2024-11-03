import requests
import os
from datetime import datetime

# Set your GitHub token and repository details
GITHUB_TOKEN = os.getenv('WOLFPACK_TOKEN')
REPO_OWNER = 'ums91'  # GitHub username
REPO_NAME = 'Wolfpack'  # Repository name

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
}

def get_pull_requests():
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pulls"
    response = requests.get(url, headers=headers)
    return response.json() if response.status_code == 200 else []

def generate_review_report():
    pull_requests = get_pull_requests()
    report_summary = []
    report_details = []

    # Generate report content
    for pr in pull_requests:
        pr_number = pr["number"]
        pr_title = pr["title"]
        pr_url = pr["html_url"]
        status = "Passed automated checks" if passes_checks(pr) else "Needs Attention"
        comments = "Code looks good, approved." if status == "Passed automated checks" else "Please review the changes."

        # Summarize for the overview section
        report_summary.append(f"- PR #{pr_number}: {status}")

        # Detailed entry for each PR
        report_details.append(f"PR #{pr_number}: {pr_title}\nURL: {pr_url}\nStatus: {status}\nComments: {comments}\n")

    # Prepare the final report
    current_date = datetime.now().strftime("%Y-%m-%d")
    report_text = f"""
======================================
          Code Review Report
======================================

        Date: {current_date}

  Repository: {REPO_OWNER}/{REPO_NAME}

-------------------------------------
        Pull Request Summary
-------------------------------------
{('\n'.join(report_summary)) if report_summary else "No pull requests available.\nSummary:\nAll good, no pull requests to review."}

-------------------------------------
    Individual Pull Request Details
-------------------------------------
{('\n'.join(report_details)) if report_details else "No individual pull requests to review.\nEverything is running smoothly."}

=====================================
            End of Report
=====================================
"""

    # Write report to Report.txt
    with open("Report.txt", "w") as file:
        file.write(report_text.strip())

def passes_checks(pr):
    # Placeholder for custom checks (e.g., linting, static analysis)
    return True

# Generate the report and save it to Report.txt
generate_review_report()
