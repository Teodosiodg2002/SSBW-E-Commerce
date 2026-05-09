import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';

describe('API Tests - Tienda Prado', () => {
  it('GET /api/productos debería devolver una lista de productos', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('productos');
    expect(Array.isArray(res.body.productos)).toBe(true);
  });

  it('GET /api/productos/random debería devolver un producto', async () => {
    const res = await request(app).get('/api/productos/random');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('título');
  });

  it('GET /api/carrito debería devolver el carrito actual', async () => {
    const res = await request(app).get('/api/carrito');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('productos');
    expect(res.body.productos).toEqual([]);
  });

  it('Ruta protegida debería denegar acceso sin JWT', async () => {
    const res = await request(app).get('/mi-cuenta');
    // En Nunjucks redirige a /login (302)
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  it('Ruta protegida debería permitir acceso con JWT válido', async () => {
    const token = jwt.sign({ usuario: 'test@prado.es', admin: false }, process.env.SECRET_KEY || 'dev-secret-prado');
    const res = await request(app)
      .get('/mi-cuenta')
      .set('Cookie', [`access_token=${token}`]);
    // Asumiendo que /mi-cuenta devuelve 200 si la plantilla se renderiza bien
    expect(res.status).toBe(200);
  });
});
