# AGENTS.md

## Project Snapshot

- Frontend SPA for Zele econometric models, built with React 19, TypeScript, Vite 7, and Tailwind CSS 4.
- Package manager is npm; `package-lock.json` is the lockfile. Do not switch to pnpm/yarn.
- Runtime/dev server is Vite on port `5173`; production build is `tsc -b && vite build`.
- Entry points: `src/main.tsx` renders `src/App.tsx`; routing is configured in `src/App.tsx` with `/login`, `/register`, and protected `/app/*`.
- Main source areas: `src/api`, `src/components`, `src/features/auth`, `src/features/home`, `src/features/model`, `src/hooks`, `src/stores`, `src/types`.
- No test framework, test directory, or `npm test` script is configured in this repo.
- API base URL comes from `VITE_API_BASE_URL`; fallback is `/api/v1`. `.env.example` documents local `http://localhost:8000/api/v1`.
- Vercel SPA rewrites are configured in `vercel.json`; client-side routes should continue to resolve to `index.html`.

## Required Workflow

- Read this file first, then inspect the task-relevant source before editing.
- Use `Context Routing` below; there are currently no repo-root `context/*.md` files to read.
- Make the smallest coherent change and keep existing feature boundaries intact.
- Update behavior-adjacent types in `src/types/index.ts` when API response/request shapes change.
- Update tests only if a test setup is added; otherwise validate with lint/build commands below.
- If future `context/*.md` files are introduced, update them when ownership, flows, dependencies, or responsibilities change.
- Report what changed, what validation ran, and whether context files changed.

## Context Routing

- Auth, sessions, login, registration, or protected/public route behavior: inspect `src/api/auth.ts`, `src/stores/authStore.ts`, `src/components/layout/ProtectedRoute.tsx`, `src/components/layout/PublicRoute.tsx`, and `src/features/auth/*`.
- API client behavior, credentials, base URL, or error handling: inspect `src/api/client.ts`, `src/lib/constants.ts`, and `.env.example`.
- Model list, schema loading, predictions, variable inputs, results, or history: inspect `src/api/models.ts`, `src/hooks/useModels.ts`, `src/hooks/useModelSchema.ts`, `src/features/home/*`, `src/features/model/*`, and `src/types/index.ts`.
- Workspace tabs, undo/reset, stale predictions, persisted state, or model tab cleanup: inspect `src/stores/workspaceStore.ts` and `src/components/layout/AppLayout.tsx`.
- Styling or component primitives: inspect `src/index.css`, `src/components/ui/*`, and the Tailwind classes already used in nearby components.

## Validation

- Install dependencies with `npm install` if `node_modules` is missing or stale.
- Run `npm run lint` for ESLint validation.
- Run `npm run build` for TypeScript project references plus Vite production build.
- Run `npm run dev` for local development; Vite serves on port `5173`.
- Run `npm run preview` only after a successful build when checking the built app.
- There is no focused single-test command because no test runner is configured.

## File Change Policy

- Preserve the `@/*` alias for imports from `src`; it is configured in both `vite.config.ts` and `tsconfig.app.json`.
- Keep API calls centralized under `src/api`; use React Query hooks for server reads where the existing code does.
- Be careful changing `src/stores/workspaceStore.ts`: it persists to localStorage under `zele-workspace`, so state shape changes can affect existing browser data.
- Do not commit or read secrets from `.env`; use `.env.example` for documented environment variables.
- Do not add build artifacts such as `dist/`; `.gitignore` excludes them.

## Documentation Policy

- Treat executable config and source as source of truth over the scaffold README prose.
- Update this file only for repo-specific facts future agents would likely miss.
- Do not add broad tutorials, exhaustive file trees, or generic React/Vite advice here.

## Security Policy

- The axios client uses `withCredentials: true`; preserve cookie/session assumptions unless the backend contract changes.
- `VITE_API_BASE_URL` is public client config; do not put secrets in Vite env variables.
- Avoid logging credentials, auth responses, or prediction payloads unless explicitly needed for a temporary local debug step.

## Final Response Requirements

- Summarize changed files and the user-visible effect.
- List validation commands run and their result; if skipped, say why.
- Mention whether `context/*.md` files were changed or not.
