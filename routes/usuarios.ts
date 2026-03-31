/**
 * routes/usuarios.ts — Tarea 6: Autenticación
 *
 * Controlador de autenticación con JWT:
 *   GET  /login  → muestra el formulario de inicio de sesión
 *   POST /login  → verifica credenciales y emite un token JWT en cookie httpOnly
 *   GET  /logout → invalida la cookie y redirige a la portada
 *
 * La cookie access_token es httpOnly (no accesible desde JavaScript del navegador)
 * lo que protege contra ataques XSS. El middleware en index.ts la lee y valida
 * en cada petición.
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma.client.ts';
import logger from '../logger.ts';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY ?? 'dev-secret-prado';

// Panel de cuenta: solo accesible si el usuario está autenticado
router.get('/mi-cuenta', (req, res) => {
    if (!res.app.locals.usuario) return res.redirect('/login');
    res.render('mi-cuenta.njk');
});

// Muestra el formulario de login
router.get('/login', (req, res) => {
    res.render('login.njk', { error: false });
});

// Verifica email + contraseña, y si son correctos emite un JWT en una cookie segura
router.post('/login', async (req, res) => {
    const { email, contraseña } = req.body;
    try {
        const usuario = await prisma.usuario.autentifica(email, contraseña);

        // El token lleva el nombre y el rol del usuario; expira en 8 horas
        const token = jwt.sign(
            { usuario: usuario.nombre, admin: usuario.admin },
            SECRET_KEY,
            { expiresIn: '8h' }
        );

        // httpOnly impide que JS del navegador pueda leer la cookie (protección XSS)
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // solo HTTPS en producción
            maxAge: 8 * 60 * 60 * 1000
        }).redirect('/');

        logger.info(`Login: ${usuario.email}`);
    } catch (error: any) {
        logger.error(`Login fallido (${email}): ${error.message}`);
        res.render('login.njk', { error: true });
    }
});

// Cierra la sesión borrando la cookie y redirige a la portada
router.get('/logout', (req, res) => {
    res.clearCookie('access_token').redirect('/');
    logger.info('Logout');
});

export default router;
