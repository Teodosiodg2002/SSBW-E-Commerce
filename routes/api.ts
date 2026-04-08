/**
 * routes/api.ts -- Tarea 7: API RESTful
 *
 * API REST para el recurso Producto. Todos los endpoints devuelven JSON.
 *
 * GET    /api/productos              -> lista (con paginacion y ordenacion)
 * GET    /api/productos/:id          -> un producto
 * POST   /api/productos              -> crear producto
 * PUT    /api/productos/:id          -> actualizar titulo/descripcion/precio
 * DELETE /api/productos/:id          -> eliminar producto
 *
 * Paginacion y ordenacion en GET /api/productos:
 *   ?desde=0         offset (por defecto 0)
 *   ?hasta=20        limite de resultados (por defecto 20, max 100)
 *   ?ordenacion=asc|desc  orden por id (por defecto asc)
 */
import express, { Request, Response } from 'express';
import prisma from '../prisma/prisma.client.ts';
import logger from '../logger.ts';

const router = express.Router();

// -- GET /api/productos ---------------------------------------------------
// Lista todos los productos con paginacion y ordenacion opcionales.
router.get('/api/productos', async (req: Request, res: Response) => {
    const desde      = Math.max(0,   parseInt(req.query.desde      as string) || 0);
    const hasta      = Math.min(100, parseInt(req.query.hasta       as string) || 20);
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
        logger.debug(`API GET /api/productos desde=${desde} hasta=${hasta} orden=${ordenacion} -> ${productos.length}/${total}`);
        res.json({ total, desde, hasta, ordenacion, productos });
    } catch (error: any) {
        logger.error(`API GET /api/productos: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// -- GET /api/productos/:id -----------------------------------------------
// Devuelve un unico producto por su ID numerico.
router.get('/api/productos/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'El id debe ser un numero entero' });

    try {
        const producto = await prisma.producto.findUnique({ where: { id } });
        if (!producto) return res.status(404).json({ error: `Producto ${id} no encontrado` });
        res.json(producto);
    } catch (error: any) {
        logger.error(`API GET /api/productos/${id}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// -- POST /api/productos --------------------------------------------------
// Crea un nuevo producto. Body JSON con: titulo, descripcion, precio, imagen.
router.post('/api/productos', async (req: Request, res: Response) => {
    const titulo      = req.body.titulo      as string;
    const descripcion = req.body.descripcion as string;
    const { precio, imagen } = req.body;

    if (!titulo || !descripcion || precio === undefined || !imagen) {
        return res.status(400).json({ error: 'Faltan campos: titulo, descripcion, precio, imagen' });
    }

    try {
        const producto = await prisma.producto.create({
            // Los campos de la BD usan caracteres especiales (definidos en schema.prisma)
            data: {
                titulo:      titulo,
                descripcion: descripcion,
                precio:      parseFloat(precio),
                imagen
            } as any
        });
        logger.info(`API POST /api/productos -> creado id=${producto.id}`);
        res.status(201).json(producto);
    } catch (error: any) {
        logger.error(`API POST /api/productos: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// -- PUT /api/productos/:id -----------------------------------------------
// Actualiza titulo, descripcion y/o precio. Solo modifica los campos presentes.
router.put('/api/productos/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'El id debe ser un numero entero' });

    const datos: Record<string, unknown> = {};
    if (req.body.titulo      !== undefined) datos['titulo']      = req.body.titulo;
    if (req.body.descripcion !== undefined) datos['descripcion'] = req.body.descripcion;
    if (req.body.precio      !== undefined) datos['precio']      = parseFloat(req.body.precio);

    if (Object.keys(datos).length === 0) {
        return res.status(400).json({ error: 'Indica al menos: titulo, descripcion o precio' });
    }

    try {
        const producto = await prisma.producto.update({ where: { id }, data: datos as any });
        logger.info(`API PUT /api/productos/${id}: actualizados ${Object.keys(datos).join(', ')}`);
        res.json(producto);
    } catch (error: any) {
        // P2025: registro no encontrado en Prisma
        if (error.code === 'P2025') return res.status(404).json({ error: `Producto ${id} no encontrado` });
        logger.error(`API PUT /api/productos/${id}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// -- DELETE /api/productos/:id --------------------------------------------
// Elimina un producto. Devuelve 204 sin cuerpo si tiene exito.
router.delete('/api/productos/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'El id debe ser un numero entero' });

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
