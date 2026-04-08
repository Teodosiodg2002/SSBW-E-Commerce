/**
 * app.ts — Configuración de Express (Tareas 1-7)
 *
 * Exporta la instancia `app` sin iniciar el servidor,
 * lo que permite importarla en tests sin efectos secundarios.
 * El servidor se arranca en index.ts llamando a app.listen().
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
import ApiRouter from './routes/api.ts';

const app = express();
const SECRET_KEY = process.env.SECRET_KEY ?? 'dev-secret-prado';

// ── Plantillas Nunjucks ───────────────────────────────────────────────
nunjucks.configure('views', { autoescape: true, express: app, watch: true });

// ── Middlewares globales ──────────────────────────────────────────────
app.use(express.urlencoded({ extended: true })); // formularios POST (tienda)
app.use(express.json());                          // body JSON (API REST)
app.use(cookieParser());                          // leer cookies
app.use(session({                                 // sesiones (carrito)
    secret: process.env.SESSION_SECRET || 'tienda-prado-secret',
    resave: false,
    saveUninitialized: false
}));

// ── Autenticación JWT ─────────────────────────────────────────────────
// Lee la cookie access_token y propaga usuario/admin a app.locals
// para que las plantillas Nunjucks puedan usarlos.
app.use((req, res, next) => {
    const token = req.cookies.access_token;
    if (token) {
        try {
            const data = jwt.verify(token, SECRET_KEY) as { usuario: string; admin: boolean };
            app.locals.usuario = data.usuario;
            app.locals.admin   = data.admin;
        } catch {
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
// Carga los datos del carrito desde BD en cada petición y los pone
// en res.locals para que base.njk pueda mostrar el drawer lateral.
app.use(async (req, res, next) => {
    const carrito_sesion = req.session.carrito ?? [];
    res.locals.total_carrito  = req.session.total_carrito ?? 0;

    if (carrito_sesion.length === 0) {
        res.locals.carrito      = [];
        res.locals.subtotal_str = '0,00';
        return next();
    }

    try {
        const ids       = carrito_sesion.map(i => i.id);
        const productos = await prisma.producto.findMany({ where: { id: { in: ids } } });

        res.locals.carrito = carrito_sesion.map(item => {
            const p          = productos.find(x => x.id === item.id);
            const precio_num = Number(p?.precio ?? 0);
            return {
                ...item,
                título:     p?.título?.trim() ?? '',
                imagen:     p?.imagen ?? '',
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

// ── Ficheros estáticos ────────────────────────────────────────────────
app.use('/public/imagenes', express.static('imagenes'));

// ── Rutas ─────────────────────────────────────────────────────────────
app.use('/', UsuariosRouter);   // /login, /logout, /mi-cuenta
app.use('/', ProductosRouter);  // /, /buscar, /producto/:id, /al-carrito/:id
app.use('/', ApiRouter);        // /api/productos (CRUD + paginación)

export default app;
