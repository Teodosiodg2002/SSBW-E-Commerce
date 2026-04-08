# Dockerfile — Imagen de la aplicacion Tienda Prado
#
# Node.js 24 soporta TypeScript de forma nativa (type stripping),
# por lo que ejecutamos index.ts directamente sin compilar a JavaScript.

FROM node:24-alpine

WORKDIR /app

# Copiar manifiestos e instalar dependencias primero.
# Al hacerlo antes que el codigo fuente, Docker cachea esta capa
# y no reinstala paquetes si solo cambia el codigo.
COPY package*.json ./
COPY prisma/        ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Copiar el resto del codigo fuente
COPY . .

EXPOSE 3000

# Node 24 ejecuta .ts de forma nativa
CMD ["node", "index.ts"]
