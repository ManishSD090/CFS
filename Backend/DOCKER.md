# Server Administrator Deployment Guide

This guide provides instructions for deploying and running the `CFS Backend` service using Docker.

---

## 1. System Requirements

* **Docker Engine** (version 20.10+ recommended)
* **Outbound Internet Access** from the host/container to reach the database (e.g. Neon, AWS RDS, Supabase) and SMTP/SMS providers.
* Access to configure environment variables.

---

## 2. Environment Configuration

1. Copy the template `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate `.env` with actual production values:
   * **`DATABASE_URL`**: PostgreSQL connection string with SSL enabled if required.
   * **`JWT_SECRET`** & **`JWT_REFRESH_SECRET`**: Strong, cryptographically random strings.
   * **`BASE_URL`**: Public URL of this backend API (e.g. `https://api.yourdomain.com`).
   * **`PORT`**: Set to `5001` (default exposed port).
   * **`NODE_ENV`**: Set to `production`.
   * **`CORS_ORIGIN`**: Allowed frontend origin URL(s) (e.g. `https://app.yourdomain.com`).
   * **`SMTP_*`** / **`TWO_FACTOR_*`** / **`FAST2SMS_*`**: Communication credentials.

> **CRITICAL SECURITY NOTE**: Never commit `.env` to Git. The `.gitignore` is preconfigured to prevent tracking `.env` and `.env.*`.

---

## 3. Storage & Upload Persistence

* **Current Implementation**: The application stores uploaded documents and photos locally in the `/app/uploads` directory.
* **Persistent Volume Requirement**: Because container filesystems are ephemeral, **you MUST mount a persistent host volume to `/app/uploads`**. Failing to do so will result in lost user files whenever the container is updated or restarted.

---

## 4. Deployment Steps

### Step 1: Build the Docker Image
Run from the `Backend` directory root:
```bash
docker build -t cfs-backend:latest .
```

### Step 2: Start the Container with Volume Mount
```bash
docker run -d \
  --name cfs-backend \
  --restart unless-stopped \
  -p 5001:5001 \
  --env-file .env \
  -v /var/lib/cfs/uploads:/app/uploads \
  cfs-backend:latest
```
*(Replace `/var/lib/cfs/uploads` with your desired persistent host directory).*

### Step 3: Apply Prisma Database Migrations
Run the migration deploy command once against the live container:
```bash
docker exec -it cfs-backend npx prisma migrate deploy
```
> **Note**: Do **NOT** use `prisma db push` in production. Always use `prisma migrate deploy`.

---

## 5. Health Check & Verification

Test that the server started and is responding:
```bash
curl -f http://localhost:5001/health
```
Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-08-29T...",
  "environment": "production"
}
```

---

## 6. Container Lifecycle & Operations

* **View live logs**:
  ```bash
  docker logs -f cfs-backend
  ```
* **Restart container**:
  ```bash
  docker restart cfs-backend
  ```
* **Stop container**:
  ```bash
  docker stop cfs-backend
  ```
* **Remove container**:
  ```bash
  docker rm cfs-backend
  ```
* **Update & Redeploy after Git Pull**:
  ```bash
  git pull origin main
  docker build -t cfs-backend:latest .
  docker stop cfs-backend && docker rm cfs-backend
  docker run -d --name cfs-backend --restart unless-stopped -p 5001:5001 --env-file .env -v /var/lib/cfs/uploads:/app/uploads cfs-backend:latest
  docker exec -it cfs-backend npx prisma migrate deploy
  ```

