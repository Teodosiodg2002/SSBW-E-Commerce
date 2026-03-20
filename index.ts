import express from 'express';
import nunjucks from 'nunjucks';
import session from 'express-session';
import logger from './logger.ts';
import './types/session.d.ts';
import ProductosRouter from "./routes/productos.ts";

const app = express();
const serverPort = process.env.PORT || 3000;

// Configuración Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
});

// Middleware para parsear formularios POST
app.use(express.urlencoded({ extended: true }));

// Middleware para sesiones (carrito)
app.use(session({
    secret: process.env.SESSION_SECRET || 'tienda-prado-secret',
    resave: false,
    saveUninitialized: false
}));

// Middleware: enriquece el carrito de la sesión con datos de BD y lo propaga a res.locals
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

// Router de productos
app.use('/', ProductosRouter);

app.listen(serverPort, () => {
    logger.info(`Servidor iniciado en http://localhost:${serverPort}`);
});
