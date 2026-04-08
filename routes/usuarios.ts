// routes/usuarios.ts — Autenticacion (login/logout/mi-cuenta)
import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma.client.ts';
import logger from '../logger.ts';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY ?? 'dev-secret-prado';

// Panel de cuenta (redirige a login si no hay sesion)
router.get('/mi-cuenta', (req, res) => {
    if (!res.app.locals.usuario) return res.redirect('/login');
    res.render('mi-cuenta.njk');
});

// Formulario de login
router.get('/login', (req, res) => {
    res.render('login.njk', { error: false });
});

// Verificar credenciales y crear cookie JWT
router.post('/login', async (req, res) => {
    const { email, contraseña } = req.body;
    try {
        const usuario = await prisma.usuario.autentifica(email, contraseña);
        const token = jwt.sign(
            { usuario: usuario.nombre, admin: usuario.admin },
            SECRET_KEY,
            { expiresIn: '8h' }
        );
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 8 * 60 * 60 * 1000
        }).redirect('/');
        logger.info(`Login: ${usuario.email}`);
    } catch (error: any) {
        logger.error(`Login fallido (${email}): ${error.message}`);
        res.render('login.njk', { error: true });
    }
});

// Cerrar sesion
router.get('/logout', (req, res) => {
    res.clearCookie('access_token').redirect('/');
    logger.info('Logout');
});

export default router;
