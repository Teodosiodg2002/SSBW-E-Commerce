// routes/productos.ts — Rutas de la tienda (Nunjucks)
import express from 'express';
import * as ProductosController from '../controllers/productos.controller.ts';

const router = express.Router();

router.get('/', ProductosController.getPortada);
router.get('/buscar', ProductosController.buscarProductos);
router.get('/producto/:id', ProductosController.getProductoDetalle);
router.post('/al-carrito/:id', ProductosController.addAlCarrito);
router.get('/quitar-del-carrito/:id', ProductosController.quitarDelCarrito);

export default router;
