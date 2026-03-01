# BtR Marketing Tracker

Internal social media planning tool for Beyond the Rhythm. Schedule and manage posts across Instagram, TikTok, X, and Reddit.

## Quick Start

```bash
npm install
npm run db:setup
npm run dev
```

Open **http://localhost:5173**

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Backend**: Express 5 + Prisma ORM + SQLite
- **State**: Zustand + React Query
- **Calendar**: FullCalendar 6
- **Drag & Drop**: @dnd-kit

## Views

| View | Path | Description |
|------|------|-------------|
| Dashboard | `/` | Stats, heatmap, upcoming posts, conflict alerts |
| Calendar | `/calendar` | Month/week/day with drag-drop rescheduling |
| Pipeline | `/kanban` | 7-stage Kanban board with drag-drop |
| Events | `/events` | Event campaigns with countdown timers |
| Assets | `/assets` | Media library with upload and preview |

## Ports

- Client: `http://localhost:5173`
- API: `http://localhost:3002`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server and client |
| `npm run dev:server` | Server only |
| `npm run dev:client` | Client only |
| `npm run db:setup` | Run migration + seed |
| `npm run db:seed` | Re-seed data |
| `npm run db:studio` | Open Prisma Studio |
