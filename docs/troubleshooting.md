# Troubleshooting Guide

This document records known issues encountered during development and their verified solutions.

---

## Docker / Database

### PostgreSQL container in restart loop

**Symptom:** `docker ps` shows the container status as `Restarting (1) N seconds ago`.

**Cause:** The `postgres:alpine` tag without a version pin was updated by Docker to PostgreSQL 18. The new major version expects data in a different directory format (`/var/lib/postgresql/18/main`) and refuses to start when it finds data from a previous version in `/var/lib/postgresql/data`.

**Solution:**

1. Stop and remove the container and its volume:
   ```bash
   docker compose down -v
   ```
2. Pin the image version in `docker-compose.yml`:
   ```yaml
   image: postgres:16-alpine
   ```
3. Restart and re-seed:
   ```bash
   docker compose up -d
   npx prisma migrate dev
   npm run seed
   npm run usuarios
   ```

> **Prevention:** Always pin major versions in Docker images used for persistent data. Never use `latest` or unversioned tags for database containers.

---

## Backend

### SyntaxError: Named export 'Request' not found (Express + Node.js ESM)

**Symptom:**
```
SyntaxError: Named export 'Request' not found. The requested module 'express'
is a CommonJS module, which may not support all module.exports as named exports.
```

**Cause:** Node.js v24 running in ESM mode cannot statically import named exports from CommonJS modules. Express ships as CommonJS, so `import { Request, Response } from 'express'` fails at runtime.

**Solution:** Use `import type`, which is erased at compile time and never evaluated at runtime:
```typescript
// Incorrect
import { Request, Response } from 'express';

// Correct
import type { Request, Response } from 'express';
```

---

## Astro Integration (Tarea 11)

### Carousel shows infinite loading spinner

**Cause (primary):** The backend CORS configuration did not include the Astro development server port (`4321`). All API requests from `http://localhost:4321` were silently blocked by the browser.

**Solution:** Add the Astro origin to `index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4321'   // ← Add this
  ]
}));
```

---

### Images and titles do not render in the carousel

**Cause:** The Prisma schema uses Spanish field names with diacritics: `título` and `descripción`. The TypeScript interface in the Astro project used `titulo` and `descripcion` (without accents), causing the fields to resolve to `undefined` in the component.

Additionally, the `Char(127)` column type in PostgreSQL pads values with trailing spaces, which corrupts image file paths when used in `src` attributes.

**Solution:**

1. Update `src/types/index.ts` to match the actual API response:
   ```typescript
   export interface Producto {
     id: number;
     título: string;       // with accent
     descripción: string;  // with accent
     precio: string;       // Decimal serializes as string
     imagen: string;
   }
   ```

2. Apply `.trim()` when rendering padded string fields:
   ```tsx
   <img src={`http://localhost:3000/public/imagenes/${prod.imagen.trim()}`} />
   <p>{prod.título.trim()}</p>
   ```

---

### `astro add tailwind` fails with "Cannot find module 'astro/config'"

**Cause:** The `astro add` command was run before `npm install` had been executed. The Astro CLI requires the local `astro` package to be present to resolve its own configuration.

**Solution:** Always run `npm install` before using `astro add`:
```bash
npm install
npx astro add tailwind --yes
npx astro add react --yes
```

---

### DaisyUI not applying styles in Astro

**Cause:** DaisyUI v5 changed its integration method. In Tailwind CSS v4, plugins are declared in the CSS file using the `@plugin` directive, not in a JavaScript config file.

**Correct `global.css` configuration:**
```css
@import "tailwindcss";
@plugin "daisyui";
```

The `@import "daisyui/daisyui.css"` approach (used in earlier Vite setups) is not compatible with the `@tailwindcss/vite` plugin in Astro and causes build errors.

---

## React SPA

### Blank page at `localhost:5174`

**Symptom:** The Vite dev server reports `connected` in the console but the page renders nothing.

**Cause:** Importing `daisyui/daisyui.css` directly inside `index.css` via `@import` conflicts with the `@tailwindcss/vite` plugin, which processes CSS imports as Vite modules. The `.css` extension is not recognized in this context, causing the entire CSS pipeline to silently fail.

**Solution:** Move the DaisyUI import to `main.tsx`, before the application CSS:
```tsx
import 'daisyui/daisyui.css'
import './index.css'
```

---

## Git

### `git pull` fails on feature branch

**Symptom:**
```
There is no tracking information for the current branch.
Please specify which branch you want to rebase against.
```

**Cause:** The local branch does not have an upstream tracking reference set.

**Solution:**
```bash
git branch --set-upstream-to=origin/feat/tarea-11-astro feat/tarea-11-astro
git pull
```

Or push with the `-u` flag to set tracking automatically:
```bash
git push -u origin feat/tarea-11-astro
```
