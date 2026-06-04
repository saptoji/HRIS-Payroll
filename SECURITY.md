# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it privately:

- **Email**: security@saptoji.dev (atau buat private advisory di GitHub)
- **JANGAN** buka public issue untuk vulnerability

Kami akan respond dalam 7 hari dan patch dalam 30 hari untuk critical issue.

## Security Best Practices untuk User yang Deploy

### Environment Variables
- **JANGAN PERNAH** commit file `.env` ke git
- Generate secret yang kuat: `openssl rand -base64 64`
- Pakai secret manager untuk production (HashiCorp Vault, AWS Secrets Manager, docker secret)

### Database
- Bind database port ke `127.0.0.1` saja, jangan `0.0.0.0`
- Ganti default password (`postgres/postgres`) sebelum production
- Backup rutin dengan encryption at-rest

### JWT
- Generate `JWT_SECRET` dan `REFRESH_JWT_SECRET` yang **berbeda**
- Rotation tiap 90 hari atau segera jika bocor
- Pakai algorithm yang aman (HS256 minimum, RS256 untuk multi-service)

### Redis
- Set `REDIS_PASSWORD` yang kuat
- Bind ke `127.0.0.1` atau private network

### Network
- Pakai firewall (UFW/iptables) untuk block semua port yang tidak perlu
- Rate limit endpoint `/auth/login` untuk anti-brute-force
- HTTPS only di production (Let's Encrypt / Caddy)
- CORS allow hanya origin frontend

### Application
- Set `DB_SYNC=false` di production (TypeORM auto-alter schema)
- Disable debug mode di production
- Sanitize user input untuk anti SQL injection (TypeORM sudah parameterized, tapi tetap hati-hati)
- Rate limit API endpoint
- Audit log untuk akses admin

## Demo vs Production

Repo ini adalah **demo/learning project** dengan seed credentials development (lihat git history versi awal, sebelum cleanup). Untuk production:
- Ganti SEMUA default credentials
- Audit ulang setiap secret
- Jalankan security scanner (gitleaks, npm audit, snyk)
- Penetration test sebelum launch

## Referensi

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
