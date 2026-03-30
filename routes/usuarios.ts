import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma.client.ts';
import logger from '../logger.ts';

const router = express.Router();

// GET /login → muestra el formulario
router.get('/login', (req, res) => {
    res.render('login.njk', { error: false });
});

// POST /login → verifica credenciales y emite cookie JWT
router.post('/login', async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const usuario = await prisma.usuario.autentifica(email, contraseña);
        const secret = process.env.SECRET_KEY ?? 'dev-secret-prado';
        const token = jwt.sign(
            { usuario: usuario.nombre, admin: usuario.admin },
            secret,
            { expiresIn: '8h' }
        );

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 8 * 60 * 60 * 1000  // 8 horas en ms
        }).redirect('/');

        logger.info(`Login correcto: ${usuario.email}`);
    } catch (error: any) {
        logger.error(`Login fallido para ${email}: ${error.message}`);
        res.render('login.njk', { error: true });
    }
});

// GET /logout → borra la cookie y redirige a la portada
router.get('/logout', (req, res) => {
    res.clearCookie('access_token').redirect('/');
    logger.info('Sesión cerrada');
});

export default router;
