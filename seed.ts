import prisma from "./prisma/prisma.client.ts";
import productosJson from "./productos.json" with { type: 'json' };

type Producto = {
  título: string;
  descripción: string;
  texto_precio: string;
  imagen: string;
};

await guardar_en_db(productosJson as Producto[]);

// Consulta de verificación: productos cuyo título empiece por 'Lámina', ordenados por precio
const laminas = await prisma.producto.findMany({
  where: { título: { startsWith: 'Lámina' } },
  orderBy: { precio: 'asc' },
  select: { título: true, precio: true }
});
console.log(`\n[Seed] Verificación: Láminas ordenadas por precio:`);
laminas.forEach((p: { título: string; precio: any }) => console.log(` - ${p.título.trim()} -> ${p.precio}€`));

await prisma.$disconnect();

async function guardar_en_db(productos: Producto[]): Promise<void> {
  console.log(`[Seed] Borrando datos previos...`);
  await prisma.producto.deleteMany();

  console.log(`[Seed] Insertando ${productos.length} productos...`);
  for (const producto of productos) {
    const título = producto.título;
    const descripción = producto.descripción;
    const imagen = producto.imagen;
    const precio = Number(producto.texto_precio.slice(0, -2).replace(/,/, '.'));

    try {
      const prod = await prisma.producto.create({
        data: { título, descripción, imagen, precio }
      });
      console.log(`[Seed] Creado: ${prod.id} - ${prod.título.trim()}`);
    } catch (error: any) {
      console.error(`[Seed] Error en ${título}:`, error.message);
    }
  }
  console.log(`[Seed] ¡Completado!`);
}
