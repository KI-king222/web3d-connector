FROM mcr.microsoft.com/playwright:v1.48.0-jammy
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
RUN npx playwright install chromium
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
