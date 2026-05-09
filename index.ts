// index.ts — Servidor principal de la Tienda Prado
import express from 'express';
import nunjucks from 'nunjucks';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import logger from './logger.ts';
import './types/session.d.ts';
import prisma from './prisma/prisma.client.ts';
import ProductosRouter from './routes/productos.ts';
import UsuariosRouter from './routes/usuarios.ts';
import ApiRouter from './routes/api.ts';
import CarritoRouter from './routes/carrito.ts';

const app = express();
const PORT       = process.env.PORT       || 3000;
const SECRET_KEY = process.env.SECRET_KEY ?? 'dev-secret-prado';

// Plantillas Nunjucks
nunjucks.configure('views', { autoescape: true, express: app, watch: true });

// Middlewares
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
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

// Carrito: enriquece los datos de la sesion con info de la BD (Solo para vistas Nunjucks)
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) return next(); // Optimizacion: Ignorar API

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
app.use('/api', ApiRouter); // API aislada
app.use('/api', CarritoRouter); // Carrito AJAX aislado


// Manejo global de errores (Debe ser el ultimo middleware)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(`Error no capturado: ${err.message}`, { stack: err.stack });
    
    if (req.path.startsWith('/api')) {
        res.status(500).json({ error: 'Error interno del servidor' });
    } else {
        res.status(500).send('<h2>Error Interno del Servidor</h2><p>Por favor, inténtelo de nuevo más tarde.</p>');
    }
});

export default app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Servidor en http://localhost:${PORT}`);
    });
}
