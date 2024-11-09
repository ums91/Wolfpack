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

        // Delay before posting a comment
        console.log('Waiting 5 minutes before adding a comment...');
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
        await addCommentToIssue(repoOwner, repoName, issueNumber);
        
        // Delay before updating labels
        console.log('Waiting 2 minutes before updating labels...');
        await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
        await updateLabels(repoOwner, repoName, issueNumber);
        
        // Delay before closing the issue
        console.log('Waiting 5 minutes before closing the issue...');
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
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

// Function to generate a random string for branch naming
function generateRandomString(length) {
    return Math.random().toString(36).substring(2, 2 + length);
}

// Function to update the README file with issues created today
async function updateReadmeWithIssues(issueNumbers, issueCount) {
    const repoOwner = 'ums91';
    const repoName = 'Wolfpack';
    const currentDate = new Date();
    let branchName = `update-readme-${currentDate.toISOString().slice(0, 10)}`;
    const readmeContent = `## Issues Created Today\n\nTotal Issues Created: ${issueCount}\n\n${issueNumbers.map(num => `- Issue #${num}`).join('\n')}\n`;

    try {
        // Check if branch already exists
        let branchExists = true;
        let randomSuffix = '';

        while (branchExists) {
            try {
                await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branchName}${randomSuffix}`, {
                    headers: { Authorization: `token ${GITHUB_TOKEN}` },
                });
                randomSuffix = `-${generateRandomString(5)}`; // Add a random suffix if branch exists
            } catch (error) {
                if (error.response.status === 404) {
                    branchExists = false;
                } else {
                    throw error;
                }
            }
        }

        branchName += randomSuffix; // Update branchName with suffix if necessary

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
                message: `Issues created on ${currentDate.toISOString().slice(0, 10)}`,
                content: Buffer.from(readmeContent).toString('base64'),
                branch: branchName,
                sha: readmeSha,
            },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        console.log(`README updated on branch ${branchName}.`);

        // Create a pull request
        const pullRequestResponse = await axios.post(
            `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`,
            {
                title: `Update README with issues created on ${currentDate.toISOString().slice(0, 10)}`,
                head: branchName,
                base: 'main',
                body: `Updating README to reflect issues created on ${currentDate.toISOString().slice(0, 10)}`,
            },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        console.log(`Pull request created: ${pullRequestResponse.data.html_url}`);

        // Merge the pull request
        await axios.put(
            `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pullRequestResponse.data.number}/merge`,
            { commit_title: `Merging README update for ${currentDate.toISOString().slice(0, 10)}` },
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        console.log('Pull request merged.');

        // Delete the branch after merging
        await axios.delete(
            `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branchName}`,
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );
        console.log(`Branch ${branchName} deleted.`);

    } catch (error) {
        console.error('Error updating README or deleting branch:', error.response ? error.response.data : error.message);
    }
}


// Main function to execute the workflow
async function main() {
    const issueNumbers = [];
    const issueCount = Math.floor(Math.random() * 3); // Random number between 0 and 2; either 0, 1, or 2.
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
