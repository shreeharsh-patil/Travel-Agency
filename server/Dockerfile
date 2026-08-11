FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 4000

# Apply the schema (idempotent) then start the API.
CMD ["sh", "-c", "node src/scripts/migrate.js && node src/index.js"]
