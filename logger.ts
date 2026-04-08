// logger.ts — Configuracion de Winston
import winston from 'winston';

const { combine, timestamp, printf, colorize, align, json } = winston.format;

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        // Consola: formato legible con colores
        new winston.transports.Console({
            level: 'debug',
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                align(),
                printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
            )
        }),
        // Archivo de log general
        new winston.transports.File({
            filename: './logs/info.log',
            level: 'info',
            format: combine(timestamp(), json()),
        }),
        // Archivo solo de errores
        new winston.transports.File({
            filename: './logs/error.log',
            level: 'error',
            format: combine(timestamp(), json()),
        }),
    ],
});

export default logger;
