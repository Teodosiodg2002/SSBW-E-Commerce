# Guía de Resolución de Problemas

Este documento registra los errores conocidos encontrados durante el desarrollo y sus soluciones verificadas.

---

## Docker / Base de Datos

### El contenedor de PostgreSQL entra en bucle de reinicios

**Síntoma:** `docker ps` muestra el estado del contenedor como `Restarting (1) N seconds ago`.

**Causa:** El tag `postgres:alpine` sin versión fue actualizado por Docker a PostgreSQL 18. La nueva versión mayor espera los datos en un formato de directorio diferente (`/var/lib/postgresql/18/main`) y se niega a arrancar cuando encuentra datos de una versión anterior en `/var/lib/postgresql/data`.

**Solución:**

1. Detener y eliminar el contenedor y su volumen:
   ```bash
   docker compose down -v
   ```
2. Fijar la versión de la imagen en `docker-compose.yml`:
   ```yaml
   image: postgres:16-alpine
   ```
3. Reiniciar y re-sembrar:
   ```bash
   docker compose up -d
   npx prisma migrate dev
   npm run seed
   npm run usuarios
   ```

> **Prevención:** Siempre fija las versiones mayores en las imágenes Docker que se usan para datos persistentes. Nunca uses los tags `latest` o sin versión para contenedores de bases de datos.

---

## Backend

### SyntaxError: Named export 'Request' not found (Express + Node.js ESM)

**Síntoma:**
```
SyntaxError: Named export 'Request' not found. The requested module 'express'
is a CommonJS module, which may not support all module.exports as named exports.
```

**Causa:** Node.js v24 en modo ESM no puede importar estáticamente exportaciones nombradas de módulos CommonJS. Express se distribuye como CommonJS, por lo que `import { Request, Response } from 'express'` falla en tiempo de ejecución.

**Solución:** Usar `import type`, que se elimina en tiempo de compilación y nunca se evalúa en tiempo de ejecución:
```typescript
// Incorrecto
import { Request, Response } from 'express';

// Correcto
import type { Request, Response } from 'express';
```

---

## Integración con Astro (Hito 11)

### El carrusel muestra el spinner de carga infinito

**Causa (principal):** La configuración CORS del backend no incluía el puerto del servidor de desarrollo de Astro (`4321`). El navegador bloqueaba silenciosamente todas las peticiones a la API desde `http://localhost:4321`.

**Solución:** Añadir el origen de Astro en `index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4321'   // ← Añadir esto
  ]
}));
```

---

### Las imágenes y los títulos no se renderizan en el carrusel

**Causa:** El esquema Prisma usa nombres de campo en español con diacríticos: `título` y `descripción`. La interfaz TypeScript en el proyecto Astro usaba `titulo` y `descripcion` (sin acentos), haciendo que los campos se resolvieran como `undefined` en el componente.

Adicionalmente, el tipo de columna `Char(127)` en PostgreSQL rellena los valores con espacios al final, lo que corrompe las rutas de los archivos de imagen cuando se usan en atributos `src`.

**Solución:**

1. Actualizar `src/types/index.ts` para que coincida con la respuesta real de la API:
   ```typescript
   export interface Producto {
     id: number;
     título: string;       // con acento
     descripción: string;  // con acento
     precio: string;       // Decimal se serializa como string
     imagen: string;
   }
   ```

2. Aplicar `.trim()` al renderizar campos de texto con relleno:
   ```tsx
   <img src={`http://localhost:3000/public/imagenes/${prod.imagen.trim()}`} />
   <p>{prod.título.trim()}</p>
   ```

---

### `astro add tailwind` falla con "Cannot find module 'astro/config'"

**Causa:** El comando `astro add` fue ejecutado antes de que se hubiera ejecutado `npm install`. La CLI de Astro requiere que el paquete `astro` local esté presente para resolver su propia configuración.

**Solución:** Ejecutar siempre `npm install` antes de usar `astro add`:
```bash
npm install
npx astro add tailwind --yes
npx astro add react --yes
```

---

### DaisyUI no aplica estilos en Astro

**Causa:** DaisyUI v5 cambió su método de integración. En Tailwind CSS v4, los plugins se declaran en el archivo CSS usando la directiva `@plugin`, no en un archivo de configuración JavaScript.

**Configuración correcta de `global.css`:**
```css
@import "tailwindcss";
@plugin "daisyui";
```

El enfoque `@import "daisyui/daisyui.css"` (usado en configuraciones anteriores con Vite) no es compatible con el plugin `@tailwindcss/vite` en Astro y causa errores de build.

---

## SPA React

### Página en blanco en `localhost:5174`

**Síntoma:** El servidor de desarrollo de Vite reporta `connected` en la consola pero la página no renderiza nada.

**Causa:** Importar `daisyui/daisyui.css` directamente dentro de `index.css` mediante `@import` entra en conflicto con el plugin `@tailwindcss/vite`, que procesa las importaciones CSS como módulos de Vite. La extensión `.css` no se reconoce en este contexto, haciendo que el pipeline CSS entero falle silenciosamente.

**Solución:** Mover la importación de DaisyUI a `main.tsx`, antes del CSS de la aplicación:
```tsx
import 'daisyui/daisyui.css'
import './index.css'
```

---

## Git

### `git pull` falla en una rama de feature

**Síntoma:**
```
There is no tracking information for the current branch.
Please specify which branch you want to rebase against.
```

**Causa:** La rama local no tiene establecida una referencia de seguimiento remoto.

**Solución:**
```bash
git branch --set-upstream-to=origin/feat/tarea-11-astro feat/tarea-11-astro
git pull
```

O hacer el push con el flag `-u` para establecer el seguimiento automáticamente:
```bash
git push -u origin feat/tarea-11-astro
```
