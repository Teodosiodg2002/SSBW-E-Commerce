# Arquitectura del Sistema

Este documento describe el stack técnico de Tienda Prado y cómo interactúan sus componentes.

---

## Visión General

Tienda Prado es un sistema de e-commerce híbrido construido en tres capas que han evolucionado de forma incremental a lo largo de once hitos de desarrollo. Todas las capas comparten una única base de datos PostgreSQL expuesta a través de una API REST central.

```
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE CLIENTE                        │
│                                                             │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Nunjucks (SSR)  │  │  React SPA   │  │  Astro Site  │  │
│  │  Puerto 3000     │  │  Puerto 5173 │  │  Puerto 4321 │  │
│  └────────┬─────────┘  └──────┬───────┘  └──────┬───────┘  │
│           │                   │                  │          │
└───────────┼───────────────────┼──────────────────┼──────────┘
            │                   │                  │
            ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE BACKEND                        │
│                                                             │
│  Express.js — Node.js (Puerto 3000)                         │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  /api/*     │  │  Auth (JWT)  │  │  Estáticos /public │ │
│  │  REST JSON  │  │  Middleware  │  │  Archivos de imagen│ │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────┘ │
│         │                │                                  │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE DATOS                          │
│                                                             │
│  Prisma ORM ──► PostgreSQL 16 (Docker, Puerto 5433)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend

**Runtime:** Node.js v20+  
**Framework:** Express.js  
**ORM:** Prisma 7 con `@prisma/adapter-pg`  
**Base de datos:** PostgreSQL 16 (imagen Docker Alpine)  
**Autenticación:** JSON Web Tokens (JWT) almacenados en cookies `HttpOnly`  
**Sesiones:** `express-session` para el estado del carrito en el servidor  
**Logging:** Winston (rotación de archivos + salida por consola)  
**Patrón arquitectónico:** MVC — las rutas mapean a controladores, los controladores interactúan con Prisma

### Estructura de directorios

```
/
├── index.ts              # Punto de entrada, registro de middlewares
├── controllers/          # Lógica de negocio (productos, carrito, auth)
├── routes/               # Definición de endpoints
│   ├── api.ts            # API REST: /api/productos, /api/carrito
│   ├── productos.ts      # Vistas renderizadas en servidor
│   ├── usuarios.ts       # Rutas de auth: /login, /registro
│   └── carrito.ts        # Endpoints AJAX del carrito
├── views/                # Plantillas Nunjucks (SSR)
├── prisma/
│   ├── schema.prisma     # Modelo de datos
│   └── seeders/          # Scripts de población de datos
└── tests/                # Tests de API con Vitest y Supertest
```

### Endpoints de la API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista paginada de productos |
| GET | `/api/productos/random` | Producto aleatorio |
| GET | `/api/productos/:id` | Detalle de producto |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |
| GET | `/api/carrito` | Estado actual del carrito |

### Configuración CORS

El backend acepta peticiones de origen cruzado desde los siguientes orígenes:

- `http://localhost:5173` — SPA React (puerto por defecto de Vite)
- `http://localhost:5174` — SPA React (puerto alternativo de Vite)
- `http://localhost:4321` — Servidor de desarrollo de Astro

---

## SPA React (`/frontend`)

**Bundler:** Vite  
**Framework:** React 19  
**Estilos:** Tailwind CSS v4 + DaisyUI 5  
**Fetching de datos:** SWR con hooks personalizados  
**Enrutamiento:** React Router v7 (BrowserRouter)  
**Carrusel:** Embla Carousel  
**Tests:** Vitest + jsdom + Testing Library

### Flujo de datos

Los componentes no llaman a `fetch` directamente. Todo el acceso a datos remotos está centralizado en hooks personalizados:

- `useProductList(limit)` — obtiene una lista paginada desde `/api/productos`
- `useRandomProduct()` — obtiene un elemento aleatorio desde `/api/productos/random`

Las interfaces TypeScript en `src/types/index.ts` aplican tipado estricto a todas las respuestas de la API.

### Estructura de directorios

```
frontend/src/
├── components/       # Componentes UI reutilizables (Cuadros, Perritos)
├── hooks/            # Hooks de datos con SWR
├── layouts/          # MainLayout con navbar y Outlet
├── pages/            # Componentes de nivel de ruta (Portada, Tarea9, Carrusel)
├── types/            # Interfaces TypeScript
└── tests/            # Tests de componentes
```

---

## Sitio Astro (`/astro-shop`)

**Framework:** Astro 6  
**Modo de renderizado:** Generación de Sitio Estático (SSG)  
**Integración React:** `@astrojs/react` (Arquitectura de Islas)  
**Estilos:** Tailwind CSS v4 mediante `@tailwindcss/vite` + DaisyUI 5  
**Verificación de tipos:** `@astrojs/check` + modo strict de TypeScript

### Arquitectura de Islas

Astro genera HTML completamente estático por defecto. Los componentes que requieren interactividad del lado del cliente se marcan explícitamente con directivas de hidratación:

```astro
<Carrousel client:load />
```

La directiva `client:load` instruye a Astro para que envíe el JavaScript del componente React al navegador y lo hidrate inmediatamente al cargar la página. Todo el resto del contenido de la página es HTML estático sin JavaScript.

### Rutas

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `pages/index.astro` | Página de bienvenida (componente Astro estático) |
| `/carrousel` | `pages/carrousel.astro` | Galería impulsada por una isla de React |
| `/ssg` | `pages/ssg.astro` | Placeholder para el Hito 12 (catálogo SSG) |

### Estructura de directorios

```
astro-shop/src/
├── components/
│   ├── Carrousel.tsx     # Isla React (migrada desde /frontend)
│   └── Welcome.astro     # Componente de bienvenida estático
├── hooks/
│   └── useProducts.ts    # Hooks SWR (espejados desde /frontend)
├── layouts/
│   └── Layout.astro      # Envoltorio HTML compartido con navbar
├── pages/                # Enrutamiento basado en archivos
├── styles/
│   └── global.css        # Importaciones de Tailwind + DaisyUI
└── types/
    └── index.ts          # Interfaces Producto y ApiResponse
```

---

## Modelo de Datos

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

> **Nota sobre los nombres de campo:** El esquema Prisma usa caracteres españoles con diacríticos (`título`, `descripción`). Los consumidores de la API deben referenciar exactamente estos nombres de campo. El tipo `Char(127)` rellena los valores con espacios al final; llama siempre a `.trim()` al renderizar estos campos en la UI.
