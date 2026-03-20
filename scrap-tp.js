import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const nombre_archivo_desde = (titulo) => titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';

async function main() {
    console.log("[Scraper] Iniciando Playwright (modo headless)...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    try {
        console.log("[Scraper] Cargando catálogo completo de tiendaprado...");
        await page.goto('https://tiendaprado.com/es/385-impresiones?resultsPerPage=999', { timeout: 30000 });
    } catch (error) {
        console.error("Error al cargar la página principal:", error);
        process.exit(1);
    }

    page.once('load', () => console.log('Página cargada'));
    await esperar(3000);
    
    const locators_paginas = page.locator('.thumbnail-container > a');
    const locators = await locators_paginas.all();
    
    console.log(`[Scraper] Se encontraron ${locators.length} enlaces a productos.`);
    const lista_paginas = [];
    for (const loc of locators) {
        const href = await loc.getAttribute('href');
        if (href && !lista_paginas.includes(href)) {
            lista_paginas.push(href);
        }
    }

    const imgDir = path.join(__dirname, 'imagenes');
    await fs.mkdir(imgDir, { recursive: true });

    const productos = [];
    console.log(`[Scraper] Extrayendo datos de ${lista_paginas.length} productos...`);

    // Iterando por cada página y aplicando retardo como comportamiento humano
    for (let i = 0; i < lista_paginas.length; i++) {
        const url = lista_paginas[i];
        console.log(`[Scraper] (${i+1}/${lista_paginas.length}) -> ${url}`);
        
        try {
            await page.goto(url, { timeout: 30000 });
            await esperar(1500); // Retardo antes de parsear
            
            const tituloLocator = page.locator('h1');
            const titulo = await tituloLocator.first().innerText();
            
            const descLocator = page.locator('#product-description, .product-description');
            const descripcion = await descLocator.first().innerText().catch(() => "");
            
            const precioLocator = page.locator('.current-price');
            const texto_precio = await precioLocator.first().innerText().catch(() => "");
            
            const imgLocator = page.locator('.js-qv-product-cover, #bigpic, .product-cover img');
            let imgUrl = await imgLocator.first().getAttribute('src').catch(() => null);
            
            let imagenFileName = "";
            if (titulo) {
                imagenFileName = nombre_archivo_desde(titulo);
                if (imgUrl) {
                    if (!imgUrl.startsWith('http')) {
                        imgUrl = new URL(imgUrl, url).href;
                    }
                    const imageRes = await page.request.get(imgUrl);
                    if (imageRes.ok()) {
                        const imageBuffer = await imageRes.body();
                        await fs.writeFile(path.join(imgDir, imagenFileName), imageBuffer);
                    }
                }
            }

            productos.push({
                "título": titulo,
                "descripción": descripcion.trim(),
                "texto_precio": texto_precio.trim(),
                "imagen": imagenFileName
            });

        } catch (e) {
            console.error(`[Scraper] Fallo al extraer ${url}:`, e.message);
        }
    }

    await fs.writeFile(path.join(__dirname, 'productos.json'), JSON.stringify(productos, null, 2), "utf-8");
    console.log("[Scraper] ¡Proceso completado con éxito! Archivos generados.");

    // Eliminar archivo debug temporal (regla: borrar código/ficheros inútiles)
    await fs.unlink(path.join(__dirname, 'debug_product.html')).catch(() => {});

    await browser.close();
}

main().catch(console.error);
