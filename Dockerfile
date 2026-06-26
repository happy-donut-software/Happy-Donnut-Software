# 1. Definir la imagen base con Node.js instalado
FROM node:19-alpine
# 2. Definir el directorio de trabajo dentro del contenedor
WORKDIR /app
# 3. Copiar archivos de dependencias y el código fuente
COPY src/package.json .
COPY src ./src
# 4. Instalar las dependencias necesarias
RUN npm install
# 5. Comando para iniciar la aplicación
CMD ["node", "src/server.js"]