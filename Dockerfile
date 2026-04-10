FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY quartz/ quartz/
COPY quartz.config.ts quartz.layout.ts tsconfig.json globals.d.ts index.d.ts ./
COPY content/ content/
RUN npx quartz build

FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ backend/
COPY --from=builder /app/public/ public/
ENV ENV=production
EXPOSE 8000
CMD ["python", "backend/server.py"]
