# MonoMERN project guide

MonoMERN is a TypeScript MERN starter organized around authentication and user features, with shared contracts and explicit backend composition.

## Scope and architecture

- React/Vite client with authentication UI and feature-oriented modules.
- Express backend with auth and user modules.
- Shared Zod schemas used at client/server boundaries.
- Infrastructure adapters for persistence, authentication providers, and email.
- Unit, integration, and contract tests.

| Path | Purpose |
| --- | --- |
| [../app/client/src](<../app/client/src>) | React client |
| [../app/server/src/app](<../app/server/src/app>) | Express creation and route composition |
| [../app/server/src/modules](<../app/server/src/modules>) | Auth and user feature modules |
| [../app/server/src/infrastructure](<../app/server/src/infrastructure>) | External-service adapters |
| [../app/server/src/shared](<../app/server/src/shared>) | Shared HTTP/errors/helpers |
| [../packages/shared/src/schemas](<../packages/shared/src/schemas>) | Request contracts |
| [../tests/contracts/api-contracts.test.ts](<../tests/contracts/api-contracts.test.ts>) | Schema behavior tests |
| [../AGENTS.md](<../AGENTS.md>) | Repository development conventions |
| [../SECURITY.md](<../SECURITY.md>) | Security reporting guidance |

Backend features are composed through factories and ports. Keep transport handling in controllers/routes and business behavior in services; shared contracts provide a common validation boundary rather than replacing authorization.

## Local setup

Use Node.js compatible with the pinned pnpm 11.9.0 package manager declared by the manifests. The server build targets node20; that target alone does not define the package manager's runtime requirements. Start a local MongoDB instance.

```bash
git clone https://github.com/frontend-alex/MonoMERN.git
cd MonoMERN
pnpm install
cp app/client/.env.example app/client/.env
cp app/server/.env.example app/server/.env
```

Copy examples only on a fresh checkout; these commands and pnpm cp:env overwrite local files. Set your own database URI, SESSION_SECRET, JWT_SECRET, JWT_REFRESH_SECRET, OTP_EMAIL, and OTP_EMAIL_PASSWORD. Review [the validated environment schema](../app/server/src/config/env.ts) for exact settings and provider options. Keep the frontend API origin, CORS configuration, and OAuth callback hosts aligned.

```bash
pnpm dev
```

The server dev task runs the TypeScript entry point with tsx. To build and start the compiled backend:

```bash
pnpm build
pnpm start
```

## Current routes

The [application router](../app/server/src/app/router.ts) mounts GET /health, /api/v1/auth, and /api/v1/user. Health returns HTTP 200.

The [auth route implementation](../app/server/src/modules/auth/auth.routes.ts) defines:

| Method | Path under /api/v1/auth | Purpose |
| --- | --- | --- |
| POST | /login | Sign in |
| POST | /register | Register |
| POST | /logout | Authenticated sign out |
| POST | /refresh | Refresh session tokens |
| POST | /send-otp | Send an email OTP |
| PUT | /validate-otp | Validate OTP |
| POST | /reset-password | Send password-reset email |
| PUT | /update-password | Reset password with a reset token |
| PUT | /change-password | Change password as an authenticated user |
| GET | /providers | List configured providers |
| GET | /{provider}, /{provider}/callback | Configured OAuth flows |

These names supersede generic endpoint examples in the original README. Review the user router for its current account operations.

## Verification

```bash
pnpm verify
```

The verify script runs lint, build, and non-watch tests. Other supported commands are pnpm test (build then Vitest run), pnpm test:only (without the build step), and pnpm test:coverage.

The contract tests exercise accepted and rejected schema input; feature tests also cover service/middleware behavior. Integration tests may require environment and database setup. No dependency installation, suite execution, or live provider/email flow was performed for this documentation update.

## Limits and extension points

- This is a reusable starter, not evidence of a separately deployed business product.
- A configured provider appearing in code does not prove a working OAuth account setup.
- Review token/session behavior, email delivery, CORS, rate limiting, and environment validation before deployment.
- Add tests for new behavior at the module/contract boundary rather than assuming the starter suite covers new features.

## Review sequence

Follow create-server/create-app to router, then auth composition, controller, service, ports, and adapters. Compare request schemas with the contract tests and frontend auth hooks.
