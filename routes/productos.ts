/**
 * routes/productos.ts — Tarea 4 (tienda) + Tarea 5 (carrito)
 *
 * Controlador de la tienda. Gestiona:
 *   GET  /                   → portada con todos los productos
 *   GET  /buscar?busqueda=   → filtrado por texto en título o descripción
 *   GET  /producto/:id       → página de detalle de un producto
 *   POST /al-carrito/:id     → añadir producto a la sesión de carrito
 *   GET  /quitar-del-carrito/:id → eliminar producto de la sesión de carrito
 */
import express from 'express';
import prisma from '../prisma/prisma.client.ts';
import logger from '../logger.ts';
import '../types/session.d.ts';

const router = express.Router();

// Portada: muestra todos los productos (sin descripción para no cargar datos innecesarios)
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

// Búsqueda: filtra por texto en título o descripción, sin distinción de mayúsculas/minúsculas
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
        logger.debug(`Búsqueda: "${busqueda}" → ${cards.length} resultados`);
        res.render('portada.njk', { cards, busqueda });
    } catch (error: any) {
        logger.error(`Búsqueda: ${error.message}`);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Detalle: muestra todos los campos de un producto, incluyendo la descripción completa
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

// Añadir al carrito: guarda {id, cantidad} en la sesión del usuario.
// Si el producto ya existe, acumula la cantidad en lugar de duplicar.
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
        logger.debug(`Carrito: +${cantidad} del producto #${id} → total ${req.session.total_carrito}`);
    }

    res.redirect(`/producto/${id}`);
});

// Quitar del carrito: elimina el producto de la sesión y recalcula el total
router.get('/quitar-del-carrito/:id', (req, res) => {
    const id = Number(req.params.id);

    if (req.session.carrito) {
        req.session.carrito       = req.session.carrito.filter(i => i.id !== id);
        req.session.total_carrito = req.session.carrito.reduce((acc, i) => acc + i.cantidad, 0);
        logger.debug(`Carrito: eliminado producto #${id} → total ${req.session.total_carrito}`);
    }

    // Volver a la página anterior (o a la portada si no hay referrer)
    res.redirect(req.get('Referrer') || '/');
});

export default router;
