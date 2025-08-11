# Contributing to PlantUML Editor

Thank you for your interest in contributing to PlantUML Editor! 🎉

## 🚀 Getting Started

### Prerequisites
- Java 11+
- Maven 3.6+
- Node.js 16+
- Docker & Docker Compose
- Git

### Setup Development Environment

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/PlantUMLEditor.git
   cd PlantUMLEditor
   ```

2. **Start the development environment**:
   ```bash
   # Quick start
   start.bat
   
   # Or manual setup
   docker-compose -f docker-compose.dev.yml up -d
   ```

## 🏗️ Project Structure

```
PlantUMLEditor/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API service layers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── java-plantuml-server/    # Spring Boot backend
│   └── src/main/java/
│       └── com/plantuml/server/
│           ├── controller/  # REST controllers
│           ├── service/     # Business logic
│           ├── model/       # Data models
│           └── config/      # Configuration classes
└── docs/                    # Additional documentation
```

## 🔧 Development Guidelines

### Code Style

#### Frontend (React/TypeScript)
- Use **TypeScript** for type safety
- Follow **ESLint** and **Prettier** configurations
- Use **functional components** with hooks
- Implement **proper error handling**
- Write **unit tests** for components

#### Backend (Java/Spring Boot)
- Follow **Spring Boot best practices**
- Use **proper exception handling**
- Implement **comprehensive logging**
- Write **unit and integration tests**
- Follow **RESTful API conventions**

### Commit Messages
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(frontend): add diagram export functionality`
- `fix(api): resolve PlantUML rendering issue`
- `docs(readme): update installation instructions`
- `refactor(backend): optimize PlantUML service`

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-issue` - Critical fixes
- `docs/documentation-update` - Documentation updates

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test                    # Run unit tests
npm run test:coverage      # Run with coverage
npm run test:e2e          # Run end-to-end tests
```

### Backend Tests
```bash
cd java-plantuml-server
mvn test                   # Run unit tests
mvn verify                 # Run integration tests
mvn test jacoco:report     # Generate coverage report
```

### Docker Tests
```bash
# Test Docker build
docker-compose -f docker-compose.dev.yml build --no-cache

# Test full stack
docker-compose -f docker-compose.dev.yml up -d
./status.bat  # Check if all services are healthy
```

## 📝 Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Test your changes**:
   ```bash
   # Test locally
   ./start.bat
   
   # Run tests
   cd frontend && npm test
   cd ../java-plantuml-server && mvn test
   ```

4. **Update documentation** if needed:
   - Update README.md if adding new features
   - Add/update API documentation
   - Update architecture diagrams if needed

5. **Create Pull Request**:
   - Use a descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots for UI changes

## 🐛 Bug Reports

When reporting bugs, please include:
- **Environment details** (OS, Java version, Node version)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Error logs** from browser console or server logs

Use this template:
```markdown
**Environment:**
- OS: Windows 11
- Java: 11.0.x
- Node: 16.x.x
- Docker: 20.x.x

**Steps to Reproduce:**
1. Start the application
2. Enter PlantUML code: `@startuml...`
3. Click generate
4. Error occurs

**Expected Behavior:**
Diagram should be generated

**Actual Behavior:**
Error message appears

**Screenshots:**
[Attach screenshots]

**Logs:**
[Paste relevant logs]
```

## 💡 Feature Requests

For new features, please:
1. **Check existing issues** to avoid duplicates
2. **Describe the use case** and benefit
3. **Provide mockups** for UI features
4. **Consider implementation complexity**

## 🎯 Areas for Contribution

### High Priority
- [ ] **User Authentication** - Login/logout functionality
- [ ] **Diagram Sharing** - Share diagrams via URLs
- [ ] **Export Formats** - Support PDF, SVG, etc.
- [ ] **Diagram Templates** - Pre-built diagram templates
- [ ] **Performance Optimization** - Frontend and backend improvements

### Medium Priority
- [ ] **Collaborative Editing** - Real-time collaboration
- [ ] **Diagram History** - Version control for diagrams
- [ ] **Custom Themes** - UI theming support
- [ ] **Plugin System** - Extensible architecture
- [ ] **Mobile Support** - Responsive design improvements

### Documentation
- [ ] **API Documentation** - Swagger/OpenAPI docs
- [ ] **Video Tutorials** - Usage demonstrations
- [ ] **Architecture Guide** - Detailed technical docs
- [ ] **Deployment Guide** - Production deployment
- [ ] **Troubleshooting** - Common issues and solutions

## 🏆 Recognition

Contributors will be:
- **Listed in CONTRIBUTORS.md**
- **Mentioned in release notes**
- **Credited in documentation**

## 📞 Questions?

- **GitHub Issues** - For bugs and features
- **GitHub Discussions** - For general questions
- **Email** - [maintainer-email] for private matters

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PlantUML Editor! 🙏
