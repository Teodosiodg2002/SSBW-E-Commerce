# Tienda Prado — SSBW

Clon de la [Tienda del Museo del Prado](https://www.tiendaprado.com/) para la asignatura de Sistemas Software Basados en la Web.

## Tareas implementadas

| Tarea | Descripcion |
|-------|------------|
| 1 | Servidor Express + Nunjucks |
| 2 | Web scraping con Playwright |
| 3 | Base de datos PostgreSQL + Prisma |
| 4 | Portada, busqueda y detalle |
| 5 | Logger (Winston) y carrito |
| 6 | Autenticacion JWT |
| 7 | API REST para productos |

## Como ejecutar

**Requisitos:** Node.js 24+, Docker Desktop, Git.

```bash
# 1. Clonar el repositorio
git clone https://github.com/Teodosiodg2002/SSBW-E-Commerce.git
cd SSBW-E-Commerce/SSBW

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env (copiar y editar)
# Contenido minimo:
#   PORT=3000
#   POSTGRES_USER=yo
#   POSTGRES_PASSWORD=tu_clave
#   POSTGRES_DB=ssbw
#   DATABASE_URL="postgresql://yo:tu_clave@localhost:5432/ssbw?schema=public"
#   SECRET_KEY="clave-jwt"
#   SESSION_SECRET="clave-session"
#   LOG_LEVEL=info

# 4. Arrancar PostgreSQL
docker compose up -d

# 5. Crear las tablas y generar el cliente Prisma
npm run migrate

# 6. Cargar los productos
npm run seed

# 7. Crear usuarios de prueba
npm run usuarios

# 8. Arrancar la app
npm run dev
```

La tienda estara en **http://localhost:3000**

## Usuarios de prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@prado.es | Admin1234! | Admin |
| usuario@prado.es | Demo1234! | Normal |

## Scripts

| Comando | Que hace |
|---------|----------|
| `npm run dev` | Arranca el servidor con hot-reload |
| `npm run seed` | Carga los productos en la BD |
| `npm run usuarios` | Crea los usuarios de prueba |
| `npm run migrate` | Ejecuta las migraciones de Prisma |
| `npm run studio` | Abre Prisma Studio (BD visual) |

## API REST

| Metodo | Ruta | Descripcion |
|--------|------|------------|
| GET | /api/productos | Lista (con ?desde, ?hasta, ?ordenacion) |
| GET | /api/productos/:id | Un producto |
| POST | /api/productos | Crear |
| PUT | /api/productos/:id | Actualizar |
| DELETE | /api/productos/:id | Eliminar |

Se pueden probar con la extension **REST Client** de VS Code abriendo `test-api.http`.

## Estructura

```
index.ts                 Servidor principal
logger.ts                Configuracion de Winston
prisma/
  schema.prisma          Esquema de la BD
  prisma.client.ts       Cliente Prisma + metodos de auth
routes/
  productos.ts           Tienda y carrito
  usuarios.ts            Login / logout
  api.ts                 API REST
views/
  base.njk               Layout comun
  portada.njk             Listado de productos
  detalle.njk             Detalle de producto
  login.njk               Formulario de login
  mi-cuenta.njk           Panel de usuario
```
