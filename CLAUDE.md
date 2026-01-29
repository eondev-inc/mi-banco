# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mi-Banco is a MEAN stack banking application (MongoDB, Express, Angular, Node.js) written entirely in TypeScript. It provides basic banking functionality including user authentication, beneficiary management, and fund transfers.

**Stack:**
- Angular 14.2.6 (client)
- Node.js 12+ with Express 4.x (server)
- MongoDB (database)
- TypeScript 4.8.4
- Docker for deployment

## Development Commands

### Docker (Primary Method)

```bash
# Build and start all services
docker-compose build
docker-compose up -d

# Services:
# - mongo-db: Port 27017
# - server (API): Port 8000
# - client (Angular): Port 80
```

### Client (Angular)

```bash
cd client
npm install           # Install dependencies
npm start             # Development server (ng serve)
npm run build         # Production build
npm test              # Run tests (Karma + Jasmine)
npm run lint          # Lint code (tslint)
npm run e2e           # E2E tests (Protractor)
```

### Server (Express API)

```bash
cd server
npm install           # Install dependencies
npm run serve         # Development mode (TypeScript watch mode)
npm run build         # Compile TypeScript to JavaScript
```

**Note:** The server uses clustering (via `cluster` module) to spawn worker processes equal to the number of CPU cores for better performance.

## Architecture

### Client Structure (Angular)

```
client/src/app/
├── pages/              # Route components
│   ├── inicio/         # Login page
│   ├── registrar/      # User registration
│   ├── transferencias/ # Make transfers
│   └── historial/      # Transfer history
├── components/         # Reusable components
│   └── navbar/         # Navigation bar
├── services/           # Angular services
│   ├── comunication-services.service.ts  # HTTP API calls
│   └── rut.service.ts                    # RUT validation utilities
└── interfaces/         # TypeScript interfaces
    ├── request-data.interface.ts
    ├── bank-list.interface.ts
    └── history.interface.ts
```

**Key Points:**
- Uses Angular Material for UI components (imported via `angular-material.module.ts`)
- API base URL configured in `src/environments/environment.ts`
- Default API endpoint: `http://34.82.228.169:8000`
- External banks API: `https://bast.dev/api/banks.php`
- Uses `rut.js` library for Chilean RUT (national ID) validation and formatting

### Server Structure (Express)

```
server/src/
├── app/
│   └── App.ts          # Express app configuration and routing
├── bin/
│   └── www.ts          # Server startup with clustering
├── routes/             # Route handlers
│   ├── usuario.routes.ts
│   ├── cuentas.routes.ts
│   └── transferencia.routes.ts
├── controllers/        # Business logic
│   ├── usuario.controller.ts
│   ├── cuentas.controller.ts
│   └── transferencia.controller.ts
├── models/             # Mongoose models
│   └── user.model.ts
├── schemes/            # Mongoose schemas
│   └── users.scheme.ts
└── utils/
    └── logger.ts
```

**Key Points:**
- Entry point: `server/src/bin/www.ts` spawns clustered workers
- Main app configuration: `server/src/app/App.ts` sets up Express, CORS, body-parser, and routes
- All routes are mounted directly on the root router (no `/api` prefix)
- TypeScript compilation required before running (output not tracked in git)

### API Endpoints

All endpoints are available at `http://localhost:8000` when running locally:

**Usuario (User)**
- `GET /usuario` - Login (params: rut, password)
- `POST /usuario` - Register new user (body: nombre, email, rut, password)

**Cuentas (Beneficiary Accounts)**
- `GET /cuentas` - Get beneficiaries (params: rut)
- `POST /cuentas` - Register new beneficiary (body: rut_destinatario, nombre, apellido, email, telefono, banco, numero_cuenta, tipo_cuenta, rut_cliente)

**Transferencias (Transfers)**
- `GET /transferencias` - Get transfer history (params: rut)
- `POST /transferencias` - Make a transfer (body: rut_destinatario, rut_cliente, nombre, banco, tipo_cuenta, monto)

### Data Flow

1. **User Authentication**: Login via `inicio` page → calls `/usuario` endpoint → stores user data in component
2. **Beneficiary Management**: User registers beneficiaries via `registrar` page → calls `/cuentas` endpoint → stored in MongoDB
3. **Transfers**: User selects beneficiary in `transferencias` page → calls `/transferencias` endpoint → transfer recorded in history
4. **History**: View all transfers in `historial` page → calls `/transferencias` GET endpoint

### RUT Handling

This application extensively uses Chilean RUT (Rol Único Tributario):
- The `rut.js` library provides validation and formatting
- `clean()` function removes formatting before sending to API
- All user and beneficiary identification uses RUT

## Database

- MongoDB database name: `mi-banco`
- Connection configured via Docker Compose linking
- Mongoose used for ODM (Object Document Mapping)
- Schema defined in `server/src/schemes/users.scheme.ts`
- Model in `server/src/models/user.model.ts`

## Testing

**Client:**
- Unit tests: Karma + Jasmine (`npm test` in client/)
- E2E tests: Protractor (`npm run e2e` in client/)

**Server:**
- No test suite currently configured (exits with error)

## Important Notes

- The server uses clustering to spawn multiple worker processes (one per CPU core)
- CORS is enabled on the server to allow cross-origin requests from the Angular client
- All TypeScript must be compiled before running (both client and server)
- Docker Compose handles networking between client, server, and MongoDB
- Production client is served via nginx (see `client/nginx.conf`)
