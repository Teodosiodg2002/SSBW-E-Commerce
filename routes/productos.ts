import express from "express";
import prisma from "../prisma/prisma.client.ts";
import logger from "../logger.ts";
import "../types/session.d.ts";

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

// GET: eliminar producto entero del carrito
router.get('/quitar-del-carrito/:id', (req, res) => {
    const id = Number(req.params.id);
    
    if (req.session.carrito) {
        // Filtrar el elemento para removerlo del carrito
        req.session.carrito = req.session.carrito.filter(item => item.id !== id);
        
        // Recalcular total de unidades
        const total_carrito = req.session.carrito.reduce((acc, item) => acc + item.cantidad, 0);
        req.session.total_carrito = total_carrito;
        logger.debug(`Producto #${id} eliminado del carrito. Total actualizado: ${total_carrito}`);
    }

    // Redirigir a la página desde la que se hizo click (o a inicio como fallback)
    const referer = req.get('Referrer') || '/';
    res.redirect(referer);
});

export default router;
