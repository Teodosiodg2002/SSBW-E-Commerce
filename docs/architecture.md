# System Architecture

This document describes the technical stack of Tienda Prado and how its components interact.

---

## Overview

Tienda Prado is a hybrid e-commerce system built across three layers that have evolved incrementally across eleven development milestones. All layers share a single PostgreSQL database exposed through a central REST API.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                                                             │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Nunjucks (SSR)  │  │  React SPA   │  │  Astro Site  │  │
│  │  Port 3000       │  │  Port 5173   │  │  Port 4321   │  │
│  └────────┬─────────┘  └──────┬───────┘  └──────┬───────┘  │
│           │                   │                  │          │
└───────────┼───────────────────┼──────────────────┼──────────┘
            │                   │                  │
            ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND LAYER                         │
│                                                             │
│  Express.js — Node.js (Port 3000)                           │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  /api/*     │  │  Auth (JWT)  │  │  Static /public    │ │
│  │  REST JSON  │  │  Middleware  │  │  Image files       │ │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────┘ │
│         │                │                                  │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│                                                             │
│  Prisma ORM ──► PostgreSQL 16 (Docker, Port 5433)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend

**Runtime:** Node.js v20+  
**Framework:** Express.js  
**ORM:** Prisma 7 with `@prisma/adapter-pg`  
**Database:** PostgreSQL 16 (Alpine Docker image)  
**Authentication:** JSON Web Tokens (JWT) stored in `HttpOnly` cookies  
**Sessions:** `express-session` for server-side cart state  
**Logging:** Winston (file rotation + console output)  
**Architecture pattern:** MVC — routes map to controllers, controllers interact with Prisma

### Directory structure

```
/
├── index.ts              # Entry point, middleware registration
├── controllers/          # Business logic (products, cart, auth)
├── routes/               # Endpoint definitions
│   ├── api.ts            # REST API: /api/productos, /api/carrito
│   ├── productos.ts      # Server-rendered views
│   ├── usuarios.ts       # Auth routes: /login, /registro
│   └── carrito.ts        # AJAX cart endpoints
├── views/                # Nunjucks templates (SSR)
├── prisma/
│   ├── schema.prisma     # Data model
│   └── seeders/          # Data population scripts
└── tests/                # Vitest + Supertest API tests
```

### REST API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/productos` | Paginated product list |
| GET | `/api/productos/random` | Single random product |
| GET | `/api/productos/:id` | Product detail |
| POST | `/api/productos` | Create product |
| PUT | `/api/productos/:id` | Update product |
| DELETE | `/api/productos/:id` | Delete product |
| GET | `/api/carrito` | Current cart state |

### CORS configuration

The backend accepts cross-origin requests from the following origins:

- `http://localhost:5173` — React SPA (Vite default)
- `http://localhost:5174` — React SPA (alternate Vite port)
- `http://localhost:4321` — Astro development server

---

## React SPA (`/frontend`)

**Bundler:** Vite  
**Framework:** React 19  
**Styling:** Tailwind CSS v4 + DaisyUI 5  
**Data fetching:** SWR with custom hooks  
**Routing:** React Router v7 (BrowserRouter)  
**Carousel:** Embla Carousel  
**Testing:** Vitest + jsdom + Testing Library

### Data flow

Components do not call `fetch` directly. All remote data access is centralized in custom hooks:

- `useProductList(limit)` — fetches a paginated list from `/api/productos`
- `useRandomProduct()` — fetches one random item from `/api/productos/random`

TypeScript interfaces in `src/types/index.ts` enforce strict typing on all API responses.

### Directory structure

```
frontend/src/
├── components/       # Reusable UI components (Cuadros, Perritos)
├── hooks/            # SWR data hooks
├── layouts/          # MainLayout with navbar and Outlet
├── pages/            # Route-level components (Portada, Tarea9, Carrusel)
├── types/            # TypeScript interfaces
└── tests/            # Component tests
```

---

## Astro Site (`/astro-shop`)

**Framework:** Astro 6  
**Rendering mode:** Static Site Generation (SSG)  
**React integration:** `@astrojs/react` (Islands Architecture)  
**Styling:** Tailwind CSS v4 via `@tailwindcss/vite` + DaisyUI 5  
**Type checking:** `@astrojs/check` + TypeScript strict mode

### Islands Architecture

Astro generates fully static HTML by default. Components that require client-side interactivity are explicitly marked with hydration directives:

```astro
<Carrousel client:load />
```

The `client:load` directive instructs Astro to ship the React component's JavaScript to the browser and hydrate it immediately on page load. All other page content is zero-JS static HTML.

### Routes

| Route | File | Description |
|---|---|---|
| `/` | `pages/index.astro` | Welcome page (static Astro component) |
| `/carrousel` | `pages/carrousel.astro` | Gallery powered by React island |
| `/ssg` | `pages/ssg.astro` | Placeholder for Tarea 12 (SSG catalog) |

### Directory structure

```
astro-shop/src/
├── components/
│   ├── Carrousel.tsx     # React island (migrated from /frontend)
│   └── Welcome.astro     # Static welcome component
├── hooks/
│   └── useProducts.ts    # SWR hooks (mirrored from /frontend)
├── layouts/
│   └── Layout.astro      # Shared HTML shell with navbar
├── pages/                # File-based routing
├── styles/
│   └── global.css        # Tailwind + DaisyUI imports
└── types/
    └── index.ts          # Producto and ApiResponse interfaces
```

---

## Data Model

```prisma
model Producto {
  id          Int     @id @default(autoincrement())
  título      String  @db.Char(127)
  descripción String  @db.Text
  precio      Decimal
  imagen      String  @db.Char(127)
}

model Usuario {
  email      String  @id @db.Char(127)
  nombre     String  @db.Char(127)
  contraseña String  @db.Text
  admin      Boolean @default(false)
}
```

> **Note on field names:** The Prisma schema uses Spanish characters with diacritics (`título`, `descripción`). API consumers must reference these exact field names. The `Char(127)` type pads values with trailing spaces; always call `.trim()` when rendering these fields in the UI.
