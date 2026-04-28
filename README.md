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

### 🛠️ Tarea 7: Estandarización con API REST
*   **Qué se hizo:** Creamos una interfaz de comunicación estándar (API).
*   **Beneficio:** Ahora el servidor no solo sirve páginas web, sino que puede enviar datos crudos (JSON) a cualquier otra aplicación (como un móvil o nuestra nueva SPA).

### ✨ Tarea 8: Experiencia de Usuario (UX) y DOM
*   **Qué se hizo:** Mejoramos el login con validaciones inteligentes y transformamos el carrito para que funcione sin recargar la página.
*   **Beneficio:** La navegación se siente mucho más fluida. El usuario puede añadir o quitar productos y ver los cambios al instante, eliminando la fricción de esperar a que la página cargue.

### ⚛️ Tarea 9: El Salto a React (SPA)
*   **Qué se hizo:** Introdujimos un frontal independiente con **React** y **Vite**, consumiendo datos mediante **CORS** y la librería **SWR**.
*   **Beneficio:** Separamos totalmente la "cara" de la aplicación del "cerebro". Usar componentes de React nos permite crear interfaces mucho más complejas y reactivas de forma organizada, mientras que **Tailwind CSS** nos da un diseño premium y adaptado a móviles.

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

## 📁 Estructura del Proyecto

*   `index.ts`: Punto de entrada del servidor.
*   `routes/`: Lógica de navegación y API.
*   `prisma/`: Definición de modelos de datos.
*   `views/`: Plantillas para la tienda clásica.
*   `frontend/`: Código fuente de la nueva aplicación React.

---
*Desarrollado con ❤️ para el Master SIBW.*
