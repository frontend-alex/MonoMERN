# MonoMERN Deployment Guide

Complete guide to deploy the full MonoMERN stack (React client + Express API + MongoDB) using Docker.

## Quick Start

### Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) installed and running
- A server/VPS with ports **80** and **443** open (for production)

### Step 1 — Deploy

**Linux / macOS:**

```bash
chmod +x scripts/deployment/deploy.sh
./scripts/deployment/deploy.sh
```

**Windows (PowerShell):**

```powershell
.\scripts\deployment\deploy.ps1
```

The script will:

1. Check that Docker is installed
2. Create `docker/.env.docker` from the template (if not exists)
3. Auto-generate secure JWT and session secrets
4. Build and start all containers

### Step 2 — Enable HTTPS (Production)

```bash
chmod +x scripts/deployment/init-ssl.sh
./scripts/deployment/init-ssl.sh
```

> [!IMPORTANT]
> Before running `init-ssl.sh`, ensure:
>
> - Your domain's DNS A record points to your server's IP
> - `DOMAIN` is set in `docker/.env.docker` (e.g., `myapp.com`)
> - Ports 80 and 443 are open and not blocked by a firewall

## Configuration Reference

Edit `docker/.env.docker` before deploying. All available variables:

### Required

| Variable             | Description                 | Example             |
| -------------------- | --------------------------- | ------------------- |
| `DOMAIN`             | Your domain name            | `myapp.com`         |
| `SESSION_SECRET`     | Session encryption key      | _auto-generated_    |
| `JWT_SECRET`         | JWT signing key             | _auto-generated_    |
| `JWT_REFRESH_SECRET` | Refresh token signing key   | _auto-generated_    |
| `OTP_EMAIL`          | Email for sending OTP codes | `noreply@myapp.com` |
| `OTP_EMAIL_PASSWORD` | App password for OTP email  | Gmail app password  |
| `CORS_ORIGINS`       | Allowed CORS origins        | `https://myapp.com` |

### Database

| Variable       | Description                    | Default                          |
| -------------- | ------------------------------ | -------------------------------- |
| `DB_LOCAL_URI` | MongoDB connection string      | `mongodb://mongo:27017/monomern` |
| `DB_ATLAS_URI` | MongoDB Atlas URI (production) | _empty_                          |

> [!TIP]
> The default `DB_LOCAL_URI` connects to the Docker MongoDB container. For production, you can switch to MongoDB Atlas by setting `DB_ATLAS_URI`.

### Optional — Social Auth

Set any provider credentials you need. Empty values are ignored:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
# ... etc.
```

## Architecture

```mermaid
graph TB
    subgraph "Docker Compose Network"
        direction TB
        C["Nginx Client :80/:443"]
        S["Express Server :3000"]
        M["MongoDB :27017"]
        CB["Certbot SSL"]
    end

    U["User"] -->|HTTPS| C
    C -->|"proxy /api/*"| S
    S -->|queries| M
    CB -.->|renew certs| C
```

| Container          | Image          | Purpose                                               |
| ------------------ | -------------- | ----------------------------------------------------- |
| `monomern-client`  | Nginx Alpine   | Serves React SPA, reverse proxies API, terminates SSL |
| `monomern-server`  | Node 20 Alpine | Express API, connects to MongoDB                      |
| `monomern-mongo`   | MongoDB 7      | Database with persistent volume                       |
| `monomern-certbot` | Certbot        | Auto-renews Let's Encrypt certificates                |

## Common Commands

```bash
# View all container logs
docker compose -f docker/docker-compose.yml logs -f

# View specific service logs
docker compose -f docker/docker-compose.yml logs -f server

# Restart all services
docker compose -f docker/docker-compose.yml restart

# Stop everything
docker compose -f docker/docker-compose.yml down

# Stop and remove all data (including database!)
docker compose -f docker/docker-compose.yml down -v

# Rebuild and redeploy after code changes
docker compose -f docker/docker-compose.yml up --build -d

# Check container status
docker compose -f docker/docker-compose.yml ps

# Enter a container shell
docker compose -f docker/docker-compose.yml exec server sh
```

## Production Checklist

- [ ] Set `DOMAIN` in `docker/.env.docker`
- [ ] Point DNS A record to server IP
- [ ] Run `deploy.sh`
- [ ] Run `init-ssl.sh` to enable HTTPS
- [ ] Verify `https://yourdomain.com` loads the app
- [ ] Verify `https://yourdomain.com/health` returns `{"status":"ok"}`
- [ ] Configure social auth credentials (if needed)

## MongoDB Atlas (Optional)

To use MongoDB Atlas instead of the Docker container:

1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Set in `docker/.env.docker`:
   ```
   DB_ATLAS_URI=mongodb+srv://user:password@cluster.mongodb.net/monomern
   ```
3. Optionally remove the `mongo` service from `docker/docker-compose.yml`

## SSL Certificate Renewal

Certbot auto-renews every 12 hours. No manual action needed.

To force renewal:

```bash
docker compose -f docker/docker-compose.yml run --rm certbot renew --force-renewal
docker compose -f docker/docker-compose.yml restart client
```

## Troubleshooting

### Containers won't start

```bash
docker compose -f docker/docker-compose.yml logs server
docker compose -f docker/docker-compose.yml logs mongo
```

### SSL certificate fails

1. Verify DNS: `nslookup yourdomain.com`
2. Ensure port 80 is open
3. Check logs: `docker compose -f docker/docker-compose.yml logs certbot`

### Port 80/443 already in use

```bash
sudo lsof -i :80   # Find conflicting process
```

## File Structure

```
MonoMERN/
├── .dockerignore                # Build context exclusions
├── docker/
│   ├── client/
│   │   ├── Dockerfile           # Vite build → Nginx
│   │   ├── nginx.conf           # HTTP config (default)
│   │   └── nginx-ssl.conf       # HTTPS template
│   ├── server/
│   │   └── Dockerfile           # TypeScript build → Node runtime
│   ├── docker-compose.yml       # 4 services orchestration
│   └── .env.docker.example      # Environment template
└── scripts/
    └── deployment/
        ├── deploy.sh            # Deploy (Linux/macOS)
        ├── deploy.ps1           # Deploy (Windows)
        └── init-ssl.sh          # Enable HTTPS
```
