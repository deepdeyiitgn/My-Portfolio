# 🤝 Contributing to My-Portfolio

Thank you for your interest in contributing! This document explains how to contribute effectively to the **Deep Dey Portfolio & System Architecture** project.

> **Note:** Due to the current academic hiatus (JEE Advanced 2027), only bug fixes, accessibility improvements, and documentation updates will be actively reviewed. Feature additions may have delayed review.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What We Accept](#what-we-accept)
- [What We Do Not Accept](#what-we-do-not-accept)
- [Getting Started](#getting-started)
- [Branch Naming](#branch-naming)
- [Commit Conventions](#commit-conventions)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Style](#code-style)
- [Testing Requirements](#testing-requirements)

---

## Code of Conduct

All contributors must follow our [Code of Conduct](./CODE_OF_CONDUCT.md). Respectful, constructive behavior is required at all times.

---

## What We Accept

| Type | Description |
| :--- | :--- |
| **Bug fixes** | Routing issues, UI regressions, data correctness problems |
| **Accessibility** | WCAG improvements, keyboard navigation, ARIA labels |
| **Responsiveness** | Mobile/tablet layout fixes (without breaking desktop) |
| **Performance** | Bundle size reductions, lazy loading improvements |
| **Documentation** | README, legal docs, CHANGELOG, code comments |
| **Typo/copy fixes** | Any text or content corrections |

---

## What We Do Not Accept

- Complete redesigns or theme changes (the Dark-Amber aesthetic is intentional)
- New page routes without prior discussion via a GitHub Issue
- Changes that increase the production bundle size significantly without justification
- Hardcoded credentials, API keys, or private data of any kind
- Automated code generators or AI-generated code dumps without review

---

## Getting Started

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/<your-username>/My-Portfolio.git
cd My-Portfolio

# 3. Add the upstream remote
git remote add upstream https://github.com/deepdeyiitgn/My-Portfolio.git

# 4. Install dependencies
npm install

# 5. Create your feature branch (see Branch Naming below)
git checkout -b fix/journal-embed-header
```

---

## Branch Naming

Use lowercase kebab-case with a type prefix:

| Type | Pattern | Example |
| :--- | :--- | :--- |
| Bug fix | `fix/<description>` | `fix/live-page-pagination` |
| Feature | `feat/<description>` | `feat/dark-mode-toggle` |
| Documentation | `docs/<description>` | `docs/update-readme` |
| Refactor | `refactor/<description>` | `refactor/header-cleanup` |
| Performance | `perf/<description>` | `perf/lazy-load-images` |
| Accessibility | `a11y/<description>` | `a11y/keyboard-nav` |

---

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types:** `fix` · `feat` · `docs` · `refactor` · `perf` · `style` · `chore` · `test`

**Examples:**
```
fix(journal): prevent embed page from showing header/footer
feat(live): add All/Stream/Video/Shorts filter tabs
docs(readme): update routes reference table
```

---

## Development Workflow

```bash
# Start the development server
npm run dev

# Run TypeScript type-checking
npm run lint

# Build for production (validates full bundle)
npm run build
```

Both `npm run lint` and `npm run build` **must pass** before opening a pull request. PRs that fail either check will not be reviewed.

> The same checks run automatically via **GitHub Actions CI** ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) on every push and pull request. A green CI badge is required for merge.

### Routes to Validate Manually

If your change touches any of these areas, manually verify them:

| Area Changed | Routes to Check |
| :--- | :--- |
| Journal/CMS | `/journal`, `/journal/view/:id`, `/journal/embed/:id` |
| Contact flow | `/contact` |
| Navigation | All pages (header/footer present, mobile menu works) |
| Live page | `/live` (tabs, pagination, embed) |
| Dashboard | `/dashboard` (image upload, journal CRUD) |
| Home page | `/` (photo badge, timeline, marquee) |
| Status page | `/status` (endpoint probes, health panel, system specs card, refresh rate limit) |
| Search | `/search` (results, trending, easter egg) |

---

## Pull Request Guidelines

1. **One concern per PR.** Do not combine unrelated fixes.
2. **Reference the related issue** if one exists (`Closes #123`).
3. **Fill out the PR template** completely — incomplete PRs may be closed.
4. **Add screenshots** for any visible UI changes (before/after preferred).
5. **Keep the diff small.** If your change touches > 10 files, split it.
6. **Do not force-push** to a PR branch after review has started.

---

## Code Style

| Rule | Standard |
| :--- | :--- |
| **Language** | TypeScript + React functional components only |
| **Styling** | Tailwind CSS utility classes — no inline styles or CSS modules |
| **Component size** | Single responsibility; split if > ~150 lines |
| **Naming** | PascalCase for components, camelCase for variables/functions |
| **Imports** | No default re-exports from barrel files; import directly |
| **Comments** | Only when explaining non-obvious logic; no commented-out code |
| **Secrets** | Never hardcode credentials, tokens, or passwords |

---

## Testing Requirements

This project does not have a formal test suite. Manual validation is the current standard:

1. `npm run lint` — TypeScript must compile with zero errors
2. `npm run build` — Vite production build must succeed
3. Manual smoke test of affected routes in a browser

If you introduce testable logic (utilities, data transforms), adding a basic unit test is welcomed but not mandatory.

---

## Security Contributions

If your contribution relates to a security vulnerability or sensitive fix, follow the private disclosure process in [SECURITY.md](./SECURITY.md) instead of opening a public PR.
