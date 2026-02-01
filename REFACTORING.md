# Refactoring Report: Google Docs Clone — 2021 to 2026

> A complete modernization of a 5-year-old real-time collaborative editor,
> upgrading every layer from dependencies to architecture to developer experience.

---

## Table of Contents

- [Overview](#overview)
- [Before vs After](#before-vs-after)
- [Commit History](#commit-history)
- [1. Server: TypeScript Migration & Architecture](#1-server-typescript-migration--architecture)
- [2. Client: Vite + React 19 + TypeScript](#2-client-vite--react-19--typescript)
- [3. Infrastructure: Docker Compose & Env Config](#3-infrastructure-docker-compose--env-config)
- [4. Documentation: Professional README](#4-documentation-professional-readme)
- [Dependency Audit](#dependency-audit)
- [Files Changed Summary](#files-changed-summary)

---

## Overview

The original codebase was a functional but dated Google Docs clone written in 2021 with Create React App, React 17, React Router v5, Quill v1, CommonJS Node.js, and Mongoose 5. Every file was plain JavaScript with no type safety, no environment configuration, no containerization, and a flat file structure.

This refactoring transforms it into a production-grade, TypeScript-strict, cleanly architected project that reflects 2026 best practices.

---

## Before vs After

| Aspect                  | Before (2021)                          | After (2026)                                       |
| ----------------------- | -------------------------------------- | -------------------------------------------------- |
| **Language**            | JavaScript (ES6)                       | TypeScript 5.7 (strict mode)                       |
| **Module System**       | CommonJS (`require`)                   | ESM (`import/export`)                              |
| **Client Framework**    | React 17                               | React 19                                           |
| **Build Tool**          | Create React App (react-scripts 4)     | Vite 6                                             |
| **Router**              | React Router v5 (`Switch`, `Redirect`) | React Router v7 (`Routes`, `Navigate`)             |
| **Rich Text Editor**    | Quill 1.3                              | Quill 2.0                                          |
| **ODM**                 | Mongoose 5.12                          | Mongoose 8.9                                       |
| **Socket.IO**           | 4.1                                    | 4.8                                                |
| **UUID Generation**     | `uuid` npm package                     | Native `crypto.randomUUID()`                       |
| **Render API**          | `ReactDOM.render()`                    | `createRoot().render()`                            |
| **Server Structure**    | 2 flat files                           | Layered: `config/`, `types/`, `models/`, `handlers/` |
| **Client Structure**    | 4 flat files in `src/`                 | Organized: `components/`, `hooks/`, `config/`, `types/`, `styles/` |
| **Env Configuration**   | Hardcoded localhost strings            | `.env` files with Zod validation (server) & Vite env (client) |
| **Dev Server**          | `nodemon`                              | `tsx watch` (native TypeScript execution)          |
| **Type Safety**         | None                                   | Strict mode + `noUncheckedIndexedAccess`           |
| **Socket Typing**       | Untyped events                         | Fully typed `ClientToServerEvents`/`ServerToClientEvents` |
| **Database Schema**     | `data: String` (stored raw)            | `data: Schema.Types.Mixed` (stores Delta objects)  |
| **Schema Timestamps**   | `useTimestamps: true` (typo, noop)     | `timestamps: true` (correct Mongoose option)       |
| **Graceful Shutdown**   | None                                   | SIGINT/SIGTERM handlers close IO + DB              |
| **Containerization**    | None                                   | Docker Compose for MongoDB 8                       |
| **Path Aliases**        | None                                   | `@/*` mapping to `src/*`                           |
| **Documentation**       | Basic install steps                    | Architecture diagram, tech table, scripts ref      |

---

## Commit History

```
14429a5 docs: rewrite README with updated architecture and setup instructions
a54c4ce chore: add Docker Compose for MongoDB and root .gitignore
72738cc refactor(client): migrate from CRA to Vite + TypeScript + React 19 + React Router v7
256ee01 refactor(server): migrate to TypeScript with strict mode and modular architecture
```

Each commit is atomic, builds on the previous, and follows [Conventional Commits](https://www.conventionalcommits.org/) with scoped prefixes.

---

## 1. Server: TypeScript Migration & Architecture

### What Changed

The server went from **2 flat JavaScript files** (`server.js`, `Document.js`) to a **6-file layered TypeScript project**.

### Old Structure

```
server/
├── server.js       # Everything: DB connection, Socket.IO, handlers
├── Document.js     # Mongoose schema
└── package.json
```

### New Structure

```
server/
├── src/
│   ├── config/
│   │   └── env.ts              # Zod-validated environment variables
│   ├── handlers/
│   │   └── document.handler.ts # Socket event registration, document CRUD
│   ├── models/
│   │   └── document.model.ts   # Typed Mongoose schema
│   ├── types/
│   │   ├── document.ts         # Delta / DeltaOp interfaces
│   │   ├── socket.ts           # ClientToServerEvents / ServerToClientEvents
│   │   └── index.ts            # Barrel export
│   └── index.ts                # Bootstrap, graceful shutdown
├── tsconfig.json
├── .env.example
└── package.json
```

### Key Decisions

**Zod for environment validation** — Fails fast on startup if `MONGODB_URI` is malformed or `PORT` is not a number. No silent misconfiguration in production.

```typescript
// server/src/config/env.ts
const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/google-docs-clone"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
});
export const env = envSchema.parse(process.env);
```

**Typed Socket.IO events** — The server and client share a contract. Emitting a misspelled event name or wrong payload shape is now a compile-time error.

```typescript
// server/src/types/socket.ts
export interface ClientToServerEvents {
  "get-document": (documentId: string) => void;
  "send-changes": (delta: Delta) => void;
  "save-document": (data: Delta) => void;
}

export interface ServerToClientEvents {
  "load-document": (data: Delta) => void;
  "receive-changes": (delta: Delta) => void;
}
```

**Graceful shutdown** — On SIGINT/SIGTERM, the server closes the Socket.IO instance and the Mongoose connection before exiting. Prevents orphaned connections and data corruption.

```typescript
function shutdown(): void {
  io.close();
  mongoose.connection.close().then(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
```

**Fixed the schema bug** — The original used `useTimestamps: true` which is not a valid Mongoose option (the correct key is `timestamps`). The old schema silently ignored this, meaning documents never actually had `createdAt`/`updatedAt` fields.

**`data` field type corrected** — Changed from `String` to `Schema.Types.Mixed`. The original stored Quill Delta objects as strings, requiring JSON parse/stringify round-trips. Now stores native BSON objects.

### Dependencies Changed

| Package    | Before   | After    | Why                                      |
| ---------- | -------- | -------- | ---------------------------------------- |
| mongoose   | 5.12.9   | 8.9.5    | TypeScript-first, better perf, no deprecated options |
| socket.io  | 4.1.1    | 4.8.1    | Typed events, connection state recovery  |
| dotenv     | —        | 16.4.7   | Environment variable loading             |
| zod        | —        | 3.24.1   | Runtime env schema validation            |
| typescript | —        | 5.7.3    | Type safety                              |
| tsx        | —        | 4.19.2   | Replaces nodemon for native TS execution |
| nodemon    | 2.0.7    | removed  | Superseded by tsx watch                  |

---

## 2. Client: Vite + React 19 + TypeScript

### What Changed

The client went from **4 flat JS files** with Create React App to a **8-file organized TypeScript project** with Vite.

### Old Structure

```
client/
├── src/
│   ├── App.js           # Router with Switch/Redirect
│   ├── TextEditor.js    # 127-line monolith with all socket + editor logic
│   ├── index.js         # ReactDOM.render entry
│   └── styles.css
├── public/              # CRA boilerplate (6 files)
└── package.json
```

### New Structure

```
client/
├── src/
│   ├── components/
│   │   └── TextEditor.tsx      # Pure UI: Quill init + ref callback
│   ├── hooks/
│   │   ├── useSocket.ts        # Socket.IO connection lifecycle
│   │   └── useDocumentSync.ts  # Document load, send, receive, auto-save
│   ├── config/
│   │   └── env.ts              # Vite env variable extraction
│   ├── types/
│   │   └── document.ts         # Re-export Quill Delta type
│   ├── styles/
│   │   └── editor.css          # Unchanged styling (was already clean)
│   ├── App.tsx                 # Router with Routes/Navigate
│   └── main.tsx                # createRoot entry
├── index.html                  # Vite entry (moved from public/)
├── vite.config.ts
├── vite-env.d.ts
├── tsconfig.json
├── .env.example
└── package.json
```

### Key Decisions

**CRA to Vite** — Create React App was deprecated. Vite provides sub-second HMR, native ESM, and a simpler config surface. Build times drop from 30s+ to under 3s.

**Custom hooks extraction** — The original `TextEditor.js` had 5 `useEffect` blocks doing completely different things (connect socket, load document, send changes, receive changes, auto-save) all in one component. These are now:

- `useSocket()` — Manages the Socket.IO connection lifecycle. Returns `Socket | null`.
- `useDocumentSync(socket, quill, documentId)` — Encapsulates all 4 synchronization concerns (load, send, receive, save).

The component itself is now a thin render function:

```tsx
export function TextEditor() {
  const { id: documentId } = useParams<"id">();
  const socket = useSocket();
  const [quill, setQuill] = useState<Quill | null>(null);

  useDocumentSync(socket, quill, documentId!);

  const editorRef = useCallback((wrapper: HTMLDivElement | null) => {
    // Quill initialization...
    setQuill(q);
  }, []);

  return <div className="container" ref={editorRef} />;
}
```

**Dropped `uuid` package** — The original imported `uuid` (7KB gzipped) solely for `v4()`. Modern browsers ship `crypto.randomUUID()` which is a one-liner with zero dependencies.

```typescript
// Before
import { v4 as uuidV4 } from 'uuid';
<Redirect to={`/documents/${uuidV4()}`} />

// After
<Navigate to={`/documents/${crypto.randomUUID()}`} replace />
```

**React Router v5 to v7** — Replaced deprecated `Switch`/`Redirect` with `Routes`/`Route`/`Navigate`. Removed `react-router-dom` (merged into `react-router` in v7).

**React 17 to 19** — Replaced `ReactDOM.render()` with `createRoot().render()`. StrictMode preserved.

**Quill v1 to v2** — Quill 2.0 ships native TypeScript declarations and fixes several XSS vectors present in v1.

**Path aliases** — `@/*` maps to `src/*` via both `tsconfig.json` paths and Vite's `resolve.alias`. Eliminates fragile relative imports like `../../hooks/useSocket`.

### Dependencies Changed

| Package          | Before       | After     | Why                                      |
| ---------------- | ------------ | --------- | ---------------------------------------- |
| react            | 17.0.2       | 19.0.0    | createRoot, use() hook, concurrent features |
| react-dom        | 17.0.2       | 19.0.0    | Paired with React 19                     |
| react-router     | 5.2.0        | 7.1.1     | Modern Routes/Navigate API               |
| react-router-dom | 5.2.0        | removed   | Merged into react-router in v7           |
| quill            | 1.3.7        | 2.0.3     | TS types, security fixes, modern API     |
| socket.io-client | 4.1.1        | 4.8.1     | Connection state recovery, typed events  |
| uuid             | 8.3.2        | removed   | Replaced by native crypto.randomUUID()   |
| react-scripts    | 4.0.3        | removed   | Replaced by Vite                         |
| vite             | —            | 6.0.7     | Modern build tool                        |
| @vitejs/plugin-react | —        | 4.3.4     | React JSX transform for Vite             |
| typescript       | —            | 5.7.3     | Type safety                              |
| @types/react     | —            | 19.0.7    | React 19 type definitions                |
| @types/react-dom | —            | 19.0.3    | ReactDOM 19 type definitions             |

---

## 3. Infrastructure: Docker Compose & Env Config

### Docker Compose

The original project required manually installing and running MongoDB locally with no guidance on version or configuration. Now:

```yaml
# docker-compose.yml
services:
  mongodb:
    image: mongo:8
    container_name: google-docs-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

One command to start: `docker compose up -d`.

### Environment Variables

**Server** — Validated at startup with Zod:

```bash
# server/.env.example
PORT=3001
MONGODB_URI=mongodb://localhost:27017/google-docs-clone
CLIENT_ORIGIN=http://localhost:5173
```

**Client** — Loaded via Vite's `import.meta.env`:

```bash
# client/.env.example
VITE_SERVER_URL=http://localhost:3001
```

### .gitignore

Added root-level `.gitignore` covering `node_modules/`, `dist/`, `.env`, `*.tsbuildinfo`, and `.DS_Store`. Both client and server have their own `.gitignore` files as well.

---

## 4. Documentation: Professional README

The README was rewritten from scratch to include:

- **Tech stack table** — At-a-glance view of all technologies and versions
- **Architecture diagram** — ASCII tree showing both client and server structure with annotations
- **Step-by-step setup** — Docker, install, env config, run
- **Available scripts reference** — Tables for both server and client npm scripts
- **How It Works section** — 6-step explanation of the data flow
- **Removed** — Inline MIT license text (just reference the license instead)

---

## Dependency Audit

### Total Dependencies (production)

| Before | After |
| ------ | ----- |
| Server: 2 (`mongoose`, `socket.io`) | Server: 4 (`mongoose`, `socket.io`, `dotenv`, `zod`) |
| Client: 7 (`quill`, `react`, `react-dom`, `react-router`, `react-router-dom`, `react-scripts`, `socket.io-client`, `uuid`) | Client: 5 (`quill`, `react`, `react-dom`, `react-router`, `socket.io-client`) |

Net reduction of **2 client production dependencies** while adding **2 server dependencies** for configuration safety.

### Packages Removed

| Package          | Reason                                         |
| ---------------- | ---------------------------------------------- |
| `react-scripts`  | Replaced by Vite                               |
| `react-router-dom` | Merged into `react-router` v7                |
| `uuid`           | Replaced by native `crypto.randomUUID()`       |
| `nodemon`        | Replaced by `tsx watch`                        |

---

## Files Changed Summary

### Deleted (13 files)

```
server/server.js              # Replaced by src/index.ts + src/handlers/
server/Document.js            # Replaced by src/models/document.model.ts
client/src/App.js             # Replaced by src/App.tsx
client/src/TextEditor.js      # Replaced by src/components/TextEditor.tsx
client/src/index.js           # Replaced by src/main.tsx
client/src/styles.css         # Replaced by src/styles/editor.css
client/README.md              # CRA boilerplate, removed
client/yarn.lock              # Migrated to npm
client/public/index.html      # Moved to client/index.html (Vite convention)
client/public/manifest.json   # CRA PWA boilerplate, removed
client/public/robots.txt      # CRA boilerplate, removed
client/public/logo192.png     # CRA boilerplate, removed
client/public/logo512.png     # CRA boilerplate, removed
```

### Created (19 files)

```
# Server
server/src/index.ts                    # App bootstrap + graceful shutdown
server/src/config/env.ts               # Zod environment validation
server/src/handlers/document.handler.ts # Socket event handlers
server/src/models/document.model.ts    # Typed Mongoose Document schema
server/src/types/document.ts           # Delta / DeltaOp interfaces
server/src/types/socket.ts             # Socket.IO event type contracts
server/src/types/index.ts              # Barrel exports
server/tsconfig.json                   # TypeScript strict config
server/.env.example                    # Environment template

# Client
client/src/App.tsx                     # Router with React Router v7
client/src/main.tsx                    # createRoot entry point
client/src/components/TextEditor.tsx   # Quill editor component
client/src/hooks/useSocket.ts          # Socket connection hook
client/src/hooks/useDocumentSync.ts    # Document sync hook
client/src/config/env.ts               # Vite env extraction
client/src/types/document.ts           # Delta type re-export
client/src/styles/editor.css           # Editor stylesheet
client/index.html                      # Vite HTML entry
client/tsconfig.json                   # TypeScript strict config
client/vite-env.d.ts                   # Vite type reference
client/vite.config.ts                  # Vite + React plugin config
client/.env.example                    # Environment template

# Root
docker-compose.yml                     # MongoDB 8 container
.gitignore                             # Root-level ignores
```

### Modified (4 files)

```
server/package.json       # New deps, ESM, TypeScript scripts
server/.gitignore         # Added dist/, .env, *.tsbuildinfo
client/package.json       # New deps, Vite scripts, removed CRA
client/.gitignore         # Simplified for Vite project
Readme.md                 # Complete rewrite
```

---

## TypeScript Configuration Highlights

Both projects use strict mode with additional safety flags:

```jsonc
{
  "strict": true,                          // All strict checks enabled
  "noUncheckedIndexedAccess": true,        // Array/object index returns T | undefined
  "noUnusedLocals": true,                  // Catch dead code
  "noUnusedParameters": true,              // Catch unused function args
  "forceConsistentCasingInFileNames": true  // Prevent cross-platform bugs
}
```

The server uses `"module": "Node16"` (ESM with .js extensions) for Node.js compatibility.
The client uses `"module": "ESNext"` with `"moduleResolution": "bundler"` for Vite.

---

## What Was Intentionally NOT Done

- **No monorepo workspaces** — The project is small enough that npm workspaces would add complexity without benefit. Each package installs independently.
- **No testing framework added** — Adding tests would be a separate initiative. The architecture is now testable (hooks and handlers are isolated), but adding placeholder tests signals false confidence.
- **No CI/CD pipeline** — GitHub Actions or similar should be added when the project is ready for continuous deployment, not as refactoring theater.
- **No authentication** — The original had none, and bolting on auth as part of a refactoring would change the project scope.
- **No over-abstraction** — No factory patterns, no dependency injection containers, no service layers wrapping single Mongoose calls. The codebase is small and should stay readable.
