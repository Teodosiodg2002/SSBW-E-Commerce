/**
 * index.ts — Punto de entrada del servidor (Tarea 1)
 *
 * Configura Express con:
 *  - Nunjucks como motor de plantillas (Tarea 1)
 *  - Sesiones para el carrito de compra (Tarea 5)
 *  - Cookies y JWT para autenticación (Tarea 6)
 *  - Middleware que propaga carrito y usuario a todas las plantillas
 *  - Dos routers: productos (tienda) y usuarios (auth)
 */
import express from 'express';
import nunjucks from 'nunjucks';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import logger from './logger.ts';
import './types/session.d.ts';
import prisma from './prisma/prisma.client.ts';
import ProductosRouter from './routes/productos.ts';
import UsuariosRouter from './routes/usuarios.ts';

const app = express();
const PORT       = process.env.PORT       || 3000;
const SECRET_KEY = process.env.SECRET_KEY ?? 'dev-secret-prado';

// ── Plantillas ────────────────────────────────────────────────────────
nunjucks.configure('views', { autoescape: true, express: app, watch: true });

// ── Middlewares globales ──────────────────────────────────────────────
app.use(express.urlencoded({ extended: true })); // parsear formularios POST
app.use(cookieParser());                          // leer cookies
app.use(session({                                 // sesiones para el carrito
    secret: process.env.SESSION_SECRET || 'tienda-prado-secret',
    resave: false,
    saveUninitialized: false
}));

// ── Autenticación JWT ─────────────────────────────────────────────────
// Lee la cookie access_token en cada petición y, si es válida,
// pone usuario y admin en app.locals para que las plantillas lo vean.
app.use((req, res, next) => {
    const token = req.cookies.access_token;
    if (token) {
        try {
            const data = jwt.verify(token, SECRET_KEY) as { usuario: string; admin: boolean };
            app.locals.usuario = data.usuario;
            app.locals.admin   = data.admin;
        } catch {
            // Token caducado o manipulado → tratar como anónimo
            app.locals.usuario = undefined;
            app.locals.admin   = undefined;
        }
    } else {
        app.locals.usuario = undefined;
        app.locals.admin   = undefined;
    }
    next();
});

// ── Carrito de compra ─────────────────────────────────────────────────
// En cada petición, carga los datos completos del carrito desde la BD
// y los pone en res.locals para que base.njk pueda mostrar el drawer.
app.use(async (req, res, next) => {
    const carrito_sesion = req.session.carrito ?? [];
    res.locals.total_carrito = req.session.total_carrito ?? 0;

    if (carrito_sesion.length === 0) {
        res.locals.carrito     = [];
        res.locals.subtotal_str = '0,00';
        return next();
    }

    try {
        const ids       = carrito_sesion.map(i => i.id);
        const productos = await prisma.producto.findMany({ where: { id: { in: ids } } });

        // Enriquecer cada ítem con nombre, imagen y precio para la plantilla
        res.locals.carrito = carrito_sesion.map(item => {
            const p         = productos.find(x => x.id === item.id);
            const precio_num = Number(p?.precio ?? 0);
            return {
                ...item,
                título:    p?.título?.trim() ?? '',
                imagen:    p?.imagen ?? '',
                precio_str: precio_num.toFixed(2).replace('.', ',')
            };
        });

        const subtotal = carrito_sesion.reduce((acc, item) => {
            const p = productos.find(x => x.id === item.id);
            return acc + Number(p?.precio ?? 0) * item.cantidad;
        }, 0);
        res.locals.subtotal_str = subtotal.toFixed(2).replace('.', ',');
    } catch {
        res.locals.carrito      = [];
        res.locals.subtotal_str = '0,00';
    }
    next();
});

// ── Ficheros estáticos ─────────────────────────────────────────────────
// Las imágenes descargadas por el scraper se sirven en /public/imagenes/
app.use('/public/imagenes', express.static('imagenes'));

// ── Rutas ──────────────────────────────────────────────────────────────
app.use('/', UsuariosRouter);   // /login, /logout
app.use('/', ProductosRouter);  // /, /buscar, /producto/:id, /al-carrito/:id

app.listen(PORT, () => {
    logger.info(`Servidor iniciado en http://localhost:${PORT}`);
});
