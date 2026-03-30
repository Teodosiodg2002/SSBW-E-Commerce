import prisma from "./prisma/prisma.client.ts";
import logger from "./logger.ts";

// Usuarios de prueba a registrar
const usuarios = [
    { email: 'admin@prado.es',   nombre: 'Administrador', contraseña: 'Admin1234!', admin: true  },
    { email: 'usuario@prado.es', nombre: 'Usuario Demo',  contraseña: 'Demo1234!',  admin: false },
];

// Limpiar usuarios previos para evitar duplicados en ejecuciones repetidas
await prisma.usuario.deleteMany();

for (const u of usuarios) {
    try {
        const creado = await prisma.usuario.registrar(u);
        logger.info(`Registrado: ${creado.email} (admin=${creado.admin})`);
    } catch (error: any) {
        logger.error(`Error al registrar ${u.email}: ${error.message}`);
    }
}

// Verificar que la autenticación funciona
logger.info('\n--- Comprobando autenticación ---');
try {
    const u = await prisma.usuario.autentifica('admin@prado.es', 'Admin1234!');
    logger.info(`✓ Autenticación OK: ${u.nombre}`);
} catch (error: any) {
    logger.error(`✗ Autenticación FALLÓ: ${error.message}`);
}

try {
    await prisma.usuario.autentifica('admin@prado.es', 'clave_incorrecta');
    logger.error('✗ No debería llegar aquí');
} catch (error: any) {
    logger.info(`✓ Contraseña incorrecta correctamente rechazada: ${error.message}`);
}

await prisma.$disconnect();
