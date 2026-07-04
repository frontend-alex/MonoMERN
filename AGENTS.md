# Project Rules

## TypeScript Export Convention

Use exports consistently so factories, runtime instances, and contracts are easy to distinguish.

- Use `export function` for named factories and helpers.
- Use `export const` for configured instances, singleton objects, middleware values, constants, and maps.
- Use `export interface` for ports and dependency contracts.
- Use `export type` for aliases, DTO/helper types, and inferred factory return types.
- Do not create service interfaces by default. Use `ReturnType<typeof createXService>` for controller typing unless there is a real second implementation.

Examples:

```ts
export function createAuthService(deps: AuthServiceDeps) {
  // factory
}

export const jwtTokenService: TokenService = {
  // configured infrastructure implementation
};

export interface TokenService {
  // port
}

export type AuthServiceType = ReturnType<typeof createAuthService>;
```

Architectural boundary rule:

- Ports are for repositories and external infrastructure such as email, tokens, storage, queues, payments, and caches.
- Do not add ports for normal internal service-to-service calls unless multiple implementations or a concrete test/design need exists.
