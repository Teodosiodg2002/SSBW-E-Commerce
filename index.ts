import express from 'express';
import nunjucks from 'nunjucks';
import ProductosRouter from "./routes/productos.ts";

const app = express();
const serverPort = process.env.PORT || 3000;

// Configuración Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
});

// Middleware para servir imágenes locales como ficheros estáticos
app.use('/public/imagenes', express.static('imagenes'));

// Router de productos (portada, detalle, búsqueda)
app.use('/', ProductosRouter);

app.listen(serverPort, () => {
    console.log(`[Express] Servidor en http://localhost:${serverPort}`);
});
