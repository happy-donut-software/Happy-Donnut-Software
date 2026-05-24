FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Instalamos la librería que pediste para este proyecto
RUN npm install lucide-react

COPY . .

# Puerto estándar de Create React App
EXPOSE 3000

# Variables para que el hot-reload funcione bien en Docker
ENV CHOKIDAR_USEPOLLING=true
ENV WDS_SOCKET_PORT=0

CMD ["npm", "start"]