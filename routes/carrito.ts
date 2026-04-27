// routes/carrito.ts — API ad hoc para gestión del carrito vía AJAX
import express from 'express';
import prisma from '../prisma/prisma.client.ts';
import '../types/session.d.ts';

const router = express.Router();

/**
 * GET /api/carrito
 * Devuelve el contenido completo del carrito con detalles de productos.
 */
router.get('/api/carrito', async (req, res) => {
    const carrito_sesion = req.session.carrito ?? [];
    
    if (carrito_sesion.length === 0) {
        return res.json({ productos: [], subtotal: 0, total_items: 0 });
    }

    try {
        const ids = carrito_sesion.map(i => i.id);
        const db_productos = await prisma.producto.findMany({ 
            where: { id: { in: ids } } 
        });

        const productos = carrito_sesion.map(item => {
            const p = db_productos.find(x => x.id === item.id);
            const precio = Number(p?.precio ?? 0);
            return {
                id: item.id,
                titulo: p?.título?.trim() ?? 'Producto',
                imagen: p?.imagen ?? '',
                precio: precio,
                precio_str: precio.toFixed(2).replace('.', ','),
                cantidad: item.cantidad,
                total_linea: (precio * item.cantidad).toFixed(2).replace('.', ',')
            };
        });

        const subtotal = carrito_sesion.reduce((acc, item) => {
            const p = db_productos.find(x => x.id === item.id);
            return acc + Number(p?.precio ?? 0) * item.cantidad;
        }, 0);

        const total_items = req.session.total_carrito ?? 0;

        res.json({ 
            productos, 
            subtotal: subtotal.toFixed(2).replace('.', ','), 
            total_items 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/carrito/:id
 * Elimina un producto del carrito y devuelve el nuevo estado.
 */
router.delete('/api/carrito/:id', (req, res) => {
    const id = Number(req.params.id);
    if (req.session.carrito) {
        req.session.carrito = req.session.carrito.filter(i => i.id !== id);
        req.session.total_carrito = req.session.carrito.reduce((acc, i) => acc + i.cantidad, 0);
    }
    res.json({ success: true, total_items: req.session.total_carrito });
});

export default router;
