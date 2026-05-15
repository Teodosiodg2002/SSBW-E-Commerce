# Tienda Prado

An e-commerce system for the Museo del Prado gift shop, built as a progressive full-stack application across eleven development milestones. The project evolves from a minimal Node.js server to a hybrid architecture combining Server-Side Rendering, a React Single Page Application, and an Astro-powered static site with React islands.

---

## Current Capabilities

- Product catalog with search, filtering, and detail pages (Nunjucks SSR)
- Shopping cart with AJAX interactions (no full-page reloads)
- JWT-based authentication with protected routes
- REST API serving all product and cart data as JSON
- React SPA with client-side routing, SWR data fetching, and an Embla carousel
- Astro static site with a hydrated React carousel island
- PostgreSQL persistence via Prisma ORM
- MVC backend architecture (controllers, routes, middleware)
- Automated test suite (Vitest + Supertest)

---

## Project Evolution

### Milestone 1 — Express and Node.js Foundation

**Context:** The project needed a starting point: a web server capable of serving dynamic content.

**Implementation:** Set up a Node.js server with Express. Configured routing, middleware for parsing request bodies, and a basic HTML response.

**Progress:** Established the runtime and project structure that all subsequent milestones build upon.

---

### Milestone 2 — Web Scraping with Playwright

**Context:** The catalog needed real product data without manual entry.

**Implementation:** Wrote a Playwright script that navigates the Museo del Prado online shop, extracts product titles, descriptions, prices, and image URLs, and persists them to a local JSON file.

**Progress:** Automated data acquisition, producing a realistic dataset of over 100 products from the Prado's actual inventory.

---

### Milestone 3 — Database Persistence with Prisma

**Context:** Storing data in memory or flat files is not scalable. The application needed a relational database.

**Implementation:** Introduced PostgreSQL (via Docker) as the database engine and Prisma as the ORM. Defined the `Producto` and `Usuario` models in `schema.prisma` and migrated the scraped data into the database using a seeder script.

**Progress:** Data now survives server restarts. Prisma's type-safe query builder prevents an entire class of runtime errors and makes refactoring safe.

---

### Milestone 4 — Product Pages and Search

**Context:** Users needed to browse and find products, not just see a raw data dump.

**Implementation:** Built three Nunjucks-rendered views: a home page listing all products, a search page with full-text filtering via Prisma, and a product detail page.

**Progress:** The application became a functional storefront with a navigable catalog.

---

### Milestone 5 — Shopping Cart and Professional Logging

**Context:** An e-commerce application must allow users to select items for purchase. Additionally, runtime behavior needed to be observable in production.

**Implementation:** Implemented a session-based shopping cart using `express-session`. Users can add and remove products from any detail page. Integrated Winston for structured logging with file rotation and console output.

**Progress:** The application acquired its core commercial functionality. Operational visibility through structured logs enabled monitoring without `console.log`.

---

### Milestone 6 — Authentication and Security

**Context:** Some routes (account page, admin functions) must be restricted to authenticated users.

**Implementation:** Added a registration and login flow with bcrypt password hashing. Authentication tokens are issued as JWTs and stored in `HttpOnly` cookies. A middleware layer decodes the token on every request and makes the user context available to templates and route handlers.

**Progress:** The application gained a security layer. Unauthenticated requests to protected routes are redirected to `/login` with a 302 response.

---

### Milestone 7 — REST API

**Context:** The Nunjucks frontend is tightly coupled to the server. Enabling a separate frontend or mobile client requires a data interface that returns JSON, not HTML.

**Implementation:** Introduced a dedicated API router mounted under `/api`. All product endpoints return structured JSON with pagination metadata. CORS is configured to allow specific origins.

**Progress:** Decoupled the data layer from the presentation layer. The backend now serves two types of clients: the Nunjucks templates (HTML) and any API consumer (JSON).

---

### Milestone 8 — UX Improvements and Dynamic DOM

**Context:** The cart flow required full-page reloads, making the experience feel slow and dated.

**Implementation:** Replaced the cart's form-based interaction with AJAX requests. The cart item count in the navbar updates without a page reload. The login form gained client-side validation with inline error messages.

**Progress:** Transitioned key user flows from synchronous to asynchronous, significantly improving perceived performance.

---

### Milestone 9 — React SPA (First Decoupled Frontend)

**Context:** Building complex interactive UIs within Nunjucks templates is limiting. A component-based approach was needed for richer experiences.

**Implementation:** Created a separate Vite + React project in `/frontend`. Configured CORS on the backend to accept requests from the React dev server. Built a random product gallery component using SWR for data fetching and Tailwind CSS for styling.

**Progress:** Introduced the concept of a fully decoupled frontend. The React app and the Express backend are now independent processes communicating exclusively through the REST API.

---

### Milestone 10 — React Router, Embla Carousel, and DaisyUI

**Context:** The single-page React app needed multiple navigable views and richer UI components.

**Implementation:** Integrated `react-router-dom` with a nested route structure using a shared `MainLayout`. Built a full-page `Carrousel` component powered by Embla Carousel to display product images. Added DaisyUI for a component library on top of Tailwind CSS. Refactored data fetching into reusable custom hooks (`useProductList`, `useRandomProduct`) and introduced strict TypeScript interfaces to eliminate `any` types. Implemented a global error handler in the Express backend.

**Progress:** The React application became a true multi-page SPA. The backend was stabilized with Clean Code practices: MVC separation, optimized middleware, and centralized error handling.

---

### Milestone 11 — Astro Static Site with React Islands

**Context:** Not all pages require the full React runtime. A framework that generates static HTML by default while selectively enabling interactivity only where needed would improve performance and loading speed.

**Implementation:** Created a new Astro project in `/astro-shop`, isolated from the existing React SPA to avoid breaking previous milestones. Configured Astro with the `@astrojs/react` integration and Tailwind CSS v4 with DaisyUI. Migrated the `Carrousel.tsx` component and its hooks into the Astro project. The carousel page uses the `client:load` hydration directive to ship React's JavaScript only for that component, leaving the rest of the page as zero-JS static HTML.

**Progress:** Introduced the Islands Architecture. The `/carrousel` route is now a static HTML page that progressively enhances itself with a React component once it loads in the browser. This demonstrates how modern static site generators can integrate framework components without paying the cost of a full SPA bundle on every page.

---

## Documentation Index

| Document | Description |
|---|---|
| [docs/deployment.md](docs/deployment.md) | Installation steps, environment variables, Docker setup, and run commands |
| [docs/architecture.md](docs/architecture.md) | Technical stack, component interaction diagrams, API reference, and data model |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Known errors and their verified solutions |
