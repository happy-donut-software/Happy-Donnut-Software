FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Puerto estándar de Vite
EXPOSE 5173

# Vite necesita --host para verse desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]