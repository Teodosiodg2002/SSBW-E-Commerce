import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// Adaptar usando connectionString directamente (evita conflicto de tipos @types/pg vs adapter-pg interno)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

// Cliente Prisma base
const _prisma = new PrismaClient({ adapter });

// Extender con métodos de autenticación en el modelo Usuario
const prisma = _prisma.$extends({
    model: {
        usuario: {
            // Crea un usuario hasheando automáticamente la contraseña
            async registrar(data: { email: string; nombre: string; contraseña: string; admin?: boolean }) {
                const hash = await bcrypt.hash(data.contraseña, SALT_ROUNDS);
                return _prisma.usuario.create({
                    data: { ...data, contraseña: hash }
                });
            },

            // Verifica credenciales → devuelve el usuario o lanza un Error
            async autentifica(email: string, contraseña: string) {
                const usuario = await _prisma.usuario.findUnique({ where: { email } });
                if (!usuario) {
                    throw new Error('Credenciales incorrectas');
                }
                const ok = await bcrypt.compare(contraseña, usuario.contraseña);
                if (!ok) {
                    throw new Error('Credenciales incorrectas');
                }
                return usuario;
            }
        }
    }
});

export default prisma;
