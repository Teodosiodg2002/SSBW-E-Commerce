/**
 * routes/api.ts — Tarea 7: API RESTful
 *
 * API REST para el recurso Producto. Todos los endpoints devuelven JSON.
 *
 * GET    /api/productos              → lista (con paginación y ordenación)
 * GET    /api/productos/:id          → un producto
 * POST   /api/productos              → crear producto
 * PUT    /api/productos/:id          → actualizar título/descripción/precio
 * DELETE /api/productos/:id          → eliminar producto
 *
 * Paginación y ordenación en GET /api/productos:
 *   ?desde=1          offset (por defecto 0)
 *   ?hasta=20         límite de resultados (por defecto 20, máx 100)
 *   ?ordenacion=asc|desc  orden por id (por defecto asc)
 */
import express, { Request, Response } from 'express';
import prisma from '../prisma/prisma.client.ts';
import logger from '../logger.ts';

const router = express.Router();

// ── GET /api/productos ────────────────────────────────────────────────
// Lista todos los productos con paginación y ordenación opcionales.
router.get('/api/productos', async (req: Request, res: Response) => {
    const desde     = Math.max(0, parseInt(req.query.desde as string)  || 0);
    const hasta     = Math.min(100, parseInt(req.query.hasta as string) || 20);
    const ordenacion = req.query.ordenacion === 'desc' ? 'desc' : 'asc';

    try {
        const [productos, total] = await Promise.all([
            prisma.producto.findMany({
                skip:    desde,
                take:    hasta,
                orderBy: { id: ordenacion }
            }),
            prisma.producto.count()
        ]);
        logger.debug(`API GET /api/productos desde=${desde} hasta=${hasta} orden=${ordenacion} → ${productos.length}/${total}`);
        res.json({ total, desde, hasta, ordenacion, productos });
    } catch (error: any) {
        logger.error(`API GET /api/productos: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// ── GET /api/productos/:id ────────────────────────────────────────────
// Devuelve un único producto por su ID numérico.
router.get('/api/productos/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'El id debe ser un número entero' });

    try {
        const producto = await prisma.producto.findUnique({ where: { id } });
        if (!producto) return res.status(404).json({ error: `Producto ${id} no encontrado` });
        res.json(producto);
    } catch (error: any) {
        logger.error(`API GET /api/productos/${id}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// ── POST /api/productos ───────────────────────────────────────────────
// Crea un nuevo producto. Body JSON con: título, descripción, precio, imagen.
router.post('/api/productos', async (req: Request, res: Response) => {
    const { título, descripción, precio, imagen } = req.body;
    if (!título || !descripción || precio === undefined || !imagen) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: título, descripción, precio, imagen' });
    }

    try {
        const producto = await prisma.producto.create({
            data: { título, descripción, precio: parseFloat(precio), imagen }
        });
        logger.info(`API POST /api/productos → creado id=${producto.id}`);
        res.status(201).json(producto);
    } catch (error: any) {
        logger.error(`API POST /api/productos: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// ── PUT /api/productos/:id ────────────────────────────────────────────
// Actualiza título, descripción y/o precio de un producto existente.
// Solo se modifican los campos presentes en el body.
router.put('/api/productos/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'El id debe ser un número entero' });

    const { título, descripción, precio } = req.body;
    const datos: any = {};
    if (título      !== undefined) datos.título      = título;
    if (descripción !== undefined) datos.descripción = descripción;
    if (precio      !== undefined) datos.precio      = parseFloat(precio);

    if (Object.keys(datos).length === 0) {
        return res.status(400).json({ error: 'Indica al menos un campo a actualizar: título, descripción o precio' });
    }

    try {
        const producto = await prisma.producto.update({ where: { id }, data: datos });
        logger.info(`API PUT /api/productos/${id}: actualizados ${Object.keys(datos).join(', ')}`);
        res.json(producto);
    } catch (error: any) {
        // P2025 = registro no encontrado en Prisma
        if (error.code === 'P2025') return res.status(404).json({ error: `Producto ${id} no encontrado` });
        logger.error(`API PUT /api/productos/${id}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// ── DELETE /api/productos/:id ─────────────────────────────────────────
// Elimina un producto por su ID. Devuelve 204 sin cuerpo si tiene éxito.
router.delete('/api/productos/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'El id debe ser un número entero' });

    try {
        await prisma.producto.delete({ where: { id } });
        logger.info(`API DELETE /api/productos/${id}: eliminado`);
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: `Producto ${id} no encontrado` });
        logger.error(`API DELETE /api/productos/${id}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

export default router;
