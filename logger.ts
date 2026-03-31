/**
 * logger.ts — Tarea 5: Logger
 *
 * Configura Winston con tres canales de salida:
 *  - Consola (nivel debug): mensajes con colores para desarrollo.
 *  - logs/info.log  (nivel info):  registro general en producción.
 *  - logs/error.log (nivel error): solo errores críticos.
 *
 * Uso:
 *   import logger from './logger.ts'
 *   logger.debug('Mensaje de depuración')
 *   logger.info('Evento relevante')
 *   logger.error('Algo salió mal')
 */
import winston from 'winston';

const { combine, timestamp, printf, colorize, align, json } = winston.format;

const logger = winston.createLogger({
    // LOG_LEVEL en .env permite cambiar el nivel sin tocar código
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        // Consola: formato legible con colores, ideal en desarrollo
        new winston.transports.Console({
            level: 'debug',
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                align(),
                printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
            )
        }),
        // Archivo de log general (info y superiores)
        new winston.transports.File({
            filename: './logs/info.log',
            level: 'info',
            format: combine(timestamp(), json()),
        }),
        // Archivo exclusivo de errores
        new winston.transports.File({
            filename: './logs/error.log',
            level: 'error',
            format: combine(timestamp(), json()),
        }),
    ],
});

export default logger;
