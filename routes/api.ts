// routes/api.ts — API REST para productos
import express from 'express';
import * as ApiController from '../controllers/api.controller.ts';

const router = express.Router();

router.get('/productos', ApiController.getProductos);
router.get('/productos/random', ApiController.getProductoRandom);
router.get('/productos/:id', ApiController.getProductoById);
router.post('/productos', ApiController.createProducto);
router.put('/productos/:id', ApiController.updateProducto);
router.delete('/productos/:id', ApiController.deleteProducto);

export default router;
