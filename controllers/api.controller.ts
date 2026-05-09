import { Request, Response } from 'express';
import prisma from '../prisma/prisma.client.ts';

export const getProductos = async (req: Request, res: Response) => {
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
};

export const getProductoRandom = async (req: Request, res: Response) => {
    try {
        const total = await prisma.producto.count();
        if (total === 0) return res.status(404).json({ error: 'No hay productos' });
        const random_index = Math.floor(Math.random() * total);
        const prod = await prisma.producto.findFirst({ skip: random_index });
        res.json(prod);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProductoById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'id debe ser numero' });

    try {
        const prod = await prisma.producto.findUnique({ where: { id } });
        if (!prod) return res.status(404).json({ error: 'No encontrado' });
        res.json(prod);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createProducto = async (req: Request, res: Response) => {
    const { titulo, descripcion, precio, imagen } = req.body;
    if (!titulo || !descripcion || precio === undefined || !imagen) {
        return res.status(400).json({ error: 'Faltan campos: titulo, descripcion, precio, imagen' });
    }

    try {
        const prod = await prisma.producto.create({ data: { título: titulo, descripción: descripcion, precio, imagen } });
        res.status(201).json(prod);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProducto = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'id debe ser numero' });

    try {
        const prod = await prisma.producto.update({
            where: { id },
            data: req.body
        });
        res.json(prod);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProducto = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'id debe ser numero' });

    try {
        await prisma.producto.delete({ where: { id } });
        res.status(204).end();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
