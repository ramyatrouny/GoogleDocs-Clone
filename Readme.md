# Google Docs Clone

A real-time collaborative document editor built with React 19, Socket.IO, Quill 2, and MongoDB.

Multiple users can simultaneously edit the same document with changes propagated in real-time via WebSockets and automatically persisted to the database.

## Tech Stack

| Layer     | Technology                                          |
| --------- | --------------------------------------------------- |
| Client    | React 19, TypeScript 5, Vite 6, Quill 2, Socket.IO |
| Server    | Node.js, TypeScript 5, Socket.IO 4.8, Mongoose 8    |
| Database  | MongoDB 8                                           |
| Tooling   | Docker Compose, tsx, ESLint                         |

## Architecture

```
client/                     server/
├── src/                    ├── src/
│   ├── components/         │   ├── config/      # Env validation (Zod)
│   │   └── TextEditor.tsx  │   ├── handlers/    # Socket event handlers
│   ├── hooks/              │   ├── models/      # Mongoose schemas
│   │   ├── useSocket.ts    │   ├── types/       # Shared type definitions
│   │   └── useDocumentSync │   └── index.ts     # Entry point
│   ├── config/             ├── tsconfig.json
│   ├── types/              └── package.json
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for MongoDB) _or_ a local MongoDB instance

### 1. Start MongoDB

```bash
docker compose up -d
```

Or point `MONGODB_URI` to an existing instance.

### 2. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

### 3. Configure Environment

Copy the example env files and adjust if needed:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 4. Run

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app generates a unique document URL on load. Share the URL with another browser tab to see real-time collaboration.

## Available Scripts

### Server

| Script        | Description                    |
| ------------- | ------------------------------ |
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start`   | Run compiled production build  |
| `npm run typecheck` | Type-check without emitting |

### Client

| Script        | Description                     |
| ------------- | ------------------------------- |
| `npm run dev` | Start Vite dev server           |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build     |
| `npm run typecheck` | Type-check without emitting |

## How It Works

1. The client connects to the server via Socket.IO
2. On visiting `/documents/:id`, the server retrieves or creates the document in MongoDB
3. The Quill editor loads the document content
4. User keystrokes emit `send-changes` events containing Quill Delta operations
5. The server broadcasts deltas to all other clients in the same document room
6. An auto-save interval persists the full document state every 2 seconds

## License

MIT License - Copyright (c) 2021 Rami Atrouni
