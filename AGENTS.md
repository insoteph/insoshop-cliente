# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 16 app using the App Router and TypeScript. Route entry points live in `src/app`, including route-specific layouts such as `src/app/auth/layout.tsx` and pages such as `src/app/auth/login/page.tsx`. Reusable UI lives in `src/modules/<feature>/components` and shared layout wrappers live in `src/layouts`. Static files belong in `public/assets` and `public/fonts`. Use the `@/*` path alias from `tsconfig.json` for imports from `src`.

## Build, Test, and Development Commands
Prefer `pnpm` because `pnpm-lock.yaml` is committed.

- `pnpm dev`: start the local dev server at `http://localhost:3000`.
- `pnpm build`: create the production build and catch build-time issues.
- `pnpm start`: serve the production build locally.
- `pnpm lint`: run the repository ESLint configuration.

## Coding Style & Naming Conventions
Use TypeScript with strict typing enabled. Follow the existing style: 2-space indentation, double quotes, semicolons, and small functional React components. Name component files in `PascalCase` such as `LoginForm.tsx` and keep route files in Next.js defaults such as `page.tsx` and `layout.tsx`. Group code by feature under `src/modules`, and keep shared primitives in a neutral area like `src/modules/core/components`. Styling is handled with Tailwind CSS v4 in JSX plus global rules in `src/app/globals.css`.

## Frontend Feature Structure
When adding a new frontend component or refactoring a feature screen, first search for an existing component in the repo and reuse it if it already covers the need. Do not create a new component when a shared or feature-local one can be composed as-is.

When a feature genuinely needs new code, split it by responsibility instead of keeping everything in a single component file:

- `components/` for presentational UI pieces.
- `hooks/` for state, effects, callbacks, and orchestration.
- `mappers/` for transforms between API models and UI form state.
- `types/` for feature-specific contracts.
- `services/` for API calls only.

Keep the route-facing view thin. It should compose the smaller pieces and avoid holding business logic that can live in a hook, mapper, or child component.

## Testing Guidelines
There is currently no automated test runner configured and no `*.test.*` or `*.spec.*` files in the repo. Until one is added, treat `pnpm lint` and `pnpm build` as the minimum validation for every change. When adding non-trivial logic, introduce tests alongside the feature and keep the naming pattern `ComponentName.test.tsx` or `feature-name.spec.ts`.

## Commit & Pull Request Guidelines
Recent commits use short, descriptive Spanish subjects such as `Login y imagenes de Login`. Keep commits focused and use a one-line summary that describes the visible change. For pull requests, include a short description, testing notes, linked issue or task if available, and screenshots for UI changes in the auth flow.

## Security & Configuration Tips
Do not commit secrets or environment-specific credentials. Keep sensitive values in local environment files and document any new variables in the PR description.
