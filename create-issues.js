const axios = require('axios');

const GITHUB_TOKEN = process.env.WOLFPACK_TOKEN; // GitHub token stored in repository secrets
const REPO_OWNER = 'ums91'; // Your GitHub username
const REPO_NAME = 'Wolfpack'; // Your repository name

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const createIssue = async (title, body) => {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
    try {
        const response = await axios.post(url, {
            title: title,
            body: body
        }, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        console.log(`Created issue: ${response.data.html_url}`);
        return response.data.number; // Return the issue number for commenting
    } catch (error) {
        console.error('Error creating issues:', error);
        throw error;
    }
};

const commentAndCloseIssue = async (issueNumber) => {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`;
    const commentBody = "The Vulnerability has been Remediated/Patched/Mitigated and moved to next steps.";
    try {
        await axios.post(url, { body: commentBody }, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        console.log(`Commented on issue #${issueNumber}`);
        
        // Now close the issue
        const closeUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`;
        await axios.patch(closeUrl, { state: 'closed' }, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        console.log(`Closed issue #${issueNumber}`);
    } catch (error) {
        console.error('Error commenting or closing issue:', error);
    }
};

const createRandomIssues = async () => {
    const numberOfIssues = randomNumber(1, 15);
    for (let i = 0; i < numberOfIssues; i++) {
        const cveId = `CVE-${randomNumber(1000, 9999)}`;
        const vendor = `Vendor ${String.fromCharCode(65 + randomNumber(0, 25))}`; // Random vendor A-Z
        const product = `Product ${String.fromCharCode(65 + randomNumber(0, 25))}`; // Random product A-Z
        const remediationDeadline = new Date();
        remediationDeadline.setDate(remediationDeadline.getDate() + 2);
        const formattedDeadline = remediationDeadline.toISOString().split('T')[0].split('-').reverse().join('.');
        
        const title = `Vulnerability Alert ${cveId}`;
        const body = `
### Vulnerability Details
- **CVE ID**: ${cveId}
- **Vendor**: ${vendor}
- **Product**: ${product}
- **Description**: No des. available
- **Remediation Deadline**: ${formattedDeadline}

### Recommended Action
Please review the vulnerability and apply the recommended patches or mitigations.`;

        const issueNumber = await createIssue(title, body);
        await commentAndCloseIssue(issueNumber);
    }
};

createRandomIssues();
