# Contributing to ProxPanel

Thank you for your interest in contributing to ProxPanel! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the [GitHub Issues](https://github.com/your-org/proxpanel/issues) page
- Search existing issues before creating a new one
- Use the provided issue templates
- Include detailed reproduction steps
- Provide system information and logs when relevant

### Suggesting Features
- Open a [Feature Request](https://github.com/your-org/proxpanel/issues/new?template=feature_request.md)
- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider the impact on existing users

### Code Contributions

#### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/proxpanel.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Set up the development environment (see README.md)

#### Development Setup
\`\`\`bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Set up database
npm run db:setup

# Start development server
npm run dev
\`\`\`

#### Code Standards
- **TypeScript**: All new code must be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code must be formatted with Prettier
- **Testing**: Include tests for new features
- **Documentation**: Update documentation for API changes

#### Commit Guidelines
We follow [Conventional Commits](https://conventionalcommits.org/):

\`\`\`
feat: add user management dashboard
fix: resolve VPS power state synchronization
docs: update API documentation
style: format code with prettier
refactor: simplify authentication middleware
test: add unit tests for VPS operations
chore: update dependencies
\`\`\`

#### Pull Request Process
1. Update documentation for any new features
2. Add tests for your changes
3. Ensure all tests pass: `npm test`
4. Update the CHANGELOG.md if applicable
5. Create a pull request with a clear title and description
6. Link any related issues
7. Request review from maintainers

## 🏗️ Development Guidelines

### Architecture
- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API routes
- **Database**: MySQL with proper migrations
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS with shadcn/ui

### File Structure
\`\`\`
├── app/                 # Next.js app directory
├── components/          # Reusable React components
├── lib/                # Utility functions and configurations
├── hooks/              # Custom React hooks
├── database/           # Database schema and migrations
├── scripts/            # Deployment and utility scripts
└── docs/               # Documentation
\`\`\`

### API Design
- RESTful endpoints where possible
- Consistent error handling
- Proper HTTP status codes
- Input validation and sanitization
- Rate limiting for security

### Security Considerations
- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP security guidelines

## 🧪 Testing

### Running Tests
\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
\`\`\`

### Test Types
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows
- **Security Tests**: Authentication and authorization

## 📚 Documentation

### Code Documentation
- Use JSDoc for functions and classes
- Include examples in documentation
- Document complex algorithms
- Explain business logic

### API Documentation
- Update OpenAPI/Swagger specs
- Include request/response examples
- Document error codes
- Provide usage examples

## 🐛 Bug Reports

When reporting bugs, please include:
- **Environment**: OS, Node.js version, browser
- **Steps to Reproduce**: Detailed step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Logs**: Relevant error messages or logs

## 💡 Feature Requests

For feature requests, please provide:
- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions you've considered
- **Use Cases**: Real-world scenarios
- **Impact**: Who would benefit from this feature?

## 🔒 Security

### Reporting Security Issues
- **DO NOT** open public issues for security vulnerabilities
- Email security issues to: security@proxpanel.com
- Include detailed information about the vulnerability
- Allow time for the issue to be addressed before disclosure

### Security Best Practices
- Keep dependencies updated
- Use secure coding practices
- Implement proper input validation
- Follow authentication best practices
- Regular security audits

## 📋 Code Review Process

### For Contributors
- Keep pull requests focused and small
- Write clear commit messages
- Include tests for new functionality
- Update documentation as needed
- Respond to feedback promptly

### For Reviewers
- Be constructive and respectful
- Focus on code quality and security
- Check for proper testing
- Verify documentation updates
- Consider performance implications

## 🎯 Development Priorities

### High Priority
- Security improvements
- Performance optimizations
- Bug fixes
- Core functionality

### Medium Priority
- New features
- UI/UX improvements
- Developer experience
- Documentation

### Low Priority
- Nice-to-have features
- Code refactoring
- Experimental features

## 📞 Getting Help

### Community Support
- **GitHub Discussions**: General questions and discussions
- **Discord**: Real-time community chat
- **Stack Overflow**: Technical questions (tag: proxpanel)

### Maintainer Contact
- **GitHub Issues**: Bug reports and feature requests
- **Email**: maintainers@proxpanel.com
- **Twitter**: @proxpanel

## 📄 License

By contributing to ProxPanel, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md for significant contributions
- Annual contributor highlights
- Special badges for long-term contributors

---

Thank you for contributing to ProxPanel! 🚀
