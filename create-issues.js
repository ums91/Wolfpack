const axios = require('axios');

// Get the GitHub token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Check if the token is defined
if (!GITHUB_TOKEN) {
    console.error('Authorization token (GITHUB_TOKEN) is not defined.');
    process.exit(1);
}

// Function to generate a random number
function getRandomNumber() {
    return Math.floor(Math.random() * 100000);
}

// Function to get a random IT or software vendor
function getRandomVendor() {
    const vendors = [
        'Microsoft', 'Apple', 'Google', 'Amazon', 'IBM',
        'Oracle', 'Cisco', 'SAP', 'Dell', 'HP'
    ];
    return vendors[Math.floor(Math.random() * vendors.length)];
}

// Function to get a random IT product or software
function getRandomProduct() {
    const products = [
        'Windows Server', 'macOS', 'Google Chrome', 'AWS S3', 'IBM Watson',
        'Oracle Database', 'Cisco ASA', 'SAP ERP', 'Dell PowerEdge', 'HP ProLiant'
    ];
    return products[Math.floor(Math.random() * products.length)];
}

// Function to get a random security severity label
function getRandomSeverityLabel() {
    const severityLabels = [
        'security-issue-severity:High', 'security-issue-severity:Low',
        'security-issue-severity:Medium', 'security-issue-severity:Severe'
    ];
    return severityLabels[Math.floor(Math.random() * severityLabels.length)];
}

// Function to create an issue on GitHub
async function createGitHubIssue() {
    const repoOwner = 'ums91';
    const repoName = 'Wolfpack';
    const cveID = `CVE-${getRandomNumber()}`;
    const vendor = getRandomVendor();
    const product = getRandomProduct();
    const currentDate = new Date();
    const remediationDeadline = new Date();
    remediationDeadline.setDate(currentDate.getDate() + 2);
    const formattedDate = remediationDeadline.toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    const issueData = {
        title: `Vulnerability Alert ${cveID}`,
        body: `### Vulnerability Details\n
               - **CVE ID**: ${cveID}\n
               - **Vendor**: ${vendor}\n
               - **Product**: ${product}\n
               - **Description**: No description available\n
               - **Remediation Deadline**: ${formattedDate}\n\n
               ### Recommended Action\n
               Please review the vulnerability and apply the recommended patches or mitigations.`,
        labels: ["Vulnerability", "Pillar:Program", getRandomSeverityLabel()],
        milestone: 1 // Assuming milestone ID 1 for "2024Q2"
    };

    try {
        const response = await axios.post(
            `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
            issueData,
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(`Issue created: ${response.data.html_url}`);
        const issueNumber = response.data.number;

        // Perform actions with delays
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // Wait 5 minutes to post the comment
        await addCommentToIssue(repoOwner, repoName, issueNumber);
        
        await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000)); // Wait 2 minutes to update labels
        await updateLabels(repoOwner, repoName, issueNumber);
        
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // Wait 5 minutes to close the issue
        await closeIssue(repoOwner, repoName, issueNumber);

        return issueNumber; // Return the issue number

    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.error('Rate limit hit. Retrying after 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            return createGitHubIssue();
        }
        console.error('Error creating issue:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

// Function to add a comment to an issue
async function addCommentToIssue(repoOwner, repoName, issueNumber) {
    const commentData = {
        body: 'This Vulnerability has been remediated/Patched.',
    };

    try {
        await axios.post(
            `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}/comments`,
            commentData,
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`Comment added to issue #${issueNumber}`);
    } catch (error) {
        console.error('Error adding comment:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

// Function to update labels on an issue
async function updateLabels(repoOwner, repoName, issueNumber) {
    const labelData = {
        labels: ["Pillar:Program", "Remediated_Fixed_Patched"]
    };

    try {
        await axios.patch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`,
            labelData,
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`Labels updated on issue #${issueNumber}`);
    } catch (error) {
        console.error('Error updating labels:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

// Function to close an issue
async function closeIssue(repoOwner, repoName, issueNumber) {
    const issueData = {
        state: 'closed',
    };

    try {
        await axios.patch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`,
            issueData,
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`Issue #${issueNumber} closed.`);
    } catch (error) {
        console.error('Error closing issue:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

// Function to update the README file with issues created today
async function updateReadmeWithIssues(issueNumbers, issueCount) {
    const repoOwner = 'ums91';
    const repoName = 'Wolfpack';
    const currentDate = new Date();
    let branchName = `update-readme-${currentDate.toISOString().slice(0, 10)}`;
    const readmeContent = `## Issues Created Today\n\nTotal Issues Created: ${issueCount}\n\n${issueNumbers.map(num => `- Issue #${num}`).join('\n')}\n`;

    try {
        // Fetch the SHA of the main branch
        const mainBranchResponse = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/git/ref/heads/main`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` },
        });
        const mainBranchSha = mainBranchResponse.data.object.sha;

        // Create the new branch
        await axios.post(
            `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`,
            { ref: `refs/heads/${branchName}`, sha: mainBranchSha },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        console.log(`Branch ${branchName} created.`);

        // Fetch the current README file to get the SHA
        const readmeResponse = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/README.md`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` },
        });
        const readmeSha = readmeResponse.data.sha;

        // Update the README on the new branch
        await axios.put(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/README.md`,
            {
                message: `Issues for today (${currentDate.toLocaleDateString('en-GB')}) - ${issueCount} issues created`,
                content: Buffer.from(readmeContent).toString('base64'),
                sha: readmeSha,
                branch: branchName,
            },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        console.log(`README updated on branch ${branchName}.`);

        // Create a pull request
        const prResponse = await axios.post(
            `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`,
            {
                title: `Update README with issues created on ${currentDate.toLocaleDateString('en-GB')}`,
                body: `This pull request updates the README file with the issues created on ${currentDate.toLocaleDateString('en-GB')}.`,
                head: branchName,
                base: 'main',
            },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        console.log(`Pull request created: ${prResponse.data.html_url}`);

        // Fetch the latest main branch SHA to update the branch before merging
        const updatedMainBranchResponse = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/git/ref/heads/main`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` },
        });
        const updatedMainBranchSha = updatedMainBranchResponse.data.object.sha;

        // Update the branch with the latest changes
        await axios.patch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branchName}`,
            { sha: updatedMainBranchSha },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        console.log(`Branch ${branchName} updated with latest changes from main.`);

        // Merge the pull request
        await axios.put(
            `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prResponse.data.number}/merge`,
            {},
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        console.log(`Pull request merged.`);
        
    } catch (error) {
        console.error('Error updating README:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

// Main function to execute the workflow
async function main() {
    const issueNumbers = [];
    const issueCount = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
    console.log(`Attempting to create ${issueCount} issues.`);

    for (let i = 0; i < issueCount; i++) {
        const issueNumber = await createGitHubIssue();
        issueNumbers.push(issueNumber);
    }

    // Update the README with the issues created today only if there are issues created
    if (issueCount > 0) {
        await updateReadmeWithIssues(issueNumbers, issueCount);
    } else {
        console.log('No issues created today, skipping README update.');
    }
}

// Execute the main function
main().catch(err => console.error('Error in main function:', err));
