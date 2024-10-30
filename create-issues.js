const axios = require('axios');

// Get the GitHub token from the environment
const GITHUB_TOKEN = process.env.WOLFPACK_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Authorization token (WOLFPACK_TOKEN) is not defined.');
  process.exit(1);
}

// Function to create an issue on GitHub
async function createIssue(repoOwner, repoName, title, body) {
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;

  try {
    const response = await axios.post(url, {
      title: title,
      body: body,
    }, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Issue created: ${response.data.html_url}`);
  } catch (error) {
    console.error(`Error creating issue: ${error.response ? error.response.data.message : error.message}`);
  }
}

// Function to fetch vulnerabilities from the CISA KEV catalog
async function fetchVulnerabilities() {
  const cisaUrl = 'https://api.cisa.gov/kev/v1/vulnerabilities';

  try {
    const response = await axios.get(cisaUrl);
    return response.data.vulnerabilities; // Adjust based on the actual response structure
  } catch (error) {
    console.error(`Error fetching vulnerabilities: ${error.message}`);
    return [];
  }
}

// Main function to create issues from vulnerabilities
async function main() {
  const repoOwner = 'ums91'; // Replace with your GitHub username
  const repoName = 'Wolfpack'; // Replace with your repository name

  const vulnerabilities = await fetchVulnerabilities();

  for (const vulnerability of vulnerabilities) {
    const title = `Vulnerability: ${vulnerability.id}`; // Use vulnerability ID or name
    const body = `
### Description
- **ID**: ${vulnerability.id}
- **Published**: ${vulnerability.published}
- **CVSS Score**: ${vulnerability.cvssScore || 'N/A'}
- **CISA Link**: [CISA Vulnerability](https://www.cisa.gov/kev/?id=${vulnerability.id})

### Recommendation
- [Reference remediation guidelines here]

### Additional Information
- This issue was created automatically from the CISA KEV catalog.
    `;

    await createIssue(repoOwner, repoName, title, body);
  }
}

main();
