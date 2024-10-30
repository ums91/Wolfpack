const axios = require('axios');

// Get the GitHub token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;  // Make sure this matches the YAML

// Check if the token is defined
if (!GITHUB_TOKEN) {
    console.error('Authorization token (GITHUB_TOKEN) is not defined.');
    process.exit(1);
}

// Example function to create issues on GitHub
async function createGitHubIssue() {
    const repoOwner = 'ums91';  // Your GitHub username
    const repoName = 'Wolfpack';  // Your repository name

    const issueData = {
        title: 'Sample Vulnerability Issue',
        body: 'Details about the vulnerability...',
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
    } catch (error) {
        console.error('Error creating issue:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

// Call the function to create the issue
createGitHubIssue();
