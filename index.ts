// index.ts — Servidor principal de la Tienda Prado
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
const PORT       = process.env.PORT       || 3000;
const SECRET_KEY = process.env.SECRET_KEY ?? 'dev-secret-prado';

// Plantillas Nunjucks
nunjucks.configure('views', { autoescape: true, express: app, watch: true });

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'tienda-prado-secret',
    resave: false,
    saveUninitialized: false
}));

// Autenticacion JWT: lee la cookie y propaga usuario a las plantillas
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

// Carrito: enriquece los datos de la sesion con info de la BD
app.use(async (req, res, next) => {
    const carrito_sesion = req.session.carrito ?? [];
    res.locals.total_carrito = req.session.total_carrito ?? 0;

    if (carrito_sesion.length === 0) {
        res.locals.carrito      = [];
        res.locals.subtotal_str = '0,00';
        return next();
    }

    try {
        const ids       = carrito_sesion.map(i => i.id);
        const productos = await prisma.producto.findMany({ where: { id: { in: ids } } });

        res.locals.carrito = carrito_sesion.map(item => {
            const p = productos.find(x => x.id === item.id);
            return {
                ...item,
                título:     p?.título?.trim() ?? '',
                imagen:     p?.imagen ?? '',
                precio_str: Number(p?.precio ?? 0).toFixed(2).replace('.', ',')
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

// Ficheros estaticos
app.use('/public/imagenes', express.static('imagenes'));

// Rutas
app.use('/', UsuariosRouter);
app.use('/', ProductosRouter);
app.use('/', ApiRouter);

app.listen(PORT, () => {
    logger.info(`Servidor en http://localhost:${PORT}`);
});
