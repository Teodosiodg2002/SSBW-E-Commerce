# Guía de Despliegue

Este documento describe los requisitos y comandos necesarios para ejecutar el sistema Tienda Prado localmente en un entorno de desarrollo.

---

## Requisitos del Sistema

| Dependencia | Versión mínima | Propósito |
|---|---|---|
| Node.js | v20 LTS | Runtime para el backend y las herramientas de build |
| npm | v10 | Gestor de paquetes |
| Docker Desktop | v4 | Contenedor de PostgreSQL |
| Git | v2.40 | Control de versiones |

---

## Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/Teodosiodg2002/SSBW-E-Commerce.git
cd SSBW-E-Commerce

# Dependencias del backend
npm install

# Dependencias de la SPA en React
cd frontend && npm install && cd ..

# Dependencias del sitio Astro
cd astro-shop && npm install && cd ..
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto. Usa el siguiente ejemplo como referencia:

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5433/tiendaprado"
SESSION_SECRET="tu-secreto-de-sesion"
SECRET_KEY="tu-secreto-jwt"
PORT=3000
```

> El puerto en `DATABASE_URL` debe ser `5433`, que es el puerto del host mapeado al contenedor de PostgreSQL.

---

## Base de Datos

### Iniciar el contenedor de PostgreSQL

```bash
docker compose up -d
```

El `docker-compose.yml` utiliza la imagen `postgres:16-alpine`, fijada a la versión 16 para garantizar la compatibilidad del formato de datos. Usar el tag `postgres:alpine` sin versión puede corromper los datos cuando Docker descarga automáticamente una versión mayor más nueva.

### Ejecutar las migraciones

```bash
npx prisma migrate dev
```

### Sembrar la base de datos

```bash
# Cargar productos (115 artículos del Museo del Prado)
npm run seed

# Crear usuarios de demostración
npm run usuarios
```

---

## Ejecución del Sistema

El sistema consta de tres procesos independientes. Cada uno requiere una terminal separada.

### Terminal 1 — Backend (Express + Prisma)

```bash
npm run dev
# Escucha en http://localhost:3000
```

### Terminal 2 — SPA en React (Vite)

```bash
cd frontend
npm run dev
# Escucha en http://localhost:5173 o 5174
```

### Terminal 3 — Sitio Estático en Astro

```bash
cd astro-shop
npm run dev
# Escucha en http://localhost:4321
```

---

## Tests

### Tests del backend (Vitest + Supertest)

```bash
npm test
# Ejecuta los tests del directorio /tests contra la app Express activa
```

### Tests del frontend (Vitest + Testing Library)

```bash
cd frontend
npm test
```

---

## Build de Producción

Para verificar que el sitio Astro compila sin errores:

```bash
cd astro-shop
npm run build
# Salida en astro-shop/dist/
```

Verificación de tipos para archivos Astro:

```bash
cd astro-shop
npx astro check
```
