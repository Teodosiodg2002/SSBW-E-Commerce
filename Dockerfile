// Dockerfile — Imagen de la aplicación Tienda Prado
//
// Node.js 24 soporta TypeScript de forma nativa (type stripping),
// por lo que no necesitamos compilar a JavaScript: ejecutamos index.ts directamente.

# Imagen base ligera
FROM node:24-alpine

WORKDIR /app

# Copiar manifiestos e instalar dependencias primero
# (se cachea si package.json no cambia, acelerando builds sucesivos)
COPY package*.json ./
COPY prisma/        ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Copiar el resto del código fuente
COPY . .

EXPOSE 3000

# Node 24 ejecuta .ts de forma nativa
CMD ["node", "index.ts"]
