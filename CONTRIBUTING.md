# Contributing to My-Portfolio

Thank you for your interest in contributing.

## Scope

This repository hosts the production portfolio platform for Deep Dey. Contributions should preserve the existing design language, user experience quality, and project intent.

## How to Contribute

1. Fork the repository.
2. Create a focused feature branch.
3. Keep changes small and directly related to one improvement.
4. Run checks locally before opening a pull request:
   - `npm run lint`
   - `npm run build`
5. If your change touches Journal or Contact flows, validate `/journal`, `/journal/view/:id`, `/journal/embed/:id`, and `/contact`.
6. Open a pull request with clear context and testing notes.

## Contribution Types

- Bug fixes (routing, UI behavior, data correctness)
- Accessibility and responsiveness improvements
- Documentation improvements (README, legal/help docs)
- Performance and maintainability refinements

## Pull Request Expectations

- Do not include unrelated refactors.
- Keep visual consistency with the Dark-Amber theme.
- Include screenshots for UI changes when relevant.
- Confirm no secrets or private credentials are added.

## Code Style

- TypeScript + React functional components
- Maintain existing file structure and naming conventions
- Prefer reusable components and data-driven updates

## Security

If your contribution relates to security, follow the process in [SECURITY.md](./SECURITY.md).
