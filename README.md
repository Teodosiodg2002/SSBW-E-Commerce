# 🏛️ Tienda Prado - E-Commerce de Arte

¡Bienvenido a **Tienda Prado**! Esta es una aplicación de comercio electrónico evolutiva inspirada en la tienda del Museo del Prado. El proyecto ha pasado de ser un servidor sencillo a una plataforma moderna con arquitectura desacoplada (Backend + Frontend).

## 🚀 ¿Cómo funciona la aplicación?

La aplicación se basa en una arquitectura **Full-stack** que combina dos mundos:

1.  **El Núcleo (Backend):** Un servidor robusto construido con **Node.js, Express y Prisma**. Se encarga de la lógica de negocio, la seguridad (JWT) y la gestión de la base de datos PostgreSQL.
2.  **La Interfaz (Frontend):** 
    *   Una interfaz clásica servida con **Nunjucks** para la tienda principal.
    *   Una **SPA (Single Page Application)** moderna construida con **React, Vite y Tailwind CSS** para experiencias de usuario de alta velocidad.

---

## 📈 Evolución y Mejoras (Hitos del Proyecto)

El proyecto ha crecido tarea a tarea, incorporando las mejores prácticas de la industria:

### 🌱 Tarea 1: Empezando con Express y Node.js
*   **Qué se hizo:** Configuración inicial del entorno de ejecución y creación del primer servidor web.
*   **Beneficio:** Establecimiento de una base sólida y escalable para construir toda la lógica de la tienda.

### 🕷️ Tarea 2: Web Scraping con Playwright
*   **Qué se hizo:** Automatización de la extracción de datos de productos reales de la web del Museo del Prado.
*   **Beneficio:** Disponibilidad de un catálogo real y variado sin necesidad de introducir datos manualmente.

### 🗄️ Tarea 3: Base de Datos con Prisma
*   **Qué se hizo:** Implementación del ORM Prisma y modelado de datos para PostgreSQL.
*   **Beneficio:** Persistencia de datos eficiente y segura, permitiendo gestionar miles de productos con alto rendimiento.

### 🖼️ Tarea 4: Portada, Búsqueda y Detalle
*   **Qué se hizo:** Creación de las vistas principales de la tienda y lógica de filtrado de productos.
*   **Beneficio:** Una interfaz funcional donde los usuarios pueden explorar el catálogo de arte de forma intuitiva.

### 🛒 Tarea 5: Carrito y Logging Profesional
*   **Qué se hizo:** Implementación de la cesta de la compra y sistema de logs con Winston.
*   **Beneficio:** Los usuarios pueden gestionar sus pedidos y el administrador puede monitorizar errores y eventos en tiempo real.

### 🔐 Tarea 6: Autenticación y Seguridad
*   **Qué se hizo:** Sistema de registro, inicio de sesión y protección de rutas con JWT.
*   **Beneficio:** Seguridad para los datos de los usuarios y control de acceso a funciones administrativas.

### 🛠️ Tarea 7: Estandarización con API REST
*   **Qué se hizo:** Creamos una interfaz de comunicación estándar (API).
*   **Beneficio:** Ahora el servidor no solo sirve páginas web, sino que puede enviar datos crudos (JSON) a cualquier otra aplicación (como un móvil o nuestra nueva SPA).

### ✨ Tarea 8: Experiencia de Usuario (UX) y DOM
*   **Qué se hizo:** Mejoramos el login con validaciones inteligentes y transformamos el carrito para que funcione sin recargar la página.
*   **Beneficio:** La navegación se siente mucho más fluida. El usuario puede añadir o quitar productos y ver los cambios al instante, eliminando la fricción de esperar a que la página cargue.

### ⚛️ Tarea 9: El Salto a React (SPA)
*   **Qué se hizo:** Introdujimos un frontal independiente con **React** y **Vite**, consumiendo datos mediante **CORS** y la librería **SWR**.
*   **Beneficio:** Separamos totalmente la "cara" de la aplicación del "cerebro". Usar componentes de React nos permite crear interfaces mucho más complejas y reactivas de forma organizada, mientras que **Tailwind CSS** nos da un diseño premium y adaptado a móviles.

### 🧭 Tarea 10: Router, Embla y DaisyUI
*   **Qué se hizo:** Implementamos enrutamiento con `react-router-dom` creando múltiples páginas (Portada, Galería, Carrusel). Integramos `daisyui` para componentes listos para usar y `embla-carousel-react` para la presentación de imágenes.
*   **Beneficio:** La aplicación ahora tiene una navegación real de SPA (Single Page Application) sin recargas. Además, se ha realizado una **refactorización profesional**, limpiando el repositorio y organizando los scripts de base de datos de manera óptima.

---

## 🛠️ Stack Tecnológico

*   **Lenguaje:** TypeScript (Tipado fuerte para evitar errores).
*   **Backend:** Express.js, Prisma ORM, JWT (Autenticación).
*   **Frontend:** Nunjucks (Clásico) / React + Vite (Moderno).
*   **Estilos:** Bootstrap 5 / Tailwind CSS v4.
*   **Base de Datos:** PostgreSQL (en contenedor Docker).
*   **DevOps:** GitHub Actions (CI/CD) y Docker.

---

## 💻 Instrucciones de Ejecución

### 1. Preparación
Asegúrate de tener un archivo `.env` configurado. Luego, instala las dependencias:
```powershell
npm install
cd frontend; npm install; cd ..
```

### 2. Base de Datos (Docker)
Levanta el contenedor de PostgreSQL:
```powershell
docker compose up -d
```

### 3. Sincronización y Datos
Configura las tablas y añade los productos de prueba:
```powershell
npx prisma migrate dev --name init
npm run seed
npm run usuarios
```

### 4. Lanzamiento
Para ver todo en funcionamiento, necesitas arrancar ambos mundos:

*   **Backend (Puerto 3000):** `npm run dev`
*   **Frontend SPA (Puerto 5173):** `cd frontend; npm run dev`

---

## 📁 Estructura del Proyecto (MVC)

El proyecto sigue el patrón **Modelo-Vista-Controlador (MVC)** para una organización profesional:

*   `index.ts`: Punto de entrada del servidor y configuración de middlewares globales.
*   `controllers/`: Lógica de negocio (Controladores) desacoplada de las rutas.
*   `routes/`: Definición de endpoints y mapeo a controladores.
*   `prisma/`: Modelos de datos y scripts de semillado (*seeders*).
*   `views/`: Plantillas Nunjucks para la tienda clásica (Vistas SSR).
*   `frontend/`: Código fuente de la SPA en React (Vistas CSR).
*   `tests/`: Suite de pruebas automatizadas para el backend.

---

## 🧪 Suite de Tests (Garantía de Calidad)

Se ha implementado una suite de pruebas robusta usando **Vitest** y **Supertest** para asegurar la estabilidad del sistema:

*   **Tests de API:** Valida que los endpoints de productos y carrito respondan correctamente.
*   **Tests de Seguridad:** Verifica la protección de rutas mediante JWT.
*   **Tests de Frontend:** Pruebas de renderizado y lógica de componentes React.

### Cómo ejecutar los tests:
*   **Backend:** `npm test` (desde la raíz).
*   **Frontend:** `cd frontend; npm test`.

---

## 🚀 Optimización "Clean Code 2026"
El proyecto ha sido estabilizado bajo estándares modernos:
*   **Aislamiento de API:** Todas las rutas REST están bajo el prefijo `/api` de forma estricta.
*   **Performance:** El middleware del carrito ha sido optimizado para ignorar peticiones de API, reduciendo la latencia y carga en la BD.
*   **Tipado Estricto:** Eliminación de tipos `any` en favor de interfaces TypeScript robustas.
*   **Manejo de Errores:** Implementación de un *Global Error Handler* que centraliza fallos y evita caídas del servidor.


