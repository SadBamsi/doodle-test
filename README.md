# doodle-test

Next.js chat frontend integrated with local backend API.

## Stack

- Next.js `16.1.6` + App Router
- TypeScript (strict)
- Server Components for data loading
- Server Actions for mutations

## Backend contract

All message endpoints require Bearer authentication.

- `GET /api/v1/messages`
  - query params:
    - `limit` (1..1000, default 50)
    - `before` (ISO 8601 timestamp)
    - `after` (ISO 8601 timestamp)
  - `before` and `after` are mutually exclusive
  - response order: reverse chronological
- `POST /api/v1/messages`
  - creates a new message

## Environment

Create `.env.local`:

```env
CHAT_API_BASE_URL=http://localhost:3000
CHAT_API_TOKEN=your_bearer_token_here
```

## Run

Backend is expected on `http://localhost:3000` (Docker).
Run frontend on another port, for example:

```bash
npm install
npm run dev -- --port 3001
```

Open `http://localhost:3001`.

## Quality checks

```bash
npm run lint
npm run build
```
