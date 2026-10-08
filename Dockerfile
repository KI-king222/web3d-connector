# Schlankes Image (ohne Chromium): laeuft auf dem Gratis-Plan mit 512 MB RAM.
FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --omit=optional
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
