FROM mcr.microsoft.com/playwright:v1.48.0-jammy
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
