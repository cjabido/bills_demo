# Finance Tracker Demo

A full-stack personal finance tracking application built with React, Express, and PostgreSQL. This is a **public demo** with pre-seeded sample data — no authentication required.

## Features

- **Dashboard** — Net worth, recent transactions, spending breakdown, cash flow projection
- **Cash Flow** — Semi-monthly period tracking with income, expenses, and budgets
- **Bills** — Recurring bill management with autopay tracking and upcoming timeline
- **Accounts** — Bank accounts grouped by type (checking, savings, investment, credit card, loan)
- **Transactions** — Full transaction history with category filters and search
- **Assets** — Investment portfolio tracking with 12-month growth history
- **Reports** — Monthly summaries, category spending, top merchants, net worth trends
- **Settings** — Category management, appearance customization, and demo data reset

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v4, TanStack Query |
| Backend | Node.js 20, Express 5, TypeScript, Prisma ORM |
| Database | PostgreSQL 15 |
| Infrastructure | Docker Compose, Nginx |

## Run Locally

```bash
git clone https://github.com/cjabido/bills_demo.git
cd bills_demo
docker compose up
```

Open [http://localhost](http://localhost) — the app starts with pre-seeded sample data.

## Project Structure

```
bills_demo/
├── backend/                # Express API server
│   ├── src/
│   │   ├── server.ts       # Express app setup
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   └── config/         # Environment validation
│   └── prisma/
│       ├── schema.prisma   # Database schema
│       └── seed.ts         # Demo data seeder
├── frontend/               # React SPA
│   └── src/
│       ├── App.tsx          # Root with sidebar navigation
│       ├── components/      # Page components
│       ├── hooks/           # React Query data hooks
│       └── data/            # Type definitions and configs
├── nginx/                   # Nginx reverse proxy configs
├── docker-compose.yml       # Development setup
└── docker-compose.prod.yml  # Production setup
```

## Development

```bash
# Start dev environment with hot-reload
docker compose up

# Frontend only (outside Docker)
cd frontend && npm install && npm run dev

# Backend only (outside Docker)
cd backend && npm install && npm run dev

# Type checking
cd frontend && npx tsc --noEmit
cd backend && npm run typecheck

# Database
cd backend && npm run db:seed     # Re-seed demo data
cd backend && npm run db:studio   # Visual DB editor
```
