// routes/productos.ts — Rutas de la tienda y carrito
import express from 'express';
import prisma from '../prisma/prisma.client.ts';
import logger from '../logger.ts';
import '../types/session.d.ts';

const router = express.Router();

// Portada: lista de productos
router.get('/', async (req, res) => {
    try {
        const cards = await prisma.producto.findMany({
            omit: { descripción: true },
            orderBy: { id: 'asc' }
        });
        res.render('portada.njk', { cards, busqueda: '' });
    } catch (error: any) {
        logger.error(`Portada: ${error.message}`);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Busqueda por texto
router.get('/buscar', async (req, res) => {
    const busqueda = (req.query.busqueda as string) || '';
    try {
        const cards = await prisma.producto.findMany({
            where: {
                OR: [
                    { título:      { contains: busqueda, mode: 'insensitive' } },
                    { descripción: { contains: busqueda, mode: 'insensitive' } }
                ]
            },
            omit: { descripción: true },
            orderBy: { id: 'asc' }
        });
        logger.debug(`Busqueda: "${busqueda}" -> ${cards.length} resultados`);
        res.render('portada.njk', { cards, busqueda });
    } catch (error: any) {
        logger.error(`Busqueda: ${error.message}`);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Detalle de producto
router.get('/producto/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const producto = await prisma.producto.findUnique({ where: { id } });
        if (!producto) return res.status(404).send('Producto no encontrado');
        res.render('detalle.njk', { producto });
    } catch (error: any) {
        logger.error(`Detalle id=${id}: ${error.message}`);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Anadir al carrito
router.post('/al-carrito/:id', (req, res) => {
    const id       = Number(req.params.id);
    const cantidad = Number(req.body.cantidad);

    if (cantidad > 0) {
        req.session.carrito ??= [];
        const existente = req.session.carrito.find(item => item.id === id);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            req.session.carrito.push({ id, cantidad });
        }
        req.session.total_carrito = req.session.carrito.reduce((acc, i) => acc + i.cantidad, 0);
    }

    res.redirect(`/producto/${id}`);
});

// Quitar del carrito
router.get('/quitar-del-carrito/:id', (req, res) => {
    const id = Number(req.params.id);
    if (req.session.carrito) {
        req.session.carrito       = req.session.carrito.filter(i => i.id !== id);
        req.session.total_carrito = req.session.carrito.reduce((acc, i) => acc + i.cantidad, 0);
    }
    res.redirect(req.get('Referrer') || '/');
});

export default router;
