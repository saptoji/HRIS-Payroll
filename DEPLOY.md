# 🚀 Tutorial Deploy HRIS Payroll — Panduan Lengkap untuk Pemula

Tutorial ini mengajarkan cara deploy project HRIS Payroll dari nol, bahkan kalau kamu baru pertama kali deploy aplikasi web. Ikuti step by step secara berurutan.

**Target pembaca**: Developer yang baru pertama kali deploy aplikasi fullstack (NestJS + Next.js + PostgreSQL + Redis).

**Waktu yang dibutuhkan**: 30–60 menit.

**Hasil akhir**: Aplikasi HRIS Payroll jalan di VPS (atau local), bisa diakses via browser, dengan HTTPS, database aman, dan auto-restart kalau server reboot.

---

## 📑 Daftar Isi

1. [Persiapan & Prasyarat](#1-persiapan--prasyarat)
2. [Setup VPS (kalau deploy ke server)](#2-setup-vps-kalau-deploy-ke-server)
3. [Clone Repository](#3-clone-repository)
4. [Generate Secrets](#4-generate-secrets)
5. [Konfigurasi Environment](#5-konfigurasi-environment)
6. [Deploy Database & Cache](#6-deploy-database--cache)
7. [Deploy Backend (API)](#7-deploy-backend-api)
8. [Deploy Frontend (Web)](#8-deploy-frontend-web)
9. [Setup Reverse Proxy + HTTPS](#9-setup-reverse-proxy--https)
10. [Setup Systemd (Auto-start)](#10-setup-systemd-auto-start)
11. [Seed Data Demo](#11-seed-data-demo)
12. [Verifikasi & Testing](#12-verifikasi--testing)
13. [Backup & Monitoring](#13-backup--monitoring)
14. [Update Aplikasi](#14-update-aplikasi)
15. [Troubleshooting](#15-troubleshooting)
16. [Tips Keamanan Penting](#16-tips-keamanan-penting)

---

## 1. Persiapan & Prasyarat

Pastikan tools ini sudah ter-install di mesin kamu (VPS atau laptop):

### Cek Tools
```bash
node --version    # harus v20+
npm --version     # harus v10+
docker --version  # harus v20+
git --version     # harus v2+
openssl version   # biasanya sudah ada
```

Kalau ada yang belum:

**Install di Ubuntu/Debian:**
```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# Logout & login lagi supaya docker bisa dipakai tanpa sudo

# Install Git & OpenSSL
sudo apt install -y git openssl curl
```

**Install di macOS** (pakai Homebrew):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node docker git openssl
```

**Install di Windows**:
- Install [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) + Ubuntu, lalu ikut instruksi Ubuntu di atas.

### Kapasitas Minimum
- **CPU**: 2 core
- **RAM**: 4 GB (8 GB recommended)
- **Storage**: 20 GB kosong
- **OS**: Ubuntu 22.04+ / Debian 12+ / macOS / Windows WSL2

---

## 2. Setup VPS (kalau deploy ke server)

Kalau kamu deploy ke VPS (misal DigitalOcean, Vultr, Contabo, atau provider lain):

### 2.1 Beli & Setup VPS
- Pilih Ubuntu 22.04 atau 24.04 LTS
- Minimal 4 GB RAM, 2 vCPU, 40 GB SSD
- Catat **IP publik** VPS (contoh: `203.0.113.45`)

### 2.2 Pointing Domain (opsional, tapi recommended)
Beli domain (misal di Niagahoster, Namecheap, Cloudflare) lalu buat A record:
```
A     api.yourdomain.com    → 203.0.113.45
A     app.yourdomain.com    → 203.0.113.45
```

### 2.3 Setup Firewall
```bash
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
sudo ufw status
```

### 2.4 SSH Key (kalau belum setup)
```bash
# Di laptop kamu
ssh-keygen -t ed25519
# Copy public key
cat ~/.ssh/id_ed25519.pub
# Paste di VPS saat add SSH key (kalau pakai cloud panel)
# Atau:
ssh-copy-id user@203.0.113.45
```

### 2.5 Login ke VPS
```bash
ssh user@203.0.113.45
```

---

## 3. Clone Repository

```bash
cd ~
git clone https://github.com/saptoji/HRIS-Payroll.git
cd HRIS-Payroll
ls -la
# Kamu akan lihat: backend/  frontend/  docker-compose.yml  .env.example  dll
```

### Struktur Direktori
```
HRIS-Payroll/
├── backend/                # NestJS API (TypeScript)
│   ├── src/
│   │   ├── entities/      # 22 table TypeORM entities
│   │   ├── modules/       # auth, employee, payroll, dll
│   │   ├── seeds/         # database seeding
│   │   ├── app.module.ts  # main module
│   │   └── main.ts        # entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/              # Next.js 14 (TypeScript)
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   ├── next.config.ts
│   └── Dockerfile
├── docker-compose.yml     # Orchestration (postgres + redis)
├── .env.example           # Template env (COPY INI, JANGAN EDIT)
├── .gitignore
├── README.md
├── SECURITY.md
└── DEPLOY.md              # File ini
```

---

## 4. Generate Secrets

**PENTING**: secret ini untuk production. Generate sekali, simpan di password manager (Bitwarden/1Password), JANGAN di-commit ke git.

```bash
# 1. Postgres password (32 char)
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)"

# 2. JWT Secret untuk access token (64 char)
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -d '=+/' | cut -c1-64)"

# 3. JWT Secret untuk refresh token (BEDA dari access token!)
echo "REFRESH_JWT_SECRET=$(openssl rand -base64 64 | tr -d '=+/' | cut -c1-64)"

# 4. Redis password (32 char)
echo "REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)"
```

Copy output dari 4 command di atas. Kamu akan paste di file `.env` di step berikutnya.

**Output contoh** (JANGAN pakai ini, punya kamu harus beda):
```
POSTGRES_PASSWORD=a8F3kQ9zX2pL7mN4bV6cR1tY5wH0sJ
JWT_SECRET=K7gNVlQ8Yx2pEwMz9aJbR4hCfDsT6nB1iU3oP5wX8vZ0aAeLcHjKmNrSqTuVxYbD
REFRESH_JWT_SECRET=L9mPqR3sTvU5wXyZ0aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789aBcDeFgHiJ
REDIS_PASSWORD=0ZMCcDKAgVmI7xY4nP6sB2tR9wF1qL
```

---

## 5. Konfigurasi Environment

```bash
cd ~/HRIS-Payroll
cp .env.example .env
chmod 600 .env    # Hanya owner yang bisa baca
nano .env         # atau pakai vim/code
```

Isi dengan secrets yang kamu generate di step 4. Contoh file `.env` final:

```env
# ====== Database ======
POSTGRES_USER=postgres
POSTGRES_PASSWORD=a8F3kQ9zX2pL7mN4bV6cR1tY5wH0sJ    # GANTI dengan punya kamu
POSTGRES_DB=hris_payroll

# ====== JWT (HARUS BEDA antara access & refresh) ======
JWT_SECRET=K7gNVlQ8Yx2pEwMz9aJbR4hCfDsT6nB1iU3oP5wX8vZ0aAeLcHjKmNrSqTuVxYbD
REFRESH_JWT_SECRET=L9mPqR3sTvU5wXyZ0aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789aBcDeFgHiJ

# ====== Redis ======
REDIS_PASSWORD=0ZMCcDKAgVmI7xY4nP6sB2tR9wF1qL

# ====== Optional: untuk seed script ======
# (Generate password baru, BUKAN password asli user)
SEED_SUPER_ADMIN_EMAIL=superadmin@yourdomain.com
SEED_SUPER_ADMIN_PASSWORD=<strong-password-for-first-admin>

# ====== Production mode ======
NODE_ENV=production
DB_SYNC=false       # WAJIB false di production!
```

Save & exit (`Ctrl+O`, `Enter`, `Ctrl+X` di nano).

**Verifikasi file aman:**
```bash
ls -la .env
# -rw------- 1 user user ...  .env  (mode 600 = aman)
```

---

## 6. Deploy Database & Cache

Kita pakai Docker Compose untuk jalanin Postgres & Redis.

### 6.1 Edit `docker-compose.yml` untuk production
File `docker-compose.yml` punya services:
- `postgres` — database
- `redis` — cache
- `backend` — API (kita akan pakai mode `up` terpisah)
- `frontend` — web (sama)

Untuk production, kita **HANYA** pakai postgres & redis via Docker. Backend & frontend kita jalankan manual via `npm` atau `pm2` (lebih flexible untuk debug).

### 6.2 Start Postgres & Redis
```bash
# Pastikan di root project
cd ~/HRIS-Payroll

# Start hanya postgres & redis (detach mode)
docker compose up -d postgres redis

# Lihat status
docker compose ps

# Lihat logs (Ctrl+C untuk keluar)
docker compose logs -f postgres
```

Kalau sukses, output `docker compose ps` akan show:
```
NAME             STATUS              PORTS
hris-postgres    Up (healthy)        127.0.0.1:5433->5432/tcp
hris-redis       Up (healthy)        127.0.0.1:6380->6379/tcp
```

### 6.3 Test Koneksi Database
```bash
# Install psql client (kalau belum)
sudo apt install -y postgresql-client

# Test koneksi
PGPASSWORD="$(grep ^POSTGRES_PASSWORD .env | cut -d= -f2)" \
  psql -h 127.0.0.1 -p 5433 -U postgres -d hris_payroll -c "SELECT version();"
```

Output yang diharapkan: `PostgreSQL 16.x on x86_64-pc-linux-gnu...`

### 6.4 Test Koneksi Redis
```bash
# Install redis-cli
sudo apt install -y redis-tools

# Test
REDIS_PASSWORD="$(grep ^REDIS_PASSWORD .env | cut -d= -f2)"
redis-cli -h 127.0.0.1 -p 6380 -a "$REDIS_PASSWORD" ping
# Output: PONG
```

---

## 7. Deploy Backend (API)

Backend adalah NestJS (TypeScript). Ada 2 cara deploy:
- **Cara A: Build lalu jalan dengan Node.js** (recommended untuk production)
- **Cara B: Pakai Docker** (lebih simpel, tapi lebih berat)

### Cara A: Build & Run dengan Node.js (Recommended)

```bash
cd ~/HRIS-Payroll/backend

# 1. Install dependencies
npm install --omit=dev    # production only
# atau kalau mau juga dev deps (untuk build):
npm install

# 2. Build TypeScript → JavaScript
npm run build
# Output ada di folder dist/

# 3. Test jalanin sebentar (foreground, Ctrl+C untuk stop)
DB_HOST=127.0.0.1 \
DB_PORT=5433 \
DB_USER=postgres \
DB_PASSWORD="$(grep ^POSTGRES_PASSWORD ~/HRIS-Payroll/.env | cut -d= -f2)" \
DB_NAME=hris_payroll \
JWT_SECRET="$(grep ^JWT_SECRET ~/HRIS-Payroll/.env | cut -d= -f2)" \
REFRESH_JWT_SECRET="$(grep ^REFRESH_JWT_SECRET ~/HRIS-Payroll/.env | cut -d= -f2)" \
REDIS_HOST=127.0.0.1 \
REDIS_PORT=6380 \
REDIS_PASSWORD="$(grep ^REDIS_PASSWORD ~/HRIS-Payroll/.env | cut -d= -f2)" \
PORT=4000 \
node dist/main.js
```

Kalau jalan tanpa error, Ctrl+C dan lanjut ke step setup pm2 (di bawah).

### 7.1 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 7.2 Buat File Konfigurasi PM2
Buat file `~/HRIS-Payroll/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'hris-backend',
      cwd: '/home/USER/HRIS-Payroll/backend',  // GANTI USER dengan username kamu
      script: 'dist/main.js',
      instances: 1,        // atau 'max' untuk pakai semua CPU
      exec_mode: 'fork',   // atau 'cluster' untuk load balance
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        DB_HOST: '127.0.0.1',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_NAME: 'hris_payroll',
        REDIS_HOST: '127.0.0.1',
        REDIS_PORT: 6380,
        DB_SYNC: 'false',
        FRONTEND_URL: 'https://app.yourdomain.com',
      },
      env_file: '/home/USER/HRIS-Payroll/.env',  // GANTI USER
      max_memory_restart: '500M',
      error_file: '/home/USER/HRIS-Payroll/logs/backend-error.log',
      out_file: '/home/USER/HRIS-Payroll/logs/backend-out.log',
      time: true,
    },
  ],
};
```

Ganti `USER` dengan username Linux kamu (lihat dengan `whoami`).

```bash
mkdir -p ~/HRIS-Payroll/logs
cd ~/HRIS-Payroll
pm2 start ecosystem.config.js
pm2 save           # simpan untuk auto-startup
pm2 status         # lihat status
pm2 logs hris-backend    # tail logs
```

### 7.3 Test API
```bash
# Health check
curl http://127.0.0.1:4000/api/v1/health
# atau
curl http://127.0.0.1:4000/
```

---

## 8. Deploy Frontend (Web)

Frontend adalah Next.js 14. Sama, ada 2 cara.

### Cara A: Build & Run dengan Node.js (Recommended)

```bash
cd ~/HRIS-Payroll/frontend

# 1. Install dependencies
npm install

# 2. Set environment variable untuk build
export NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api/v1"
# Ganti dengan domain API kamu

# 3. Build Next.js (output di .next/)
npm run build

# 4. Test jalanin (foreground, Ctrl+C untuk stop)
PORT=3000 npm start
```

### 8.1 Tambah ke PM2
Edit `~/HRIS-Payroll/ecosystem.config.js`, tambah app kedua:

```javascript
module.exports = {
  apps: [
    // ... (backend config di atas)
    {
      name: 'hris-frontend',
      cwd: '/home/USER/HRIS-Payroll/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.yourdomain.com/api/v1',
      },
      max_memory_restart: '400M',
      error_file: '/home/USER/HRIS-Payroll/logs/frontend-error.log',
      out_file: '/home/USER/HRIS-Payroll/logs/frontend-out.log',
    },
  ],
};
```

```bash
cd ~/HRIS-Payroll
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### 8.2 Test Frontend
Buka browser: `http://127.0.0.1:3000` (kalau di VPS, akses via `http://VPS_IP:3000`)

Atau test dari terminal VPS:
```bash
curl -I http://127.0.0.1:3000
# Expected: HTTP/1.1 200 OK
```

---

## 9. Setup Reverse Proxy + HTTPS

Reverse proxy = "pintu gerbang" yang ngurusin HTTPS + routing. Pakai **Caddy** (paling gampang, auto HTTPS).

### 9.1 Install Caddy
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cliffano.com/caddy/setup.deb.sh' | sudo -E bash
sudo apt install -y caddy
```

### 9.2 Konfigurasi Caddyfile
```bash
sudo nano /etc/caddy/Caddyfile
```

Isi (ganti domain):
```caddyfile
# API backend
api.yourdomain.com {
    reverse_proxy 127.0.0.1:4000
    encode gzip
}

# Frontend
app.yourdomain.com {
    reverse_proxy 127.0.0.1:3000
    encode gzip
}

# Atau single domain (kalau frontend & API di domain yang sama)
yourdomain.com {
    # Serve frontend di root
    reverse_proxy 127.0.0.1:3000

    # API di /api/*
    reverse_proxy /api/* 127.0.0.1:4000
}
```

### 9.3 Start Caddy
```bash
sudo systemctl enable caddy
sudo systemctl restart caddy
sudo systemctl status caddy
```

Caddy **otomatis dapat HTTPS certificate** dari Let's Encrypt. Tunggu 1-2 menit, lalu coba akses:
- `https://app.yourdomain.com` (frontend)
- `https://api.yourdomain.com` (backend)

### 9.4 Update Frontend env kalau pakai reverse proxy
Kalau kamu setup `yourdomain.com/api/*` untuk API, update frontend:
```bash
cd ~/HRIS-Payroll/frontend
export NEXT_PUBLIC_API_URL="https://yourdomain.com/api/v1"
npm run build
pm2 restart hris-frontend
```

---

## 10. Setup Systemd (Auto-start)

Pastikan backend, frontend, postgres, redis **auto-start** kalau VPS reboot.

### 10.1 Docker sudah auto-start
```bash
sudo systemctl enable docker
```

### 10.2 PM2 startup
```bash
pm2 startup    # akan kasih command yang harus dijalankan
# Output: "sudo env PATH=... pm2 startup systemd -u USER --hp /home/USER"
# COPY dan JALANKAN command itu (dia akan nge-set up systemd)

pm2 save    # simpan list process sekarang
```

### 10.3 Test Reboot
```bash
sudo reboot
# Tunggu 1-2 menit, lalu SSH lagi dan cek:
docker compose -f ~/HRIS-Payroll/docker-compose.yml ps
pm2 status
curl https://app.yourdomain.com
```

---

## 11. Seed Data Demo

Setelah deploy, kamu butuh user admin untuk login pertama kali.

### 11.1 Generate password untuk super admin
```bash
echo "SEED_SUPER_ADMIN_PASSWORD=$(openssl rand -base64 24 | tr -d '=+/' | cut -c1-24)"
```

### 11.2 Jalankan seed
```bash
cd ~/HRIS-Payroll/backend

# Pastikan .env di parent folder sudah ada SEED_SUPER_ADMIN_PASSWORD
# Atau set env var manual:
SEED_SUPER_ADMIN_EMAIL="superadmin@yourdomain.com" \
SEED_SUPER_ADMIN_PASSWORD="<password-yang-kamu-generate>" \
DB_HOST=127.0.0.1 \
DB_PORT=5433 \
DB_USER=postgres \
DB_PASSWORD="$(grep ^POSTGRES_PASSWORD ~/HRIS-Payroll/.env | cut -d= -f2)" \
DB_NAME=hris_payroll \
JWT_SECRET="$(grep ^JWT_SECRET ~/HRIS-Payroll/.env | cut -d= -f2)" \
REFRESH_JWT_SECRET="$(grep ^REFRESH_JWT_SECRET ~/HRIS-Payroll/.env | cut -d= -f2)" \
node dist/seeds/seed.js
```

Expected output:
```
Seeding compliance defaults...
Creating super admin...
Super admin created: superadmin@yourdomain.com
Seed completed!
```

### 11.3 Tambah user admin lagi (kalau perlu)
Login ke `https://app.yourdomain.com` dengan super admin, lalu buka menu **Users** untuk tambah admin/manager baru.

---

## 12. Verifikasi & Testing

### 12.1 Health Check End-to-End
```bash
# Backend health
curl -I https://api.yourdomain.com/

# Login API
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@yourdomain.com","password":"<your-seed-password>"}'

# Expected response: JSON dengan access_token & refresh_token
```

### 12.2 Browser Test
1. Buka `https://app.yourdomain.com`
2. Login dengan super admin
3. Cek menu: Dashboard, Employees, Departments, Payroll
4. Tambah 1 employee dummy
5. Generate 1 payroll period
6. Download payslip PDF (kalau ada)

### 12.3 Logs Check
```bash
# Backend logs (real-time)
pm2 logs hris-backend

# Frontend logs
pm2 logs hris-frontend

# Postgres logs
docker logs -f hris-postgres

# Nginx/Caddy logs
sudo journalctl -u caddy -f
```

---

## 13. Backup & Monitoring

### 13.1 Backup Database (Wajib Setup!)

Buat script backup:
```bash
mkdir -p ~/backups/hris
nano ~/backups/backup-hris.sh
```

Isi:
```bash
#!/bin/bash
BACKUP_DIR=~/backups/hris
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=14

# Backup database
PGPASSWORD="$(grep ^POSTGRES_PASSWORD ~/HRIS-Payroll/.env | cut -d= -f2)" \
  docker exec hris-postgres pg_dumpall -U postgres \
  | gzip > "$BACKUP_DIR/hris_$DATE.sql.gz"

# Hapus backup lebih dari 14 hari
find "$BACKUP_DIR" -name "hris_*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "Backup completed: $BACKUP_DIR/hris_$DATE.sql.gz"
```

```bash
chmod +x ~/backups/backup-hris.sh

# Test jalankan
~/backups/backup-hris.sh

# Setup cron (setiap hari jam 3 pagi)
crontab -e
# Tambah baris:
0 3 * * * /home/USER/backups/backup-hris.sh >> /home/USER/backups/backup.log 2>&1
```

### 13.2 Upload Backup ke Cloud (Recommended)
Pakai `rclone` untuk upload ke Google Drive / S3 / Dropbox:
```bash
sudo apt install -y rclone
rclone config    # setup remote (interaktif)

# Tambah ke backup script:
rclone copy "$BACKUP_DIR" remote:hris-backups/ --progress
```

### 13.3 Monitoring
```bash
# Install htop untuk monitoring CPU/RAM
sudo apt install -y htop
htop

# Cek status service
pm2 status
docker compose -f ~/HRIS-Payroll/docker-compose.yml ps

# Cek storage
df -h
```

### 13.4 Setup Uptime Monitoring (Gratis)
- [UptimeRobot](https://uptimerobot.com) — 50 monitor gratis
- [BetterStack](https://betterstack.com)
- Healthchecks.io — bagus untuk cron monitoring

Cukup add monitor:
- `https://app.yourdomain.com` (frontend)
- `https://api.yourdomain.com/health` (backend)

Dapat alert via email/Telegram kalau down.

---

## 14. Update Aplikasi

### 14.1 Pull Code Terbaru
```bash
cd ~/HRIS-Payroll
git pull origin main
```

### 14.2 Update Backend
```bash
cd backend
npm install
npm run build
pm2 restart hris-backend
pm2 logs hris-backend --lines 50
```

### 14.3 Update Frontend
```bash
cd ../frontend
export NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api/v1"
npm install
npm run build
pm2 restart hris-frontend
```

### 14.4 Update Database Schema
Kalau ada perubahan entity (TypeORM akan auto-detect kalau `DB_SYNC=true`, tapi JANGAN di production).

**Cara aman production**:
1. Backup database dulu (lihat step 13.1)
2. Set `DB_SYNC=true` **sementara**
3. Restart backend (auto-migrate)
4. Set `DB_SYNC=false` lagi
5. Restart backend lagi

Atau pakai migration tool (TypeORM migrations) — tapi itu advanced topic.

### 14.5 Update Docker Images
```bash
cd ~/HRIS-Payroll
docker compose pull postgres redis
docker compose up -d postgres redis
```

---

## 15. Troubleshooting

### ❌ "Cannot connect to database"
**Cek 1**: Postgres container jalan?
```bash
docker ps | grep postgres
```

**Cek 2**: Password benar di `.env`?
```bash
diff <(grep ^POSTGRES_PASSWORD .env) <(docker exec hris-postgres env | grep POSTGRES_PASSWORD)
```

**Cek 3**: Port 5433 listening?
```bash
ss -tlnp | grep 5433
```

### ❌ "Port already in use"
```bash
sudo lsof -i :3000
# Kill process yang pakai port itu
sudo kill -9 <PID>
```

### ❌ "JWT secret not set"
```bash
# Pastikan .env dibaca. Debug dengan:
cd ~/HRIS-Payroll/backend
node -e "require('dotenv').config({path:'../.env'}); console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length)"
# Output harus 64+ (kalau undefined, .env gak ke-load)
```

### ❌ Frontend build error
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### ❌ HTTPS gak dapat certificate
```bash
# Cek domain pointing ke IP VPS
dig app.yourdomain.com
# atau
nslookup app.yourdomain.com

# Cek Caddy log
sudo journalctl -u caddy -n 50
```

### ❌ Backend crash terus
```bash
pm2 logs hris-backend --lines 100
# Lihat error, fix, lalu
pm2 restart hris-backend
```

### ❌ Lupa password super admin
```bash
cd ~/HRIS-Payroll/backend
PGPASSWORD="$(grep ^POSTGRES_PASSWORD ~/HRIS-Payroll/.env | cut -d= -f2)" \
  psql -h 127.0.0.1 -p 5433 -U postgres -d hris_payroll \
  -c "UPDATE users SET password_hash = crypt('<new-password>', gen_salt('bf', 10)) WHERE email = 'superadmin@yourdomain.com';"
```

---

## 16. Tips Keamanan Penting

### 🔴 WAJIB Dilakukan
1. **Jangan commit `.env`** ke git (sudah ada di `.gitignore` ✅)
2. **Ganti SEMUA default password** sebelum production
3. **Gunakan HTTPS** (Caddy auto-handle ✅)
4. **Backup database rutin** (step 13)
5. **Monitor logs** untuk akses mencurigakan

### 🟡 Strongly Recommended
6. **Setup firewall** (UFW — step 2.3)
7. **Setup fail2ban** untuk anti-brute-force SSH
8. **Enable 2FA** di GitHub & VPS panel
9. **Rotate secrets** setiap 90 hari
10. **Gunakan SSH key** (bukan password)

### 🟢 Best Practices
11. Pakai secret manager (HashiCorp Vault, AWS Secrets Manager) untuk tim besar
12. Setup CI/CD (GitHub Actions) untuk auto-deploy
13. Pakai container registry private (bukan docker hub public)
14. Penetration test sebelum launch
15. Setup log aggregation (ELK, Loki, Grafana)

---

## 🎉 Selesai!

Aplikasi HRIS Payroll kamu sudah jalan di:
- **Frontend**: https://app.yourdomain.com
- **API**: https://api.yourdomain.com
- **Database**: localhost:5433 (internal only)

### Next Steps
- Tambah user & employee via web UI
- Setup cron untuk payroll period
- Configure backup ke cloud storage
- Setup monitoring (UptimeRobot)
- Baca `SECURITY.md` untuk best practices

### Butuh Bantuan?
- Lihat `README.md` untuk overview project
- Lihat `SECURITY.md` untuk security best practices
- Buat issue di GitHub: https://github.com/saptoji/HRIS-Payroll/issues
- Atau kontak maintainer

Happy deploying! 🚀
