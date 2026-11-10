# Contributing to FixMyArea

Thank you for your interest in contributing to FixMyArea. As a civic infrastructure engineering project, we maintain rigorous standards for code quality, architectural clarity, and test coverage.

---

## Code of Conduct

All contributors are expected to uphold a professional, inclusive, and collaborative environment. Respectful communication and constructive feedback are mandatory.

---

## Development Workflow

### 1. Branch Naming Conventions
Follow standard Git feature branch naming patterns:
* `feature/<short-description>`: New functional capabilities or modules.
* `fix/<short-description>`: Defect repairs or bug fixes.
* `perf/<short-description>`: Performance optimizations.
* `refactor/<short-description>`: Architectural adjustments without behavioral modification.
* `docs/<short-description>`: Documentation improvements.

### 2. Local Setup
1. Fork the repository and clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/FixMyArea.git
   cd FixMyArea
   ```
2. Configure local environment files using `.env.example`:
   ```bash
   cp server/.env.example server/.env
   ```
3. Install dependencies across client and server:
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```
4. Seed local development database:
   ```bash
   npm run seed
   ```

### 3. Commit Message Standards
We follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```
Examples:
* `feat(geospatial): optimize spherical deduplication radius query`
* `fix(certificate): enforce citizen verification sign-off gate`
* `docs(readme): expand API specifications and deployment instructions`

---

## Code Style & Architectural Standards

* **React Components**: Functional components with React hooks. Avoid prop drilling where Context or custom hooks are appropriate.
* **Backend Controllers**: Keep route handlers lightweight. Business logic belongs in service modules (`server/src/services/`).
* **Error Handling**: Use asynchronous error wrapping or dedicated middleware. Never leave unhandled promise rejections.
* **Security**: Never commit credentials, private keys, or API tokens. Keep secrets isolated in `.env`.

---

## Pull Request Submission Checklist

Before submitting a pull request:
1. Verify the frontend builds cleanly without warnings:
   ```bash
   cd client && npm run build
   ```
2. Verify the server entry point loads without errors:
   ```bash
   node -e "require('./api/index');"
   ```
3. Ensure no temporary files or IDE artifacts are committed.
4. Describe the problem solved and provide verification steps in the pull request description.
