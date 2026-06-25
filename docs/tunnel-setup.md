# Cloudflare Tunnel Setup

A named tunnel gives you a fixed hostname on your Cloudflare domain.
Do this once per machine; after that `./taskfile.sh tunnel` is all you need.

## Prerequisites

- `cloudflared` installed ([download](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/))
- A domain managed in Cloudflare (DNS must be proxied through Cloudflare)

## One-time setup

### 1. Authenticate cloudflared

```bash
cloudflared tunnel login
```

This opens a browser. Select your domain. Cloudflare writes `~/.cloudflared/cert.pem` on success.

### 2. Create the named tunnel

```bash
cloudflared tunnel create ven-emergencias
```

This writes credentials to `~/.cloudflared/<tunnel-id>.json`.

### 3. Route the API subdomain to the tunnel

```bash
cloudflared tunnel route dns ven-emergencias api.ven-emergencias.com
```

This creates a CNAME record in Cloudflare DNS automatically. You can verify it in the Cloudflare dashboard under DNS.

The frontend (`ven-emergencias.com`) is hosted separately (e.g. Vercel). The tunnel exposes only the backend (Django API, admin, media) at `api.ven-emergencias.com`.

### 4. Set URLs in your `.env`

```env
SITE_URL=https://api.ven-emergencias.com
FRONTEND_URL=https://ven-emergencias.com
WEB_API_URL=https://api.ven-emergencias.com/api
```

Restart `./taskfile.sh start` after changing these.

On Vercel, set `NEXT_PUBLIC_API_BASE_URL=https://api.ven-emergencias.com/api`.

### 5. Run

```bash
./taskfile.sh tunnel
# or with a custom local URL:
./taskfile.sh tunnel ven-emergencias http://localhost:9023
```

The tunnel name defaults to `ven-emergencias` and the local URL defaults to
`http://localhost:$ENTRYPOINT_PORT`. Both can be overridden as positional args.

## Daily workflow

```
Terminal 1:  ./taskfile.sh start       # Docker stack (Django + Nginx + Celery)
Terminal 2:  ./taskfile.sh tunnel      # Cloudflare tunnel → api.ven-emergencias.com
```

Frontend is served by Vercel at `https://ven-emergencias.com`.

## Troubleshooting

| Error | Fix |
|---|---|
| `No file cert.pem` | Run `cloudflared tunnel login` |
| `tunnel not found` | Run `cloudflared tunnel create ven-emergencias` |
| `DNS record not found` | Run `cloudflared tunnel route dns ven-emergencias api.ven-emergencias.com` |
| Browser API calls fail | Check `WEB_API_URL` / `NEXT_PUBLIC_API_BASE_URL` point to `https://api.ven-emergencias.com/api` |
| Django 400 / CORS error | Set `FRONTEND_URL=https://ven-emergencias.com` and `SITE_URL` to the API host, restart `./taskfile.sh start` |
