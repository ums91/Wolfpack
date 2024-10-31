const axios = require('axios');

// Get the GitHub token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;  // Ensure this matches the YAML

// Check if the token is defined
if (!GITHUB_TOKEN) {
    console.error('Authorization token (GITHUB_TOKEN) is not defined.');
    process.exit(1);
}

// Function to generate a random number
function getRandomNumber() {
    return Math.floor(Math.random() * 100000);  // Adjust the range as needed
}

// Function to get a random IT or software vendor
function getRandomVendor() {
    const vendors = [
        'Microsoft',
        'Apple',
        'Google',
        'Amazon',
        'IBM',
        'Oracle',
        'Cisco',
        'SAP',
        'Dell',
        'HP'
    ];
    return vendors[Math.floor(Math.random() * vendors.length)];
}

// Function to get a random IT product or software
function getRandomProduct() {
    const products = [
        'Windows Server',
        'macOS',
        'Google Chrome',
        'AWS S3',
        'IBM Watson',
        'Oracle Database',
        'Cisco ASA',
        'SAP ERP',
        'Dell PowerEdge',
        'HP ProLiant'
    ];
    return products[Math.floor(Math.random() * products.length)];
}

// Function to get a random security severity label
function getRandomSeverityLabel() {
    const severityLabels = [
        'security-issue-severity:High',
        'security-issue-severity:Low',
        'Security-Issue-Severity:Medium',
        'security-issue-severity:Severe'
    ];
    return severityLabels[Math.floor(Math.random() * severityLabels.length)];
}

// Function to create an issue on GitHub
async function createGitHubIssue() {
    const repoOwner = 'ums91';  // Your GitHub username
    const repoName = 'Wolfpack';  // Your repository name

    const cveID = `CVE-${getRandomNumber()}`;
    const vendor = getRandomVendor();
    const product = getRandomProduct();
    const currentDate = new Date();
    const remediationDeadline = new Date();
    remediationDeadline.setDate(currentDate.getDate() + 2);  // Set deadline to 2 days later

    const formattedDate = remediationDeadline.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const issueData = {
        title: `Vulnerability Alert ${cveID}`,
        body: `### Vulnerability Details\n` +
              `- **CVE ID**: ${cveID}\n` +
              `- **Vendor**: ${vendor}\n` +
              `- **Product**: ${product}\n` +
              `- **Description**: No description available\n` +
              `- **Remediation Deadline**: ${formattedDate}\n\n` +
              `### Recommended Action\n` +
              `Please review the vulnerability and apply the recommended patches or mitigations.`,
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

        // Schedule actions with delays
        setTimeout(async () => {
            await addCommentToIssue(repoOwner, repoName, issueNumber);
            
            setTimeout(async () => {
                await updateLabels(repoOwner, repoName, issueNumber);
                
                setTimeout(async () => {
                    await closeIssue(repoOwner, repoName, issueNumber);
                }, 5 * 60 * 1000);  // Wait 5 minutes to close the issue
            }, 2 * 60 * 1000);  // Wait 2 minutes to update labels

        }, 5 * 60 * 1000);  // Wait 5 minutes to post the comment

    } catch (error) {
        if (error.response && error.response.status === 403) {
            // Handle rate limiting
            console.error('Rate limit hit. Retrying after 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds
            return createGitHubIssue(); // Retry creating the issue
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

// Function to create multiple issues with a delay
async function createMultipleIssues() {
    const numberOfIssues = Math.floor(Math.random() * 15); // Random number between 0 and 14

    for (let i = 0; i < numberOfIssues; i++) {
        await createGitHubIssue(); // Create the issue
        if (i < numberOfIssues - 1) { // Don't wait after the last issue
            console.log('Waiting for 15 minutes before creating the next issue...');
            await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000)); // Wait for 15 minutes
        }
    }
}

// Call the function to create multiple issues
createMultipleIssues();
