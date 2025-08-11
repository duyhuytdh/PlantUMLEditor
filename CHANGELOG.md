# Changelog

All notable changes to PlantUML Editor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Real-time PlantUML diagram preview
- Docker containerization for easy deployment
- Responsive React frontend
- Java Spring Boot backend
- Hot reload development environment
- Comprehensive documentation
- CI/CD pipeline with GitHub Actions

### Changed
- Refactored project structure for better maintainability
- Optimized Docker builds with pre-built JAR approach
- Simplified deployment with one-command startup

### Fixed
- Maven SSL issues in Docker builds
- Container networking and health checks

## [1.0.0] - 2025-08-11

### Added
- 🎨 **Modern Web Interface**: Clean, responsive React frontend
- ⚡ **Real-time Preview**: Instant diagram rendering as you type
- 🐳 **Docker Ready**: Complete containerization with Docker Compose
- 🔧 **Development Tools**: Hot reload, debugging support
- 📚 **Full Documentation**: Comprehensive guides and API docs
- 🏗️ **Production Ready**: Optimized builds and deployment configs

### Features
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Spring Boot 2.7 + PlantUML Library
- **Deployment**: Docker + Docker Compose
- **Development**: Hot reload + Health checks
- **Documentation**: README + Contributing guides

### Supported Diagram Types
- Sequence diagrams
- Class diagrams
- Use case diagrams
- Activity diagrams
- State diagrams
- Component diagrams
- Deployment diagrams

### Architecture
```
React Frontend (5173) ←→ Spring Boot Backend (8090)
        ↓                           ↓
    Nginx Proxy              PlantUML Library
```

### Quick Start
```bash
git clone <repository>
cd PlantUMLEditor
./start.bat
```

### API Endpoints
- `GET /api/plantuml/health` - Health check
- `POST /api/plantuml/generate` - Generate diagrams
- `GET /api/plantuml/png/{encoded}` - PNG generation
- `GET /api/plantuml/svg/{encoded}` - SVG generation

### Environment Support
- **Development**: Hot reload + debugging
- **Production**: Optimized builds + security
- **Docker**: Single-command deployment

---

## Release Notes Format

### Types of Changes
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Versioning
- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible
