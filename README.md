# SSBW E-Commerce — Tienda Prado

Aplicación web de comercio electrónico desarrollada como práctica de **Sistemas Software Basados en la Web**.  
Replica la [Tienda del Museo del Prado](https://www.tiendaprado.com/) con catálogo de productos, buscador, carrito, autenticación y API REST.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Servidor | Node.js 24 + Express |
| Plantillas | Nunjucks |
| Base de datos | PostgreSQL (Docker) |
| ORM | Prisma 7 |
| Autenticación | JWT + cookies `httpOnly` |
| Logger | Winston |
| CI/CD | GitHub Actions + GHCR |

---

## Tareas implementadas

- [x] **Tarea 1** — Servidor Express + Nunjucks
- [x] **Tarea 2** — Web scraping con Playwright (productos de Tienda Prado)
- [x] **Tarea 3** — Base de datos PostgreSQL con Prisma 7
- [x] **Tarea 4** — Portada, búsqueda y páginas de detalle (MVC)
- [x] **Tarea 5** — Logger (Winston) y carrito de compra (sesiones)
- [x] **Tarea 6** — Autenticación con JWT y cookies `httpOnly`
- [x] **Tarea 7** — API REST para productos (CRUD + paginación) *(PR pendiente de merge)*
- [x] **CI/CD** — GitHub Actions: tests automáticos + imagen Docker en GHCR

---

## Requisitos previos

- [Node.js 24+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

---

## Cómo ejecutar la app

### Opción A — Docker Compose completo (postgres + app)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Teodosiodg2002/SSBW-E-Commerce.git
cd SSBW-E-Commerce/SSBW

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus claves

# 3. Levantar postgres + app
docker compose up -d

# 4. Aplicar migraciones (primera vez)
docker compose exec app npx prisma migrate deploy

# 5. Cargar productos de muestra (primera vez)
docker compose exec app node seed.ts

# 6. Registrar usuarios de prueba (primera vez)
docker compose exec app node registra_usuarios.ts
```

La tienda estará disponible en **http://localhost:3000**

---

### Opción B — Desarrollo local con hot-reload

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/Teodosiodg2002/SSBW-E-Commerce.git
cd SSBW-E-Commerce/SSBW
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus claves

# 3. Arrancar solo la base de datos
docker compose up -d postgres

# 4. Aplicar migraciones y generar el cliente Prisma
npm run migrate

# 5. Cargar datos de muestra
npm run seed

# 6. Registrar usuarios de prueba (para el login)
npm run usuarios

# 7. Arrancar el servidor en modo desarrollo (hot-reload)
npm run dev
```

---

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```env
PORT=3000

POSTGRES_USER=yo
POSTGRES_PASSWORD=cambia_esta_clave
POSTGRES_DB=ssbw

DATABASE_URL="postgresql://yo:cambia_esta_clave@localhost:5432/ssbw?schema=public"

SECRET_KEY="clave-jwt-muy-larga-y-aleatoria"
SESSION_SECRET="otra-clave-secreta"

LOG_LEVEL=info
```

> [!CAUTION]
> Nunca subas `.env` a Git. Está en `.gitignore` por defecto.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor con hot-reload (desarrollo) |
| `npm test` | Tests de integración de la API |
| `npm run seed` | Carga los productos en la BD |
| `npm run usuarios` | Crea usuarios de prueba |
| `npm run migrate` | Aplica migraciones de Prisma |
| `npm run studio` | Abre Prisma Studio (interfaz gráfica de BD) |
| `npm run scrap` | Ejecuta el scraper de Tienda Prado |

---

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@prado.es` | `Admin1234!` | Administrador |
| `usuario@prado.es` | `Demo1234!` | Usuario normal |

---

## API REST

Base URL: `http://localhost:3000`

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| `GET` | `/api/productos` | Lista productos |
| `GET` | `/api/productos/:id` | Detalle de un producto |
| `POST` | `/api/productos` | Crear producto |
| `PUT` | `/api/productos/:id` | Actualizar producto |
| `DELETE` | `/api/productos/:id` | Eliminar producto |

**Paginación en GET /api/productos:**
```
?desde=0&hasta=20&ordenacion=asc|desc
```

Prueba los endpoints desde VS Code con la extensión **REST Client** abriendo [`test-api.http`](test-api.http).

---

## CI/CD

Cada push a `main` o PR activa el pipeline en GitHub Actions:

1. **Tests** — Levanta PostgreSQL, aplica migraciones y ejecuta `npm test`
2. **Docker** *(solo push a main tras tests verdes)* — Construye la imagen y la publica en GHCR

Para descargar la última imagen publicada:

```bash
docker pull ghcr.io/teodosiodg2002/ssbw-e-commerce:latest
```
