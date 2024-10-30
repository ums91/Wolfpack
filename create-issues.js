const axios = require('axios');

// Function to generate random number
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Function to generate random date
const getRandomDate = (daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
};

// Function to create issue
const createIssue = async (issueTitle, issueBody) => {
    const url = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues`;
    await axios.post(url, {
        title: issueTitle,
        body: issueBody,
        headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
        }
    });
};

// Function to comment and close the issue
const commentAndCloseIssue = async (issueNumber) => {
    const commentUrl = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/${issueNumber}/comments`;
    const closeUrl = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/${issueNumber}`;

    // Commenting on the issue
    await axios.post(commentUrl, {
        body: "The Vulnerability has been Remediated/Patched/Mitigated and moved to next steps."
    }, {
        headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
        }
    });

    // Closing the issue
    await axios.patch(closeUrl, {
        state: 'closed'
    }, {
        headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
        }
    });
};

const vendors = ["Vendor A", "Vendor B", "Vendor C"]; // Add more vendor names as needed
const products = ["Product A", "Product B", "Product C"]; // Add more product names as needed

const createRandomIssues = async () => {
    const numberOfIssues = getRandomNumber(1, 14); // Create between 1 and 14 issues
    for (let i = 0; i < numberOfIssues; i++) {
        const randomNumber = getRandomNumber(1000, 9999);
        const issueTitle = `Vulnerability Alert CVE${randomNumber}`;
        const issueBody = `
### Vulnerability Details
- **CVE ID**: CVE-${randomNumber}
- **Vendor**: ${vendors[getRandomNumber(0, vendors.length - 1)]}
- **Product**: ${products[getRandomNumber(0, products.length - 1)]}
- **Description**: No des. available
- **Remediation Deadline**: ${getRandomDate(2)}

### Recommended Action
Please review the vulnerability and apply the recommended patches or mitigations.
        `;
        await createIssue(issueTitle, issueBody);
        // After creating the issue, comment and close it
        await commentAndCloseIssue(randomNumber);
    }
};

// Run the function to create random issues
createRandomIssues()
    .then(() => console.log("Random issues created, commented, and closed successfully."))
    .catch(err => console.error("Error creating issues:", err));
