# Deployment Guide

This document describes the requirements and commands needed to run the Tienda Prado system locally in a development environment.

---

## System Requirements

| Dependency | Minimum Version | Purpose |
|---|---|---|
| Node.js | v20 LTS | Runtime for backend and build tools |
| npm | v10 | Package manager |
| Docker Desktop | v4 | PostgreSQL container |
| Git | v2.40 | Version control |

---

## Installation

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/Teodosiodg2002/SSBW-E-Commerce.git
cd SSBW-E-Commerce

# Backend dependencies
npm install

# React SPA dependencies
cd frontend && npm install && cd ..

# Astro site dependencies
cd astro-shop && npm install && cd ..
```

### 2. Environment variables

Create a `.env` file in the project root. Use the following as a reference:

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5433/tiendaprado"
SESSION_SECRET="your-session-secret"
SECRET_KEY="your-jwt-secret"
PORT=3000
```

> The `DATABASE_URL` port must be `5433`, which is the host port mapped to the PostgreSQL container.

---

## Database

### Start the PostgreSQL container

```bash
docker compose up -d
```

The `docker-compose.yml` uses the `postgres:16-alpine` image, which is pinned to version 16 to ensure data format compatibility. Using the unversioned `postgres:alpine` tag risks data corruption when Docker pulls a newer major version automatically.

### Run migrations

```bash
npx prisma migrate dev
```

### Seed the database

```bash
# Load products (115 items from Museo del Prado)
npm run seed

# Create demo users
npm run usuarios
```

---

## Running the System

The system consists of three independent processes. Each requires a separate terminal.

### Terminal 1 — Backend (Express + Prisma)

```bash
npm run dev
# Listens on http://localhost:3000
```

### Terminal 2 — React SPA (Vite)

```bash
cd frontend
npm run dev
# Listens on http://localhost:5173 or 5174
```

### Terminal 3 — Astro Static Site

```bash
cd astro-shop
npm run dev
# Listens on http://localhost:4321
```

---

## Testing

### Backend tests (Vitest + Supertest)

```bash
npm test
# Runs tests in the /tests directory against the live Express app
```

### Frontend tests (Vitest + Testing Library)

```bash
cd frontend
npm test
```

---

## Production Build

To verify the Astro site compiles without errors:

```bash
cd astro-shop
npm run build
# Output in astro-shop/dist/
```

Type checking for Astro files:

```bash
cd astro-shop
npx astro check
```
