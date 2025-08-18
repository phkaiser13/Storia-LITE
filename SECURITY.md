# Security Policy

The StorIA-LITE team takes security seriously. We appreciate your efforts to responsibly disclose your findings, and we will make every effort to acknowledge your contributions.

## Supported Versions

We are committed to providing security updates for the latest major version of StorIA-LITE. Please ensure you are using the most recent version before reporting a vulnerability.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We are grateful for security researchers and users who report vulnerabilities to us. All reports are thoroughly investigated by our team.

To report a security vulnerability, please send an email to **security@vytruve.org** with a detailed description of the issue. Please do not create a public GitHub issue.

When reporting a vulnerability, please include the following details:

*   A clear and descriptive summary of the vulnerability.
*   The version of StorIA-LITE you are using.
*   The steps to reproduce the vulnerability.
*   Any proof-of-concept code, screenshots, or videos that can help us understand the issue.
*   The potential impact of the vulnerability.

### What to Expect

After you have submitted a report, you should receive an acknowledgment within 48 hours. We will then investigate the issue and work on a fix. We will keep you informed of our progress and will notify you when a fix is released.

We kindly ask you to not disclose the vulnerability publicly until we have had a chance to address it. We will coordinate with you on the public disclosure of the vulnerability.

### Security Best Practices

While we strive to make StorIA-LITE as secure as possible, the security of your installation also depends on the environment it is running in. We recommend the following best practices:

*   **Keep your dependencies up to date**: Regularly update .NET, Node.js, and other dependencies to their latest versions.
*   **Use strong secrets**: Use strong, unique passwords for your database and a long, random secret for your JWTs. Store them securely and do not commit them to your repository.
*   **Secure your environment**: Follow security best practices for your operating system, web server, and database.
*   **Limit access**: Only grant access to the system to authorized users.

Thank you for helping keep StorIA-LITE secure.
