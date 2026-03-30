import express from 'express';
import nunjucks from 'nunjucks';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import logger from './logger.ts';
import './types/session.d.ts';
import ProductosRouter from "./routes/productos.ts";
import UsuariosRouter from "./routes/usuarios.ts";

const app = express();
const serverPort = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY ?? 'dev-secret-prado';

// Configuración Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
});

// Middleware para parsear formularios POST
app.use(express.urlencoded({ extended: true }));

// Middleware para cookies
app.use(cookieParser());

// Middleware para sesiones (carrito)
app.use(session({
    secret: process.env.SESSION_SECRET || 'tienda-prado-secret',
    resave: false,
    saveUninitialized: false
}));

// ─── Middleware de autenticación JWT ──────────────────────────────────
// Lee la cookie access_token, verifica el JWT y propaga usuario/admin
// a app.locals para que estén disponibles en todas las plantillas.
app.use((req, res, next) => {
    const token = req.cookies.access_token;
    if (token) {
        try {
            const data = jwt.verify(token, SECRET_KEY) as { usuario: string; admin: boolean };
            app.locals.usuario = data.usuario;
            app.locals.admin   = data.admin;
            logger.debug(`Autentificado: ${data.usuario} (admin=${data.admin})`);
        } catch {
            // Token inválido o expirado → limpiar
            app.locals.usuario = undefined;
            app.locals.admin   = undefined;
        }
    } else {
        app.locals.usuario = undefined;
        app.locals.admin   = undefined;
    }
    next();
});

// ─── Middleware del carrito ───────────────────────────────────────────
// Enriquece el carrito de la sesión con datos de BD y lo propaga a res.locals
app.use(async (req, res, next) => {
    res.locals.total_carrito = req.session.total_carrito ?? 0;
    const carrito_sesion = req.session.carrito ?? [];

    if (carrito_sesion.length > 0) {
        try {
            const { default: prisma } = await import('./prisma/prisma.client.ts');
            const ids = carrito_sesion.map(i => i.id);
            const productos = await prisma.producto.findMany({ where: { id: { in: ids } } });

            res.locals.carrito = carrito_sesion.map(item => {
                const p = productos.find(x => x.id === item.id);
                const precio_num = Number(p?.precio ?? 0);
                return {
                    ...item,
                    título: p?.título?.trim() ?? '',
                    imagen: p?.imagen ?? '',
                    precio_str: precio_num.toFixed(2).replace('.', ',')
                };
            });

            const subtotal = carrito_sesion.reduce((acc, item) => {
                const p = productos.find(x => x.id === item.id);
                return acc + Number(p?.precio ?? 0) * item.cantidad;
            }, 0);
            res.locals.subtotal_str = subtotal.toFixed(2).replace('.', ',');
        } catch {
            res.locals.carrito = [];
            res.locals.subtotal_str = '0,00';
        }
    } else {
        res.locals.carrito = [];
        res.locals.subtotal_str = '0,00';
    }
    next();
});

// Middleware para servir imágenes locales como ficheros estáticos
app.use('/public/imagenes', express.static('imagenes'));

// Routers
app.use('/', UsuariosRouter);
app.use('/', ProductosRouter);

app.listen(serverPort, () => {
    logger.info(`Servidor iniciado en http://localhost:${serverPort}`);
});
