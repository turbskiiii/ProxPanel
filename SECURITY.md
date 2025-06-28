# Security Policy

## Supported Versions

We actively support the following versions of ProxPanel with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes             |
| 0.9.x   | ✅ Yes             |
| < 0.9   | ❌ No              |

## Reporting a Vulnerability

### 🚨 **IMPORTANT: Do NOT report security vulnerabilities through public GitHub issues.**

To report a security vulnerability, please use one of the following methods:

### Preferred Method: Security Advisory
1. Go to the [Security tab](https://github.com/your-org/proxpanel/security) of this repository
2. Click "Report a vulnerability"
3. Fill out the security advisory form
4. Submit the report

### Alternative Method: Email
Send an email to **admin@turbskiiii.com** with:
- Subject line: "Security Vulnerability Report - ProxPanel"
- Detailed description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (if available)

## What to Include in Your Report

Please provide as much information as possible:

### Required Information
- **Vulnerability Type**: (e.g., SQL Injection, XSS, Authentication Bypass)
- **Affected Component**: (e.g., API endpoint, web interface, database)
- **Severity Assessment**: Your assessment of the impact
- **Reproduction Steps**: Clear, step-by-step instructions
- **Proof of Concept**: Code or screenshots demonstrating the issue

### Optional Information
- **Suggested Fix**: If you have ideas for remediation
- **References**: Links to similar vulnerabilities or documentation
- **Timeline**: Any constraints on disclosure timing

## Our Response Process

### Initial Response
- **Within 24 hours**: Acknowledgment of your report
- **Within 72 hours**: Initial assessment and severity classification
- **Within 1 week**: Detailed response with our planned approach

### Investigation Process
1. **Verification**: We reproduce and verify the vulnerability
2. **Impact Assessment**: We evaluate the scope and severity
3. **Fix Development**: We develop and test a security patch
4. **Coordinated Disclosure**: We work with you on disclosure timing

### Severity Classification

We use the following severity levels:

#### 🔴 **Critical**
- Remote code execution
- SQL injection with data access
- Authentication bypass
- Privilege escalation to admin

#### 🟠 **High**
- Significant data exposure
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Denial of service attacks

#### 🟡 **Medium**
- Information disclosure
- Session management issues
- Input validation problems
- Configuration vulnerabilities

#### 🟢 **Low**
- Minor information leaks
- Non-exploitable bugs
- Best practice violations

## Security Measures

### Current Security Implementations

#### Authentication & Authorization
- JWT tokens with HTTP-only cookies
- Role-based access control (RBAC)
- Multi-factor authentication (2FA) support
- Session management and timeout
- Rate limiting on authentication endpoints

#### Data Protection
- Input validation and sanitization
- Parameterized database queries
- Password hashing with bcrypt
- Secure API key management
- Data encryption at rest and in transit

#### Infrastructure Security
- HTTPS enforcement
- Security headers (HSTS, CSP, etc.)
- CORS configuration
- SQL injection prevention
- XSS protection

#### Monitoring & Logging
- Comprehensive audit logging
- Failed login attempt tracking
- Suspicious activity detection
- Security event alerting

### Security Best Practices for Users

#### For Administrators
- Use strong, unique passwords
- Enable two-factor authentication
- Regularly review user permissions
- Monitor audit logs for suspicious activity
- Keep ProxPanel updated to the latest version

#### For Developers
- Follow secure coding practices
- Validate all user inputs
- Use parameterized queries
- Implement proper error handling
- Regular security testing

#### For Deployment
- Use HTTPS in production
- Configure proper firewall rules
- Regular security updates
- Secure database configuration
- Monitor system logs

## Vulnerability Disclosure Timeline

### Standard Timeline
- **Day 0**: Vulnerability reported
- **Day 1-3**: Initial assessment and acknowledgment
- **Day 7-14**: Detailed investigation and fix development
- **Day 14-30**: Testing and validation of fix
- **Day 30-90**: Coordinated disclosure and patch release

### Emergency Timeline (Critical Vulnerabilities)
- **Day 0**: Vulnerability reported
- **Day 1**: Emergency assessment
- **Day 2-7**: Rapid fix development
- **Day 7-14**: Emergency patch release
- **Day 14**: Public disclosure

## Recognition

### Security Researcher Recognition
We believe in recognizing security researchers who help improve ProxPanel's security:

- **Hall of Fame**: Listed in our security acknowledgments
- **CVE Credit**: Proper attribution in CVE databases
- **Swag**: ProxPanel merchandise for significant findings
- **Reference**: Professional reference letters for career purposes

### Responsible Disclosure Rewards
While we don't offer monetary bounties, we provide:
- Public recognition and thanks
- Direct communication with our security team
- Early access to new features
- Invitation to beta testing programs

## Security Resources

### Documentation
- [Security Best Practices Guide](docs/security-guide.md)
- [Deployment Security Checklist](docs/deployment-security.md)
- [API Security Documentation](docs/api-security.md)

### Tools and Testing
- Regular automated security scanning
- Dependency vulnerability monitoring
- Code quality and security analysis
- Penetration testing (annual)

### Contact Information
- **Security Team**: admin@turbskiiii.com
- **General Contact**: admin@turbskiiii.com
- **Emergency Contact**: admin@turbskiiii.com

## Legal

### Safe Harbor
ProxPanel supports safe harbor for security researchers who:
- Make a good faith effort to avoid privacy violations
- Don't access or modify user data beyond what's necessary
- Don't perform attacks that could harm our systems
- Don't violate any applicable laws or regulations

### Scope
This security policy applies to:
- The main ProxPanel application
- Official ProxPanel APIs
- ProxPanel infrastructure and services
- Official ProxPanel documentation and websites

**Out of Scope:**
- Third-party integrations and plugins
- User-generated content
- Social engineering attacks
- Physical security issues

---

Thank you for helping keep ProxPanel and our users safe! 🔒
