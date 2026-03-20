import express from "express";
import prisma from "../prisma/prisma.client.ts";
import logger from "../logger.ts";

const router = express.Router();

// Portada: lista de productos sin descripción
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

// Búsqueda por texto en título y descripción
router.get('/buscar', async (req, res) => {
    const busqueda = (req.query.busqueda as string) || '';
    try {
        const cards = await prisma.producto.findMany({
            where: {
                OR: [
                    { título: { contains: busqueda, mode: 'insensitive' } },
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

// Detalle de producto por ID
router.get('/producto/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const producto = await prisma.producto.findUnique({ where: { id } });
        if (!producto) {
            res.status(404).send('Producto no encontrado');
            return;
        }
        res.render('detalle.njk', { producto });
    } catch (error: any) {
        logger.error(`Detalle id=${id}: ${error.message}`);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// POST: añadir al carrito (desde el formulario de detalle)
router.post('/al-carrito/:id', async (req, res) => {
    const id = Number(req.params.id);
    const cantidad = Number(req.body.cantidad);
    logger.debug(`Al carrito: producto #${id}, cantidad=${cantidad}`);

    if (cantidad > 0) {
        if (req.session.carrito !== undefined) {
            // Si el producto ya está en el carrito, incrementar cantidad
            const existente = req.session.carrito.find(item => item.id === id);
            if (existente) {
                existente.cantidad += cantidad;
            } else {
                req.session.carrito.push({ id, cantidad });
            }
        } else {
            req.session.carrito = [{ id, cantidad }];
        }

        // Calcular total de unidades
        const total_carrito = req.session.carrito.reduce((acc, item) => acc + item.cantidad, 0);
        req.session.total_carrito = total_carrito;
        res.locals.total_carrito = total_carrito;
        logger.debug(`Carrito actualizado: ${total_carrito} unidad(es) en total`);
    }

    // Volver a la página de detalle del mismo producto
    res.redirect(`/producto/${id}`);
});

export default router;
