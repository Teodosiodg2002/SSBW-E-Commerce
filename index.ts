import express from 'express';
import nunjucks from 'nunjucks';

const app = express();
const serverPort = process.env.PORT || 3000;

// Configuración Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
});

app.get('/', (request, response) => {
    response.render('index.njk', { pageTitle: 'Tienda Prado - SSBW' });
});

app.listen(serverPort, () => {
    console.log(`[Express] Servidor iniciado correctamente en http://localhost:${serverPort}`);
});
