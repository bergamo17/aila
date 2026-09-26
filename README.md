# AILA

An academic/task management system with a Go REST API backend and a React (Vite)
Kanban-style frontend, built as a pnpm monorepo.

## Features

- **User & subject/task management** — create users, subjects, and tasks, with
  task status updates
- **Authentication** — PASETO tokens, with the `UserID` carried in the token
  payload (avoiding an extra DB lookup) rather than the request body
- **Session-based refresh tokens** — a `sessions` table (id, username,
  refresh_token, user_agent, client_ip, is_blocked, expired_at, created_at) backs
  `POST /token/renew` and `POST /user/logout`, with session lookups tied to the
  refresh token's PASETO payload ID rather than a client-supplied session ID
- **Ownership validation** — resource ownership is checked (e.g. via `GetSubject`)
  before inserts, with `pgx.ErrNoRows` distinguished from other errors for
  correct 404 vs. 500 responses
- **Kanban board** — drag-and-drop task board on the frontend (`dnd-kit`)
- **Typed, resource-based API client** — frontend API calls organized per
  resource, mirroring the Go request/response structs in TypeScript

## Tech Stack

| Layer          | Tools                                                          |
|----------------|-----------------------------------------------------------------|
| Backend        | Go, Gin, sqlc, pgx/v5, PostgreSQL, PASETO                       |
| Frontend       | React, TypeScript, Vite, dnd-kit, Zustand, TanStack Query, shadcn/ui, Tailwind CSS, Wouter |
| Monorepo       | pnpm workspaces                                                 |

## Architecture

```
.
├── backend/                 # Go REST API (Gin)
│   ├── api/                  # HTTP handlers (createUser, createTask, etc.)
│   ├── db/                    # sqlc queries, migrations
│   ├── token/                  # PASETO token maker
│   └── main.go
└── frontend/                # React / Vite app
    └── src/
        ├── lib/api.ts          # Base apiFetch client
        ├── api/                 # Per-resource functions (auth.ts, tasks.ts, ...)
        ├── types/                # Request/response interfaces mirroring Go structs
        └── components/            # Kanban board, UI components (shadcn/ui)
```

<!-- TODO: adjust folder names/paths to match your actual repo layout -->

## Getting Started

### Prerequisites

- Go 1.2x+
- Node.js + pnpm
- PostgreSQL

### Backend

```bash
cd backend
# run migrations
make migrateup

# start the API server
go run main.go
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

<!-- TODO: confirm actual commands/scripts used in your repo -->

### Configuration

```
DB_SOURCE=postgresql://<user>:<password>@localhost:5432/aila?sslmode=disable
TOKEN_SYMMETRIC_KEY=<32-character-secret>
ACCESS_TOKEN_DURATION=15m
PORT=5173
BASE_PATH=/
```

<!-- TODO: replace with your actual env vars -->

## Authentication Flow

- Access tokens are sent via the `Authorization` header (Bearer token), not an
  httpOnly cookie
- Refresh tokens are tracked server-side in the `sessions` table; renewing an
  access token (`POST /token/renew`) and logging out (`POST /user/logout`) both
  verify the session's `is_blocked` status, username, and refresh token match
  before proceeding

## Known Issues / In Progress

- CORS configuration between the React frontend and Go backend needs to be
  finalized
- Backend and frontend are both under active development

## License

<!-- TODO: add a license, or remove this section if none -->
