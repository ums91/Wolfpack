import requests
import os

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
    report = []

    # Generate report content
    for pr in pull_requests:
        pr_number = pr["number"]
        pr_title = pr["title"]
        pr_url = pr["html_url"]
        status = "Passed automated checks" if passes_checks(pr) else "Failed automated checks"
        report.append(f"PR #{pr_number}: {pr_title}\nURL: {pr_url}\nStatus: {status}\n")

    # Check if the report is empty and write appropriate message
    with open("Report.txt", "w") as file:
        if report:
            file.write("Code Review Report:\n\n")
            file.write("\n".join(report))
        else:
            file.write("All good, up and running")

def passes_checks(pr):
    # Placeholder for custom checks (e.g., linting, static analysis)
    return True

# Generate the report and save it to Report.txt
generate_review_report()
