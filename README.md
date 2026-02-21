# MonoMERN

A production-ready MERN stack boilerplate — MongoDB, Express, React, Node.js — with TypeScript, authentication, and Docker deployment out of the box.

<div align="center">
  <h3>Frontend</h3>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=react-hook-form&logoColor=white" alt="React Hook Form" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
</div>

<div align="center">
  <h3>Backend</h3>
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
  <img src="https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logo=passport&logoColor=white" alt="Passport.js" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" />
</div>

<div align="center">
  <h3>DevOps & Tooling</h3>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/PNPM-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="PNPM" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
</div>


## Features

- **Authentication** — JWT access/refresh tokens, OAuth (Google, GitHub, Facebook, etc.), OTP email verification, password reset
- **Monorepo** — PNPM workspaces + Turborepo for shared types, schemas, and config between client and server
- **Type-safe** — TypeScript everywhere with Zod validation on both ends
- **Docker deployment** — One-command deploy with multi-stage builds, Nginx reverse proxy, MongoDB, and optional Let's Encrypt SSL
- **Security middleware** — Helmet, CORS, CSRF protection, rate limiting, HPP, mongo-sanitize
- **Logging** — Winston with daily rotation, colored console output, and correlation tracking
- **Testing** — Vitest test suite with integration, contract, and unit tests
- **Email system** — Nodemailer with HTML templates for OTP and password reset


## Architecture

```
MonoMERN/
├── app/
│   ├── client/                 # React frontend (Vite + Tailwind + shadcn/ui)
│   │   └── src/
│   └── server/                 # Express.js API server
│       └── src/
│           ├── api/            # Routes, controllers, middlewares
│           ├── config/         # Environment, passport setup
│           ├── core/           # Services, error handling, domain logic
│           ├── infrastructure/ # Database, email, repositories
│           └── shared/         # Constants, helpers
├── packages/
│   └── shared/                 # Shared types, schemas, config
├── tests/                      # Integration & contract tests
│   ├── server/                 # API endpoint tests
│   ├── integration/            # Cross-layer tests
│   └── contracts/              # Schema contract tests
├── docker/
│   ├── client/                 # Nginx Dockerfile + config
│   ├── server/                 # Node.js multi-stage Dockerfile
│   └── docker-compose.yml      # Full stack orchestration
├── scripts/
│   └── deployment/             # deploy.ps1, deploy.sh, init-ssl.sh
└── docs/                       # Additional documentation
```


## Prerequisites

- **Node.js** v20+
- **PNPM** v10+
- **MongoDB** v6+ (local install or Docker)
- **Docker** (for containerized deployment)


## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/frontend-alex/MonoMERN.git
cd MonoMERN
pnpm install
```

### 2. Set up environment variables

```bash
pnpm run cp:env
```

This copies `.env.example` files into place. Edit `app/server/.env` with your configuration:

| Variable | Description |
|---|---|
| `DB_LOCAL_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |
| `SESSION_SECRET` | Express session secret |
| `CORS_ORIGINS` | Frontend URL (default: `http://localhost:5173`) |
| `OTP_EMAIL` | Email address for sending OTP *(optional)* |
| `OTP_EMAIL_PASSWORD` | App password for the email *(optional)* |

OAuth provider credentials (`GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, etc.) are optional — enable them in `packages/shared/src/config/config.ts` after adding real credentials.

### 3. Start development

```bash
pnpm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |


## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | User registration |
| `POST` | `/api/v1/auth/login` | User login |
| `POST` | `/api/v1/auth/logout` | User logout |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset |
| `POST` | `/api/v1/auth/reset-password` | Reset password |
| `POST` | `/api/v1/auth/verify-email` | Verify email (OTP) |

### OAuth
| Method | Endpoint |
|---|---|
| `GET` | `/api/v1/auth/google` |
| `GET` | `/api/v1/auth/github` |
| `GET` | `/api/v1/auth/facebook` |

### User Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users/profile` | Get profile |
| `PUT` | `/api/v1/users/profile` | Update profile |
| `PUT` | `/api/v1/users/password` | Change password |
| `DELETE` | `/api/v1/users/account` | Delete account |


## Testing

The project uses **Vitest** for all tests. Tests live in the `tests/` directory.

```bash
# Run full test suite (builds first)
pnpm test

# Run tests without building
pnpm test:only

# Watch mode
pnpm test:watch

# Interactive UI
pnpm test:ui

# Coverage report
pnpm test:coverage
```

### Test structure

```
tests/
├── server/         # API controller & route tests
├── integration/    # Cross-layer integration tests
├── contracts/      # Schema contract tests
├── setup/          # Test utilities & fixtures
└── setup.ts        # Global test configuration
```


## Deployment

MonoMERN includes a complete Docker deployment stack with automated scripts for both **Windows** and **Linux/macOS**.

### Quick deploy

**Windows:**
```powershell
.\scripts\deployment\deploy.ps1
```

**Linux/macOS:**
```bash
./scripts/deployment/deploy.sh
```

The deploy script will:
1. Check that Docker is installed
2. Create `docker/.env.docker` from the example template (if it doesn't exist)
3. Generate random secrets for `SESSION_SECRET`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`
4. Build and start all containers

### What gets deployed

| Container | Role | Port |
|---|---|---|
| `monomern-client` | Nginx — serves the React build and proxies `/api` to the server | 80, 443 |
| `monomern-server` | Express.js API | 3000 (internal) |
| `monomern-mongo` | MongoDB 7 | 27017 (internal) |
| `monomern-certbot` | Let's Encrypt certificate renewal | — |

### Production URLs

| Service | URL |
|---|---|
| App | http://localhost |
| API | http://localhost/api/v1 |
| Health check | http://localhost/health |

### Docker commands

```bash
# View logs
docker compose -f docker/docker-compose.yml logs -f

# View specific service logs
docker compose -f docker/docker-compose.yml logs server --tail=50

# Restart services
docker compose -f docker/docker-compose.yml restart

# Stop everything
docker compose -f docker/docker-compose.yml down

# Stop and remove volumes (deletes data)
docker compose -f docker/docker-compose.yml down -v
```

### Enable HTTPS (Linux/macOS)

```bash
./scripts/deployment/init-ssl.sh
```

This obtains a Let's Encrypt certificate for your domain and switches Nginx to the SSL configuration. Set the `DOMAIN` variable in `docker/.env.docker` first.


## Development Commands

```bash
# Start all services (client + server)
pnpm run dev

# Build all packages
pnpm run build

# Lint
pnpm run lint

# Run lint + build + tests
pnpm run verify

# Start production server (after building)
pnpm run start

# Copy email templates to build output
pnpm run copy-templates --filter server
```


## Environment Configuration

### Development — `app/server/.env`

Used when running locally with `pnpm dev`. Created by `pnpm run cp:env`.

### Docker — `docker/.env.docker`

Used by Docker Compose in production. Created automatically by the deploy script from `docker/.env.docker.example`. Key differences from development:

- `NODE_ENV=production`
- `TRUST_PROXY=1`
- `CSRF_COOKIE_SECURE=true`
- `DB_LOCAL_URI=mongodb://mongo:27017/monomern` (Docker network hostname)
- `DOMAIN=example.com` (for SSL)
- `CORS_ORIGINS=https://yourdomain.com`


## OAuth Providers

The boilerplate supports 8 OAuth providers out of the box. Each can be toggled on/off in `packages/shared/src/config/config.ts`:

```ts
providers: {
    google: false,   // set to true after adding credentials
    github: false,
    facebook: false,
    twitter: false,
    linkedin: false,
    instagram: false,
}
```

Add the corresponding `CLIENT_ID` and `CLIENT_SECRET` to your `.env` file, then set the provider to `true`.


## License

MIT
