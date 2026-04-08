/**
 * test/api.test.ts — Tests de integración de la API REST (Tarea 7)
 *
 * Usa el módulo nativo `node:test` de Node.js 24.
 * Arranca la app en un puerto libre, ejecuta llamadas HTTP reales
 * contra todos los endpoints de /api/productos y verifica las respuestas.
 *
 * Ejecutar: npm test
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import app from '../app.ts';
import prisma from '../prisma/prisma.client.ts';

let server: Server;
let BASE: string;
let productoTestId: number; // ID del producto creado en el test POST (para reutilizar en los siguientes)

// ── Setup y teardown ──────────────────────────────────────────────────

before(async () => {
    // app.listen(0) pide al SO un puerto libre → evita conflictos
    await new Promise<void>(resolve => { server = app.listen(0, resolve); });
    const { port } = server.address() as { port: number };
    BASE = `http://localhost:${port}`;
});

after(async () => {
    await new Promise<void>(resolve => server.close(() => resolve()));
    await prisma.$disconnect();
});

// ── Tests ─────────────────────────────────────────────────────────────

describe('GET /api/productos', () => {
    it('devuelve 200 y la estructura esperada', async () => {
        const r = await fetch(`${BASE}/api/productos`);
        assert.equal(r.status, 200);
        const data = await r.json() as Record<string, unknown>;
        assert.ok('total'     in data, 'falta campo total');
        assert.ok('productos' in data, 'falta campo productos');
        assert.ok(Array.isArray(data.productos), 'productos debe ser array');
    });

    it('respeta la paginación (?hasta=3)', async () => {
        const r = await fetch(`${BASE}/api/productos?desde=0&hasta=3`);
        assert.equal(r.status, 200);
        const data = await r.json() as Record<string, unknown>;
        assert.ok((data.productos as unknown[]).length <= 3);
    });
});

describe('POST /api/productos', () => {
    it('crea un producto y devuelve 201 con el objeto creado', async () => {
        const r = await fetch(`${BASE}/api/productos`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo:      'Producto de prueba CI',
                descripcion: 'Creado automaticamente por test de integracion',
                precio:      9.99,
                imagen:      'test_ci.jpg'
            })
        });
        assert.equal(r.status, 201);
        const p = await r.json() as Record<string, unknown>;
        assert.ok(p.id, 'el producto creado debe tener id');
        productoTestId = p.id as number;
    });

    it('devuelve 400 si faltan campos obligatorios', async () => {
        const r = await fetch(`${BASE}/api/productos`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ título: 'Incompleto' }) // faltan descripción, precio, imagen
        });
        assert.equal(r.status, 400);
    });
});

describe('GET /api/productos/:id', () => {
    it('devuelve el producto creado en el POST anterior', async () => {
        const r = await fetch(`${BASE}/api/productos/${productoTestId}`);
        assert.equal(r.status, 200);
        const p = await r.json() as Record<string, unknown>;
        assert.equal((p.título as string).trim(), 'Producto de prueba CI');
    });

    it('devuelve 404 para un id que no existe', async () => {
        const r = await fetch(`${BASE}/api/productos/999999`);
        assert.equal(r.status, 404);
    });

    it('devuelve 400 para un id no numérico', async () => {
        const r = await fetch(`${BASE}/api/productos/abc`);
        assert.equal(r.status, 400);
    });
});

describe('PUT /api/productos/:id', () => {
    it('actualiza el precio y devuelve 200', async () => {
        const r = await fetch(`${BASE}/api/productos/${productoTestId}`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precio: 14.99 })
        });
        assert.equal(r.status, 200);
        const p = await r.json() as Record<string, unknown>;
        assert.equal(Number(p.precio), 14.99);
    });

    it('devuelve 400 si el body está vacío', async () => {
        const r = await fetch(`${BASE}/api/productos/${productoTestId}`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        assert.equal(r.status, 400);
    });
});

describe('DELETE /api/productos/:id', () => {
    it('elimina el producto y devuelve 204 sin cuerpo', async () => {
        const r = await fetch(`${BASE}/api/productos/${productoTestId}`, { method: 'DELETE' });
        assert.equal(r.status, 204);
    });

    it('devuelve 404 al intentar eliminar un id ya borrado', async () => {
        const r = await fetch(`${BASE}/api/productos/${productoTestId}`, { method: 'DELETE' });
        assert.equal(r.status, 404);
    });
});
