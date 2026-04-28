// routes/api.ts — API REST para productos
import express from 'express';
import prisma from '../prisma/prisma.client.ts';
import logger from '../logger.ts';

const router = express.Router();

// GET /api/productos — lista con paginacion (?desde, ?hasta, ?ordenacion)
router.get('/api/productos', async (req, res) => {
    const desde      = Math.max(0,   parseInt(req.query.desde as string)  || 0);
    const hasta      = Math.min(100, parseInt(req.query.hasta as string) || 20);
    const ordenacion = req.query.ordenacion === 'desc' ? 'desc' as const : 'asc' as const;

    try {
        const [productos, total] = await Promise.all([
            prisma.producto.findMany({ skip: desde, take: hasta, orderBy: { id: ordenacion } }),
            prisma.producto.count()
        ]);
        res.json({ total, desde, hasta, ordenacion, productos });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/productos/random — devuelve un producto aleatorio
router.get('/api/productos/random', async (req, res) => {
    try {
        const total = await prisma.producto.count();
        if (total === 0) return res.status(404).json({ error: 'No hay productos' });
        
        const random_index = Math.floor(Math.random() * total);
        const producto = await prisma.producto.findFirst({
            skip: random_index
        });
        res.json(producto);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/productos/:id — un producto
router.get('/api/productos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'id debe ser numero' });

    try {
        const producto = await prisma.producto.findUnique({ where: { id } });
        if (!producto) return res.status(404).json({ error: 'No encontrado' });
        res.json(producto);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/productos — crear producto (body JSON)
router.post('/api/productos', async (req, res) => {
    const { titulo, descripcion, precio, imagen } = req.body;
    if (!titulo || !descripcion || precio === undefined || !imagen) {
        return res.status(400).json({ error: 'Faltan campos: titulo, descripcion, precio, imagen' });
    }
    try {
        const producto = await prisma.producto.create({
            data: { titulo, descripcion, precio: parseFloat(precio), imagen } as any
        });
        res.status(201).json(producto);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/productos/:id — actualizar campos
router.put('/api/productos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'id debe ser numero' });

    const datos: Record<string, unknown> = {};
    if (req.body.titulo      !== undefined) datos['titulo']      = req.body.titulo;
    if (req.body.descripcion !== undefined) datos['descripcion'] = req.body.descripcion;
    if (req.body.precio      !== undefined) datos['precio']      = parseFloat(req.body.precio);

    if (Object.keys(datos).length === 0) {
        return res.status(400).json({ error: 'Indica al menos un campo' });
    }

    try {
        const producto = await prisma.producto.update({ where: { id }, data: datos as any });
        res.json(producto);
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'No encontrado' });
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/productos/:id — eliminar producto
router.delete('/api/productos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'id debe ser numero' });

    try {
        await prisma.producto.delete({ where: { id } });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'No encontrado' });
        res.status(500).json({ error: error.message });
    }
});

export default router;
