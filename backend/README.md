
## Production Templates

Prepared files:

- `backend/.env.production.example`
- `backend/docker-compose.prod.yml`
- `deploy/lumber-link-backend.service`
- `deploy/nginx-api.conf`

### Quick usage

1. Copy `.env.production.example` to `/opt/lumber-link/backend/.env` and set strong secrets.
2. Start database:
   ```bash
   cd /opt/lumber-link/backend
   docker compose -f docker-compose.prod.yml --env-file .env up -d
   ```
3. Copy service file to `/etc/systemd/system/lumber-link-backend.service`.
4. Enable service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable lumber-link-backend
   sudo systemctl start lumber-link-backend
   ```
5. Copy Nginx config to `/etc/nginx/sites-available/lumber-link-api` and enable it.
