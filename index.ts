/**
 * index.ts — Punto de entrada del servidor (Tarea 1)
 *
 * Importa la app Express configurada en app.ts e inicia el servidor.
 * Separar la configuración del arranque permite importar `app` en los
 * tests sin que se abra ningún puerto.
 */
import app from './app.ts';
import logger from './logger.ts';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Servidor iniciado en http://localhost:${PORT}`);
});
