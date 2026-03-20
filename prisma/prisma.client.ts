import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Configurar el adaptador con la URL de conexión
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// 2. Inicializar Prisma con el adaptador
const prisma = new PrismaClient({ adapter });

// 3. Exportar la instancia global de Prisma
export default prisma;
