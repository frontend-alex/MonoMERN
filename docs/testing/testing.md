# Centralized Testing Architecture

> **TL;DR**: All tests live in `/tests`. Build first, test second. No exceptions.

This document explains the testing strategy for this monorepo and why it's structured this way.

---

## Table of Contents

1. [Why Tests Live in `/tests`](#why-tests-live-in-tests)
2. [Build-First Strategy](#build-first-strategy)
3. [Directory Structure](#directory-structure)
4. [How to Add New Tests](#how-to-add-new-tests)
5. [Running Tests](#running-tests)
6. [Common Failure Modes](#common-failure-modes)
7. [Why This Avoids Monorepo TS Hell](#why-this-avoids-monorepo-ts-hell)

---

## Why Tests Live in `/tests`

### The Problem with Co-located Tests

In a monorepo with multiple TypeScript configs, co-located tests (`__tests__` folders inside packages) cause:

1. **TypeScript Config Bleed**: Test-specific types (like `vitest/globals`) pollute production builds
2. **Vite/Node Environment Conflicts**: React tests need DOM, server tests need Node—mixing them causes type errors
3. **Accidental Test Bundling**: Tests can end up in production builds
4. **Red Squiggles Everywhere**: IDE shows errors in non-test code due to conflicting type definitions

### The Solution

All tests live in `/tests`. This is **intentional architecture**, not compromise:

- **Production code stays clean**: No test imports, no test types, no test tooling
- **Test tooling is isolated**: `tsconfig.test.json` handles test-only configuration
- **TypeScript configs remain predictable**: Each package's `tsconfig.json` only handles production code
- **Zero config bleed**: Test globals don't leak into production builds

---

## Build-First Strategy

### The Rule

```bash
# This is the ONLY way to run tests
pnpm test  # Runs: pnpm build && vitest run
```

**Tests NEVER run without a successful build.**

### Why This Matters

1. **Testing Compiled Artifacts**: Ensures you test what will actually run in production
2. **Path Resolution**: Built artifacts have predictable paths; source files may not
3. **TypeScript Guarantees**: Build errors are caught before tests run
4. **CI Consistency**: Same behavior locally and in CI

### Build Caching

Turbo caches builds, so subsequent runs are fast:

```bash
# First run: Full build + tests
pnpm test  # ~30s

# Second run (no changes): Cached build + tests
pnpm test  # ~3s
```

---

## Directory Structure

```
tests/
├── client/           # React component & hook tests
│   └── *.test.tsx
├── server/           # API, service, middleware tests
│   └── *.test.ts
├── shared/           # Pure unit tests for shared utilities
│   └── *.test.ts
├── integration/      # Cross-boundary tests (client ↔ server)
│   └── *.test.ts
├── contracts/        # API shape validation tests
│   └── *.test.ts
├── setup/            # Test configuration files
│   ├── global.ts     # All tests
│   ├── client.ts     # Client tests (DOM environment)
│   ├── server.ts     # Server tests (Node environment)
│   └── integration.ts # Integration tests
└── utils/            # Shared test utilities
    ├── test-helpers.ts
    └── render-helpers.tsx
```

---

## How to Add New Tests

### Client Tests (React Components)

```typescript
// tests/client/MyComponent.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@tests/utils/render-helpers'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Server Tests (APIs/Services)

```typescript
// tests/server/auth.service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createMockRequest, createMockResponse } from '@tests/utils/test-helpers'

describe('AuthService', () => {
  it('validates user credentials', async () => {
    const req = createMockRequest({ body: { email: 'test@example.com' } })
    const res = createMockResponse()
    // Test logic...
  })
})
```

### Shared Tests (Pure Utilities)

```typescript
// tests/shared/validation.test.ts
import { describe, it, expect } from 'vitest'
import { emailSchema } from '@shared/schemas/user/user.schema'

describe('emailSchema', () => {
  it('validates email format', () => {
    expect(emailSchema.safeParse('valid@email.com').success).toBe(true)
  })
})
```

### Integration Tests

```typescript
// tests/integration/auth-flow.test.ts
import { describe, it, expect } from 'vitest'
import { emailSchema, passwordSchema } from '@shared/schemas/user/user.schema'

describe('Authentication Flow', () => {
  it('validates credentials using shared schemas', async () => {
    // Test client-server contract...
  })
})
```

### Contract Tests

```typescript
// tests/contracts/user-api.test.ts
import { describe, it, expect } from 'vitest'
import { updateUserSchema } from '@shared/schemas/user/user.schema'

describe('User API Contract', () => {
  it('has not changed unexpectedly', () => {
    // Validate schema structure...
  })
})
```

---

## Running Tests

### All Tests

```bash
pnpm test              # Build + run all tests
pnpm test:watch        # Watch mode (no build, for development)
pnpm test:coverage     # Build + tests + coverage report
pnpm test:ui           # Build + interactive UI
```

### Specific Test Suites

```bash
pnpm test:client       # Only client tests
pnpm test:server       # Only server tests
pnpm test:shared       # Only shared tests
pnpm test:integration  # Only integration tests
pnpm test:contracts    # Only contract tests
```

### Filtering Tests

```bash
# Run specific test file
pnpm build && npx vitest run tests/client/App.test.tsx

# Run tests matching pattern
pnpm build && npx vitest run --grep "authentication"
```

---

## Common Failure Modes

### "Cannot find module '@/...'"

**Cause**: Build didn't run or failed.

**Fix**: Run `pnpm build` first, then check for build errors.

### "ReferenceError: expect is not defined"

**Cause**: Missing `globals: true` in Vitest config or wrong setup file.

**Fix**: Ensure your test is in the correct directory and setup files are configured.

### "Property 'toBeInTheDocument' does not exist"

**Cause**: `@testing-library/jest-dom` not imported in setup.

**Fix**: Ensure `tests/setup/client.ts` imports `@testing-library/jest-dom`.

### DOM Type Errors in Server Tests

**Cause**: Test file in wrong directory (server test in client folder).

**Fix**: Move file to correct directory. Server tests go in `tests/server/`.

### "Cannot use import statement outside a module"

**Cause**: Testing CommonJS code with ESM syntax.

**Fix**: Ensure the shared package is built before running tests.

---

## Why This Avoids Monorepo TS Hell

### The Classic Monorepo Trap

```
app/client/
├── tsconfig.json      # Needs DOM types
├── src/
│   └── components/
│       └── __tests__/ # Now needs both DOM and vitest types
│                      # Which config controls this? 💥

app/server/
├── tsconfig.json      # Needs Node types
├── src/
│   └── services/
│       └── __tests__/ # Now needs Node and vitest types
│                      # But wait, what about DOM? 💥
```

### The Solution: Separation

```
tests/                  # Single tsconfig.test.json controls all
├── client/            # Uses happy-dom environment
├── server/            # Uses Node environment
├── shared/            # Uses Node environment
└── tsconfig.test.json # One config to rule them all

app/client/             # Only production TypeScript
app/server/             # Only production TypeScript
packages/shared/        # Only production TypeScript
```

### Benefits

1. **No Type Pollution**: Production code never sees `vitest/globals`
2. **Clear Environment Boundaries**: Client tests get DOM, server tests get Node
3. **Predictable Builds**: Production builds never include test code
4. **IDE Happiness**: No red squiggles from conflicting types
5. **CI Reliability**: Same behavior everywhere

---

## Summary

| Principle | Implementation |
|-----------|---------------|
| All tests in `/tests` | No `__tests__` in production code |
| Build before test | `pnpm test` = `pnpm build && vitest run` |
| Environment isolation | Vitest workspace with per-folder configs |
| Type safety | Separate `tsconfig.test.json` |
| Clean production | Test tooling never touches production builds |

This architecture scales. This is how enterprise monorepos stay sane.
