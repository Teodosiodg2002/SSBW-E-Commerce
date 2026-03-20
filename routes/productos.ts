import express from "express";
import prisma from "../prisma/prisma.client.ts";

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
        console.error("~ error:", error.message);
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
        res.render('portada.njk', { cards, busqueda });
    } catch (error: any) {
        console.error("~ error:", error.message);
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
        console.error("~ error:", error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});

export default router;
