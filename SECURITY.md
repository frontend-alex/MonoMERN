# Security Policy

This document describes how security is handled in the **MonoMERN** monorepo and how to report vulnerabilities.

> Note: This project is currently under active development and **not** intended for production use without a full security review by the deploying organization.

---

## Supported Versions

Until an official `v1.0.0` release is tagged, only the **default branch** and the latest feature branches are considered supported for security fixes.

Once versioning is introduced:

- The latest minor release of the most recent major version will receive security updates.
- Older versions may receive fixes on a best‑effort basis but are not guaranteed.

---

## Reporting a Vulnerability

If you discover a security issue in this repository:

1. **Do not open a public GitHub issue with exploit details.**
2. Instead, use one of the following options:
   - Open a **private security advisory** on GitHub for this repo.
   - Or, if advisories are not available, create an issue with the `security` label containing only a high‑level description and a way to contact you privately.
3. Provide as much detail as possible:
   - A clear description of the issue and potential impact.
   - Steps to reproduce (or proof‑of‑concept code).
   - Any affected endpoints, routes, or configuration.

We aim to:

- Acknowledge reports within **5 business days**.
- Provide an initial assessment and mitigation plan within **10 business days**.

---

## Coordinated Disclosure

When a valid vulnerability is confirmed:

1. A fix will be developed and merged into the default branch.
2. A patch release will be tagged (or a commit hash documented) with upgrade instructions.
3. Only after a fix is available will details of the vulnerability be shared publicly (in release notes or advisories), unless the reporter requests otherwise.

We strongly recommend that any production deployments stay up to date with the latest security patches.

---

## Dependency & Supply‑Chain Security

MonoMERN uses **pnpm workspaces** with separate `package.json` files for:

- `app/client` – React front‑end.
- `app/server` – Node/Express back‑end.
- `packages/shared` – shared schemas, types, and configuration.

Practices:

- Use `pnpm audit` (or GitHub Dependabot) to monitor vulnerabilities in npm dependencies.
- Update dependencies regularly and prefer non‑deprecated libraries.
- Avoid pulling in unreviewed packages with low maintenance or poor security history.

If you discover a vulnerable dependency that affects this project, please include:

- The package name and version.
- A link to the advisory (CVE, GHSA, etc.).
- How it can be exploited in the MonoMERN context if known.

---

## Secrets Management

**Never commit secrets** to this repo.

- All secrets (database URLs, JWT secrets, OAuth credentials, etc.) must be stored in environment variables and **not** checked into source control.
- Example environment configuration is documented in `apps/server/.env.example` and should be used as a reference only.
- For local development, use a `.env` file that is ignored by Git.

If you accidentally commit a secret:

1. Rotate the secret immediately (e.g., change keys/passwords in your provider).
2. Remove the secret from the Git history if possible.
3. Open a private advisory or security issue stating what was exposed and for how long.

---

## Authentication & Authorization

MonoMERN includes authentication and session handling implemented in the `apps/server` API and `apps/client` auth feature. When extending or using this code:

- Prefer secure, HTTP‑only cookies for session tokens where possible.
- Use strong, modern password hashing algorithms (e.g., bcrypt, argon2) on the server.
- Enforce minimum password complexity and rate limiting on authentication endpoints.
- Implement proper authorization checks on server routes (role‑based or permission‑based) rather than relying on client‑side checks.

Any new feature must ensure that:

- Sensitive operations (account deletion, password change, admin actions) are always protected by server‑side authorization logic.
- Input validation uses shared schemas (via `packages/shared`) to prevent injection and malformed data.

---

## Data Protection & Validation

- Use Zod schemas in `packages/shared` to validate incoming data at the API boundary.
- Sanitize and validate all user‑provided input before using it in database queries or external service calls.
- Avoid logging sensitive data (passwords, tokens, secrets, full credit card numbers) in application logs.

---

## Transport Security

This repository does not configure TLS itself; it assumes TLS termination is handled by the deployment environment (reverse proxy, load balancer, or platform). For production deployments:

- Always serve the application over **HTTPS**.
- Set appropriate security headers (e.g., HSTS, X‑Content‑Type‑Options, X‑Frame‑Options, Content‑Security‑Policy) at the ingress or reverse proxy layer.

---

## Hardening Guidance for Deployers

If you use MonoMERN as a base for a production system, consider:

- Running the server in a minimal container image with non‑root user.
- Enforcing network‑level access controls around the database and internal services.
- Enabling structured logging and central log aggregation.
- Adding monitoring and alerting for:
  - Authentication anomalies (suspicious login attempts).
  - Unusual error rates.
  - Resource exhaustion (CPU, memory, DB connections).

These deployment concerns are outside the scope of the repository itself but are critical for a secure production environment.

---

## Out of Scope

The following are currently out of scope for this project:

- Formal cryptographic review of any encryption logic.
- Regulatory compliance (GDPR, HIPAA, PCI‑DSS, etc.).
- Guaranteed SLAs or support commitments.

Organizations building on MonoMERN are responsible for conducting their own security assessments and compliance checks.
