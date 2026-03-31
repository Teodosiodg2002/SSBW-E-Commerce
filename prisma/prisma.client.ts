/**
 * prisma/prisma.client.ts — Tarea 3 (BD) + Tarea 6 (Auth)
 *
 * Exporta un cliente de Prisma 7 listo para usar con PostgreSQL,
 * extendido con métodos de autenticación sobre el modelo Usuario:
 *
 *   prisma.usuario.registrar(data)      → hashea contraseña y crea el usuario
 *   prisma.usuario.autentifica(email, pass) → verifica credenciales o lanza Error
 */
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

// Número de rondas de bcrypt: a mayor valor, más seguro pero más lento
const SALT_ROUNDS = 12;

// Adaptador de PostgreSQL: conecta Prisma con pg directamente por la URL de .env
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

// Cliente base de Prisma (sin extensiones)
const _prisma = new PrismaClient({ adapter });

// Se extiende el cliente para añadir métodos de dominio al modelo Usuario
const prisma = _prisma.$extends({
    model: {
        usuario: {
            // Hashea la contraseña antes de guardar el usuario en la BD
            async registrar(data: { email: string; nombre: string; contraseña: string; admin?: boolean }) {
                const hash = await bcrypt.hash(data.contraseña, SALT_ROUNDS);
                return _prisma.usuario.create({
                    data: { ...data, contraseña: hash }
                });
            },

            // Busca el usuario por email y compara el hash.
            // Lanza Error siempre con el mismo mensaje para no filtrar si el email existe.
            async autentifica(email: string, contraseña: string) {
                const usuario = await _prisma.usuario.findUnique({ where: { email } });
                if (!usuario) throw new Error('Credenciales incorrectas');

                const ok = await bcrypt.compare(contraseña, usuario.contraseña);
                if (!ok) throw new Error('Credenciales incorrectas');

                return usuario;
            }
        }
    }
});

export default prisma;
