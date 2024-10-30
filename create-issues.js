const axios = require('axios');

// Get the GitHub token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;  // Ensure this matches the YAML

// Check if the token is defined
if (!GITHUB_TOKEN) {
    console.error('Authorization token (GITHUB_TOKEN) is not defined.');
    process.exit(1);
}

// Function to generate random number
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
