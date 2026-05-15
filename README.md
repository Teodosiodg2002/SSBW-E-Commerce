# Tienda Prado

Sistema de comercio electrónico para la tienda del Museo del Prado, construido como una aplicación full-stack progresiva a lo largo de once hitos de desarrollo. El proyecto evoluciona desde un servidor Node.js mínimo hasta una arquitectura híbrida que combina Renderizado en Servidor, una Single Page Application en React y un sitio estático generado con Astro con islas de React.

---

## Capacidades Actuales

- Catálogo de productos con búsqueda, filtrado y páginas de detalle (Nunjucks SSR)
- Carrito de compra con interacciones AJAX (sin recargas de página completas)
- Autenticación basada en JWT con rutas protegidas
- API REST que sirve todos los datos de productos y carrito en JSON
- SPA en React con enrutamiento del lado del cliente, fetching de datos con SWR y un carrusel Embla
- Sitio estático con Astro con una isla de React hidratada para el carrusel
- Persistencia en PostgreSQL mediante Prisma ORM
- Arquitectura MVC en el backend (controladores, rutas, middleware)
- Suite de tests automatizados (Vitest + Supertest)

---

## Evolución del Proyecto

### Hito 1 — Fundamentos con Express y Node.js

**Contexto:** El proyecto necesitaba un punto de partida: un servidor web capaz de servir contenido dinámico.

**Implementación:** Se configuró un servidor Node.js con Express. Se definieron rutas, middleware para parsear el cuerpo de las peticiones y una respuesta HTML básica.

**Progreso:** Se estableció el runtime y la estructura del proyecto sobre la que se construyen todos los hitos posteriores.

---

### Hito 2 — Web Scraping con Playwright

**Contexto:** El catálogo necesitaba datos de productos reales sin introducción manual.

**Implementación:** Se escribió un script de Playwright que navega la tienda online del Museo del Prado, extrae títulos, descripciones, precios y URLs de imágenes, y los persiste en un archivo JSON local.

**Progreso:** Se automatizó la adquisición de datos, produciendo un conjunto de datos realista con más de 100 productos del inventario real del Prado.

---

### Hito 3 — Persistencia en Base de Datos con Prisma

**Contexto:** Almacenar datos en memoria o en archivos planos no es escalable. La aplicación necesitaba una base de datos relacional.

**Implementación:** Se introdujo PostgreSQL (mediante Docker) como motor de base de datos y Prisma como ORM. Se definieron los modelos `Producto` y `Usuario` en `schema.prisma` y se migraron los datos scrapeados a la base de datos mediante un script de semillado.

**Progreso:** Los datos sobreviven a los reinicios del servidor. El constructor de consultas con tipado seguro de Prisma previene una clase completa de errores en tiempo de ejecución y hace que el refactoring sea seguro.

---

### Hito 4 — Páginas de Productos y Búsqueda

**Contexto:** Los usuarios necesitaban explorar y encontrar productos, no solo ver un volcado de datos brutos.

**Implementación:** Se construyeron tres vistas renderizadas con Nunjucks: una página de inicio que lista todos los productos, una página de búsqueda con filtrado de texto completo mediante Prisma y una página de detalle de producto.

**Progreso:** La aplicación se convirtió en una tienda funcional con un catálogo navegable.

---

### Hito 5 — Carrito de Compra y Logging Profesional

**Contexto:** Una aplicación de e-commerce debe permitir a los usuarios seleccionar artículos para comprar. Además, el comportamiento en tiempo de ejecución necesitaba ser observable en producción.

**Implementación:** Se implementó un carrito de compra basado en sesiones usando `express-session`. Los usuarios pueden añadir y eliminar productos desde cualquier página de detalle. Se integró Winston para logging estructurado con rotación de archivos y salida por consola.

**Progreso:** La aplicación adquirió su funcionalidad comercial principal. La visibilidad operacional mediante logs estructurados permite la monitorización sin recurrir a `console.log`.

---

### Hito 6 — Autenticación y Seguridad

**Contexto:** Algunas rutas (página de cuenta, funciones administrativas) deben estar restringidas a usuarios autenticados.

**Implementación:** Se añadió un flujo de registro e inicio de sesión con hash de contraseñas mediante bcrypt. Los tokens de autenticación se emiten como JWT y se almacenan en cookies `HttpOnly`. Una capa de middleware decodifica el token en cada petición y pone el contexto del usuario a disposición de las plantillas y los manejadores de rutas.

**Progreso:** La aplicación obtuvo una capa de seguridad. Las peticiones no autenticadas a rutas protegidas son redirigidas a `/login` con una respuesta 302.

---

### Hito 7 — API REST

**Contexto:** El frontend en Nunjucks está acoplado al servidor. Habilitar un frontend separado o un cliente móvil requiere una interfaz de datos que devuelva JSON, no HTML.

**Implementación:** Se introdujo un router de API dedicado montado bajo `/api`. Todos los endpoints de productos devuelven JSON estructurado con metadatos de paginación. El CORS se configuró para permitir orígenes específicos.

**Progreso:** Se desacopló la capa de datos de la capa de presentación. El backend ahora sirve a dos tipos de clientes: las plantillas Nunjucks (HTML) y cualquier consumidor de API (JSON).

---

### Hito 8 — Mejoras de UX y DOM Dinámico

**Contexto:** El flujo del carrito requería recargas completas de página, haciendo que la experiencia se sintiera lenta y obsoleta.

**Implementación:** Se reemplazó la interacción del carrito basada en formularios con peticiones AJAX. El contador de artículos del carrito en la barra de navegación se actualiza sin recargar la página. El formulario de login obtuvo validación del lado del cliente con mensajes de error en línea.

**Progreso:** Se transicionaron los flujos de usuario clave de síncronos a asíncronos, mejorando significativamente el rendimiento percibido.

---

### Hito 9 — SPA en React (Primer Frontend Desacoplado)

**Contexto:** Construir interfaces de usuario interactivas complejas dentro de plantillas Nunjucks es limitante. Se necesitaba un enfoque basado en componentes para experiencias más ricas.

**Implementación:** Se creó un proyecto separado con Vite + React en `/frontend`. Se configuró CORS en el backend para aceptar peticiones del servidor de desarrollo de React. Se construyó un componente de galería de productos aleatorios usando SWR para el fetching de datos y Tailwind CSS para los estilos.

**Progreso:** Se introdujo el concepto de un frontend completamente desacoplado. La app React y el backend Express son ahora procesos independientes que se comunican exclusivamente a través de la API REST.

---

### Hito 10 — React Router, Embla Carousel y DaisyUI

**Contexto:** La aplicación React de una sola página necesitaba múltiples vistas navegables y componentes de UI más ricos.

**Implementación:** Se integró `react-router-dom` con una estructura de rutas anidadas usando un `MainLayout` compartido. Se construyó un componente `Carrousel` de página completa impulsado por Embla Carousel para mostrar imágenes de productos. Se añadió DaisyUI como librería de componentes sobre Tailwind CSS. Se refactorizó el fetching de datos en hooks personalizados reutilizables (`useProductList`, `useRandomProduct`) y se introdujeron interfaces TypeScript estrictas para eliminar los tipos `any`. Se implementó un manejador global de errores en el backend Express y se reorganizó la arquitectura siguiendo el patrón MVC.

**Progreso:** La aplicación React se convirtió en una verdadera SPA multi-página. El backend se estabilizó con prácticas de Clean Code: separación MVC, middleware optimizado y manejo centralizado de errores.

---

### Hito 11 — Sitio Estático con Astro e Islas de React

**Contexto:** No todas las páginas requieren el runtime completo de React. Un framework que genera HTML estático por defecto mientras habilita la interactividad selectivamente solo donde se necesita mejoraría el rendimiento y la velocidad de carga.

**Implementación:** Se creó un nuevo proyecto Astro en `/astro-shop`, aislado de la SPA React existente para no romper los hitos anteriores. Se configuró Astro con la integración `@astrojs/react` y Tailwind CSS v4 con DaisyUI. Se migró el componente `Carrousel.tsx` y sus hooks al proyecto Astro. La página del carrusel utiliza la directiva de hidratación `client:load` para enviar el JavaScript de React únicamente para ese componente, dejando el resto de la página como HTML estático sin JavaScript.

**Progreso:** Se introdujo la Arquitectura de Islas. La ruta `/carrousel` es ahora una página HTML estática que se mejora progresivamente con un componente React una vez que carga en el navegador. Esto demuestra cómo los generadores de sitios estáticos modernos pueden integrar componentes de framework sin pagar el coste de un bundle SPA completo en cada página.

---

## Índice de Documentación

| Documento | Descripción |
|---|---|
| [docs/deployment.md](docs/deployment.md) | Pasos de instalación, variables de entorno, configuración de Docker y comandos de ejecución |
| [docs/architecture.md](docs/architecture.md) | Stack técnico, diagramas de interacción entre componentes, referencia de la API y modelo de datos |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Errores conocidos y sus soluciones verificadas |
