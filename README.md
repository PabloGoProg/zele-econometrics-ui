# Zele Econometric Models UI

Frontend SPA for exploring and running Zele econometric prediction models for Pereira. The app provides authenticated access to available models, model-specific input controls, prediction results, contribution charts, and an integrated model console that chains related predictions in one workflow.

## Objective

The application gives users a practical interface to execute econometric models without interacting directly with the API. It focuses on configuring model variables, sending prediction requests, comparing outputs, and keeping short-lived workspace context such as open tabs, customized ranges, undo states, and prediction history.

## Scope

This repository contains only the client application. It does not train models, persist users, or serve prediction endpoints. Those responsibilities belong to the backend API configured through `VITE_API_BASE_URL`.

The UI supports:

- Public authentication pages for login and registration.
- Protected application routes under `/app/*`.
- Listing available models returned by the API.
- Opening each model in its own workspace tab.
- Running predictions from model schemas and user-provided variable values.
- Viewing prediction metadata, approximate formatted values, variable contributions, and per-model history.
- Adjusting variable values with sliders or text inputs.
- Editing input ranges when the current value remains inside the new range.
- Undoing input/range changes and resetting a model tab to schema defaults.
- Opening an integrated model console for the `econ_growth`, `unemployment`, and `business_growth` flow.
- Applying basic client-side prediction rate-limit feedback.

## Tech Stack

- React 19 and React Router 7 for the SPA and routes.
- TypeScript for application types.
- Vite 7 for development and production builds.
- Tailwind CSS 4 for styling.
- TanStack Query for server reads and mutations.
- Zustand for authentication and workspace state.
- Axios for API requests with cookie-based credentials.
- Recharts and Lucide React for charts and icons.

## Requirements

- Node.js compatible with Vite 7.
- npm, using the checked-in `package-lock.json`.
- A backend API that exposes the auth and model endpoints expected by `src/api`.

## Environment Configuration

Create a local `.env` file when the API is not served behind the default `/api/v1` path.

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

If the variable is omitted, the client falls back to `/api/v1`.

For production deployments, configure `VITE_API_BASE_URL` in the hosting environment. The documented production API example is:

```bash
VITE_API_BASE_URL=https://zele-econometric-models.onrender.com/api/v1
```

## Commands

Install dependencies:

```bash
npm install
```

Run the local development server on Vite's default port, `5173`:

```bash
npm run dev
```

Create a production build. This runs TypeScript project validation first and then builds the Vite app:

```bash
npm run build
```

Preview the production build locally after a successful build:

```bash
npm run preview
```

Run ESLint over the repository:

```bash
npm run lint
```

There is no configured test runner or `npm test` script in this repository.

## Application Flow

Unauthenticated users are routed to `/login` or `/register`. After a valid session is detected, protected routes under `/app/*` become available.

Inside the protected workspace, the home tab loads the list of available models from the API. Users can open individual model tabs or open the integrated model console.

For an individual model tab, the app fetches the model schema, initializes default values, renders input controls from the schema variables, and sends predictions to `/models/{modelId}/predict`. Results include the predicted value, target variable, model metadata, optional contribution data, and a local history entry.

The integrated console expects three model keys from the API: `econ_growth`, `unemployment`, and `business_growth`. It runs the economic growth model first, then uses the predicted GDP growth value as an automatic input for the unemployment and business growth models.

## API Contract Summary

The client expects these API operations:

- `POST /auth/register` creates a user session.
- `POST /auth/login` creates a user session.
- `POST /auth/logout` ends the current session.
- `GET /auth/me` returns the current user.
- `GET /models` returns available models.
- `GET /models/{modelId}/schema` returns a model schema and input variables.
- `POST /models/{modelId}/predict` returns a prediction response.

Axios is configured with `withCredentials: true`, so the backend should support cookie/session authentication and the corresponding CORS credentials policy when deployed across origins.

## Source Structure

- `src/main.tsx` mounts the React application.
- `src/App.tsx` configures providers, route guards, lazy route loading, and redirects.
- `src/api` centralizes backend calls.
- `src/components/layout` contains route layouts, protected/public route wrappers, the workspace layout, header, and tab bar.
- `src/components/ui` contains reusable UI primitives.
- `src/features/auth` contains login and registration screens and validation schemas.
- `src/features/home` contains the model list and model cards.
- `src/features/model` contains model inputs, prediction execution, result rendering, history, contribution charts, and the integrated console.
- `src/hooks` contains React Query hooks and rate-limit helpers.
- `src/stores` contains Zustand stores for auth and persisted workspace state.
- `src/types/index.ts` defines shared API and workspace types.
- `src/lib` contains constants, formatting, and error helpers.

## Deployment Notes

The app is configured as a client-side SPA. `vercel.json` rewrites all routes to `index.html`, so deep links such as `/login`, `/register`, and `/app/*` resolve correctly on Vercel.

Build artifacts are generated under `dist/` and should not be committed.
