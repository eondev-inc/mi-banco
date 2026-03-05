# AGENTS.md

This file provides guidance for AI coding agents operating in this repository.
For detailed architecture, API endpoints, and data flow, see `CLAUDE.md`.

## Project Overview

Mi-Banco is a MEAN stack banking app: Angular 21 client, NestJS + Fastify backend, MongoDB.
The repo has two independent npm projects: `client/` and `backend/`. There is no root `package.json`.

## Development Commands

### Docker (full stack)

```bash
docker-compose build && docker-compose up -d
# mongo-db: 27017 | backend: 8001 | client: 80
```

### Backend (NestJS) — workdir: `backend/`

```bash
npm install                # Install dependencies
npm run build              # Compile TypeScript (nest build)
npm run start:dev          # Dev server with hot reload (--watch)
npm run lint               # ESLint with --fix
npm run format             # Prettier format src/ and test/

# Testing (Jest)
npm test                   # Run all unit tests
npm test -- --testPathPattern=usuarios      # Single test file by name pattern
npm test -- --testPathPattern=encryption    # Another example
npm run test:watch         # Watch mode
npm run test:cov           # Coverage (80% threshold: branches, functions, lines, statements)
npm run test:e2e           # E2E tests (test/*.e2e-spec.ts)
npm run test:e2e -- --testPathPattern=health  # Single E2E test
```

### Client (Angular) — workdir: `client/`

```bash
npm install                # Install dependencies
npm run build              # Production build (ng build)
npm start                  # Dev server (ng serve), default port 4200
npm run lint               # ESLint (angular-eslint)
npm test                   # Unit tests (Karma + Jasmine)
npm test -- --include=**/usuarios/**/*.spec.ts  # Single test file
npm run e2e                # E2E tests (Protractor)
```

## Code Style — Backend

### Prettier (`.prettierrc`)

- Single quotes, trailing commas (`all`), default 80 char width
- Run: `npm run format`

### ESLint (`eslint.config.mjs` — flat config)

- Extends: `eslint:recommended`, `typescript-eslint/recommendedTypeChecked`, `prettier`
- `@typescript-eslint/no-explicit-any`: off
- `@typescript-eslint/no-floating-promises`: warn
- `@typescript-eslint/no-unsafe-argument`: warn
- Prettier errors enforced via `eslint-plugin-prettier`

### TypeScript (`tsconfig.json`)

- Target: ES2021, module: commonjs
- `strictNullChecks: true`, `noImplicitAny: true`, `strictBindCallApply: true`
- `forceConsistentCasingInFileNames: true`, `noFallthroughCasesInSwitch: true`
- Path aliases — use these in imports:
  - `@/*` -> `src/*`
  - `@config/*` -> `src/config/*`
  - `@modules/*` -> `src/modules/*`
  - `@common/*` -> `src/common/*`

### Naming Conventions

- Files: `kebab-case` with suffix — `usuarios.controller.ts`, `create-usuario.dto.ts`, `user.schema.ts`
- Classes: `PascalCase` with suffix — `UsuariosService`, `CreateUsuarioDto`, `HttpExceptionFilter`
- Methods/properties: `camelCase`
- Test files: co-located as `*.spec.ts` (unit) or in `test/*.e2e-spec.ts` (e2e)

### NestJS Patterns

- **Modules** in `src/modules/<feature>/` — each has `.module.ts`, `.controller.ts`, `.service.ts`
- **DTOs** in `src/modules/<feature>/dto/` — use `class-validator` decorators for validation
  - Always add `@ApiProperty()` with description and example for Swagger docs
  - Use `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` on controller params
- **Schemas** in `src/modules/<feature>/schemas/` — Mongoose schemas with `@nestjs/mongoose`
- **Shared code** in `src/common/` — filters, guards, interceptors, pipes, validators, services
- **Config** in `src/config/` — database and logger configuration

### Error Handling

- Use NestJS built-in exceptions: `ConflictException`, `NotFoundException`, `UnauthorizedException`, etc.
- Global `HttpExceptionFilter` catches all exceptions and returns `{ ok: false, body: { message, error } }`
- Success responses follow the pattern: `{ ok: true, body: { ... } }`
- Log errors with structured objects via `Logger` or `PinoLogger` — never log passwords or sensitive data
- Re-throw known exceptions; let unknown errors propagate to the global filter

### Testing Patterns (Jest)

- Use `@nestjs/testing` `Test.createTestingModule()` for unit tests
- Mock Mongoose models with `getModelToken()` and chainable methods (`.select().lean().exec()`)
- Mock services via Jest mock objects injected through the testing module
- Coverage excludes: `*.module.ts`, `main.ts`, `*.interface.ts`, `*.dto.ts`, `*.entity.ts`, `*.schema.ts`

## Code Style — Client (Angular)

### Prettier (`.prettierrc`)

- `singleQuote: true`, `useTabs: true`, `tabWidth: 4`, `printWidth: 120`, `semi: true`, `bracketSpacing: true`
- Note: client uses **tabs**, backend uses **spaces** (different configs)

### ESLint (`.eslintrc.json`)

- Extends: `eslint:recommended`, `@typescript-eslint/recommended`, `@angular-eslint/recommended`
- Component selectors: `app-` prefix, `kebab-case` (element)
- Directive selectors: `app` prefix, `camelCase` (attribute)
- `@angular-eslint/prefer-standalone`: warn (prefer standalone components)
- `@angular-eslint/prefer-inject`: warn (prefer `inject()` over constructor injection)
- `no-console`: warn (only `console.warn` and `console.error` allowed)
- `prefer-const`: error
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn (ignore args prefixed with `_`)
- HTML templates: accessibility rules enabled via `@angular-eslint/template/accessibility`

### TypeScript (`tsconfig.json`)

- Target: ES2022, module: es2020, moduleResolution: bundler
- `strict: true` but `strictNullChecks: false` — null checks are NOT enforced on the client
- `useDefineForClassFields: false` (required for Angular decorator compatibility)
- Angular strict templates enabled (`strictTemplates: true`)

### Angular Patterns

- **Pages** (route components) in `src/app/pages/`
- **Reusable components** in `src/app/components/` and `src/app/shared/`
- **Services** in `src/app/services/` — HTTP calls use `HttpClient`, return `Observable` or `Promise`
- **Interfaces** in `src/app/interfaces/`
- **Layout** components in `src/app/layout/`
- **Core** module in `src/app/core/`
- Angular Material UI imported via `angular-material.module.ts`
- Uses `rut.js` library for Chilean RUT validation — always `clean()` before sending to API
- User notifications via `sweetalert2`
- API base URL configured in `src/environments/environment.ts`

## Important Notes

- Never commit `.env` files (backend `.env` contains DB credentials and secrets)
- The backend uses Fastify (not Express) as the HTTP adapter — use `FastifyRequest`/`FastifyReply` types
- CORS origins are configured via the `ALLOWED_ORIGINS` env variable
- Backend supports clustering via `src/cluster.ts` (controlled by `ENABLE_CLUSTER` env var)
- MongoDB connection uses `@nestjs/mongoose` with configurable pool size and timeouts
- Rate limiting is enabled on the backend via `@fastify/rate-limit`
