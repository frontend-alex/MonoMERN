# Project Rules

These rules define how code should be written in this repository. Follow them for all new features and refactors unless the user explicitly asks for a different direction.

## Core Principles

- Keep the boilerplate lean. Add abstraction only when it protects a real boundary or removes real duplication.
- Prefer boring, obvious names over clever names.
- Feature code should be easy for a junior-mid developer to trace without a DI container or framework magic.
- Do not add backward-compatibility aliases unless there is a real external consumer or persisted API contract.
- Keep business logic independent from infrastructure details.

## TypeScript Export Convention

Use exports consistently so factories, runtime instances, and contracts are easy to distinguish.

- Use `export function` for named factories and helpers.
- Use `export const` for configured instances, singleton objects, middleware values, constants, schemas, and maps.
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

## Shared Package And Schemas

Shared contracts live in `packages/shared`. Do not duplicate schemas separately in client and server.

- Put request validation schemas in `packages/shared/src/schemas/<feature>/<feature>.schema.ts`.
- Export schema inferred types from the same file.
- Backend routes import schemas from `shared/schemas/...` for validation middleware.
- Frontend forms import the same schemas for React Hook Form and Zod validation.
- Put shared DTO/domain types in `packages/shared/src/types/<feature>.ts` when both client and server need them.

Example schema file:

```ts
// packages/shared/src/schemas/auth/auth.schema.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(config.user.passwordRules.minLength),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
```

Backend usage:

```ts
router.post("/login", validate(loginSchema), authController.login);
```

Frontend usage:

```ts
const form = useForm<LoginSchemaType>({
  resolver: zodResolver(loginSchema),
});
```

## Backend Architecture

Backend modules are feature-based and should stay simple.

Default module shape:

```txt
app/server/src/modules/<feature>/
  <feature>.composition.ts
  <feature>.controller.ts
  <feature>.routes.ts
  <feature>.service.ts
  <feature>.repository.ts
  <feature>.repository.port.ts
  <feature>.model.ts
```

Only create folders inside a module when there are multiple related files. For example, `auth/otp/` is justified because OTP has a model, repository, repository port, and service.

Good auth shape:

```txt
modules/auth/
  auth.composition.ts
  auth.controller.ts
  auth.routes.ts
  auth.service.ts
  auth.types.ts
  auth.cookies.ts
  auth.providers.ts
  registration.service.ts
  password.service.ts
  otp/
    otp.service.ts
    otp.repository.ts
    otp.repository.port.ts
    otp.model.ts
```

Avoid unnecessary nesting like `services/`, `controllers/`, and `routes/` folders until a module is genuinely large.

## Backend Dependency Direction

Services should not import infrastructure directly.

Correct dependency flow:

```txt
controller -> service -> repository port
service -> external port
composition -> concrete repository/infrastructure implementation
infrastructure -> external library
```

Good:

```ts
// auth.service.ts
import { TokenService } from "@/ports/token.port";
import { UserRepository } from "@/modules/users/user.repository.port";

type AuthServiceDeps = {
  userRepository: UserRepository;
  tokenService: TokenService;
};
```

Bad:

```ts
// auth.service.ts
import { jwtTokenService } from "@/infrastructure/token/jwt-token.service";
import { userRepository } from "@/modules/users/user.repository";
```

Composition files are allowed to import infrastructure:

```ts
// auth.composition.ts
import { jwtTokenService } from "@/infrastructure/token/jwt-token.service";
import { userRepository } from "@/modules/users/user.repository";

const authService = createAuthService({
  userRepository,
  tokenService: jwtTokenService,
});
```

## Ports And Infrastructure

Ports are for repositories and external infrastructure.

- Keep repository ports inside their module, for example `modules/users/user.repository.port.ts`.
- Keep external infrastructure ports in `app/server/src/ports`, for example `ports/email.port.ts` and `ports/token.port.ts`.
- Do not add ports for normal internal service-to-service calls unless multiple implementations or a concrete test/design need exists.

Use ports for:

- repositories
- email providers
- token/JWT providers
- storage providers
- queue providers
- cache providers
- payment providers

Do not create ports for:

- `AuthService`
- `UserService`
- `RegistrationService`
- normal controller-to-service calls

External infrastructure example:

```ts
// ports/email.port.ts
export interface EmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
}

// infrastructure/email/nodemailer-email.service.ts
export const nodemailerEmailService: EmailService = {
  async sendEmail(to, subject, html) {
    // nodemailer implementation
  },
};
```

## Backend Controllers And Request Helpers

Controllers should be thin. They should parse request data, call a service, and send a response.

- Do not put business logic in controllers.
- Do not access repositories from controllers.
- Use request helpers for repeated HTTP-specific safety checks.

For authenticated routes, TypeScript cannot infer that `requireAuth` ran before the controller. Use a helper instead of `req.user?.id!`.

Recommended:

```ts
// shared/http/request.ts
export function getAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user?.id) {
    throw createError("INVALID_TOKEN");
  }

  return req.user;
}
```

Controller usage:

```ts
const user = getAuthenticatedUser(req);
await userService.updateUser(user.id, req.body);
```

Keep request/response helpers in:

```txt
shared/http/request.ts
shared/http/response.ts
shared/http/middleware/
```

## Frontend Architecture

Frontend code is feature-based.

Default feature shape:

```txt
app/client/src/features/<feature>/
  hooks/
  forms/
  components/
  pages/        # only if the feature owns page-level components
```

Shared reusable UI stays outside features:

```txt
app/client/src/components/shared/
app/client/src/components/ui/
```

Feature-specific UI stays inside the feature.

## API Hooks And Data Fetching

Components should not call `useApiQuery` or `useApiMutation` directly when the operation belongs to a feature.

Create a feature hook that wraps the API call, then let the component use that hook.

Good:

```txt
features/auth/hooks/use-login.ts
features/auth/hooks/use-register.ts
features/auth/hooks/use-auth-providers.ts
features/profile/hooks/use-update-user.ts
```

Good hook pattern:

```ts
export function useLogin() {
  const { mutate: login, isPending } = useApiMutation<LoginSchemaType>(
    "POST",
    API.AUTH.PUBLIC.LOGIN,
    {
      onSuccess: () => {
        // feature behavior
      },
    },
  );

  const handleLogin = (data: LoginSchemaType) => login(data);

  return {
    isPending,
    handleLogin,
  };
}
```

Component usage:

```tsx
const { form, isPending, handleLogin } = useLogin();
```

Avoid:

```tsx
// Component directly owns API mutation details
const { mutate } = useApiMutation("POST", API.AUTH.PUBLIC.LOGIN);
```

Direct `useApiQuery` or `useApiMutation` is acceptable only for truly generic/shared components or one-off infrastructure code.

## API Routes And Constants

Keep frontend page routes and backend API routes separate.

- Frontend page routes belong in `app/client/src/config/routes.ts`.
- Shared backend API route constants may live in `packages/shared` if both client and server use them.
- Do not mix page routes and API endpoints in the same object.

If API routes are shared, use simple constants only. Do not introduce a generated client unless the project actually needs it.

## Backend Build Tooling

The server uses modern TypeScript tooling:

- `tsx` for development.
- `tsup` for production bundling.
- `tsc --noEmit` for typechecking.

Do not reintroduce:

- `module-alias`
- `nodemon`
- `ts-node`
- `tsc-alias`
- `tsc --watch` as the server dev runner

Production server output should stay lean:

```txt
app/server/build/
  index.js
  index.js.map
  infrastructure/email/templates/
```

## Naming Rules

- Use boring names that describe what the code does.
- Prefer `readEmailTemplate` over vague names like `templateRenderer` when the function reads from disk.
- Avoid `utils` junk drawers for domain-specific helpers.
- Keep email-specific helpers under `infrastructure/email`, not `shared/utils`.
- Keep one canonical export name per runtime instance. Do not add aliases like `UserRepo` for `userRepository`.

## Testing And Verification

Before finishing backend/frontend code changes, run the smallest useful verification.

- For broad code changes, run `pnpm build` and `pnpm test:only`.
- For server build/tooling changes, run `pnpm --filter server build` first, then `pnpm build`.
- If tests cannot be run, say exactly why.

## Things To Avoid

- Do not create service interfaces by default.
- Do not add ports for internal services.
- Do not import infrastructure directly into services.
- Do not put business logic in controllers.
- Do not duplicate Zod schemas in client and server.
- Do not let components own feature API calls when a feature hook is appropriate.
- Do not create deep folder nesting unless multiple related files justify it.
- Do not add compatibility aliases without a real compatibility requirement.
