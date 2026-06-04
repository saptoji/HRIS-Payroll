# HRIS Payroll

Sistem HRIS & Payroll berbasis NestJS + Next.js + PostgreSQL + Redis.

## ⚠️ Setup Pertama Kali

1. **Copy env file** dan isi secrets yang kuat:
   ```bash
   cp .env.example .env
   ```

2. **Generate JWT secrets**:
   ```bash
   openssl rand -base64 64   # untuk JWT_SECRET dan REFRESH_JWT_SECRET
   openssl rand -base64 32   # untuk POSTGRES_PASSWORD dan REDIS_PASSWORD
   ```

3. **Start stack** (hanya database dulu untuk development):
   ```bash
   docker compose up -d postgres redis
   ```

4. **Setup backend** (lihat `backend/README.md`):
   ```bash
   cd backend
   npm install
   npm run build
   ./start-backend.sh
   ```

5. **Setup frontend** (lihat `frontend/README.md`):
   ```bash
   cd frontend
   npm install
   npm run build
   ./start-frontend.sh
   ```

## Struktur

- `backend/` — NestJS API (TypeScript, port 4000)
- `frontend/` — Next.js 14 (port 3000)
- `docker-compose.yml` — Postgres + Redis + full stack
- `seed-demo.py` — Script untuk seed data demo ke API
- `.env.example` — Template environment variables

## Security Notes

- **JANGAN commit `.env`** — sudah masuk `.gitignore`
- Ganti semua `change-me-*` di `.env` dengan secrets random
- Untuk production, port database **jangan** di-expose ke public (bind ke `127.0.0.1`)
- Lihat `docker-compose.yml` untuk konfigurasi port yang aman
