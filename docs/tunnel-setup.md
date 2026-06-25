# Cloudflare Tunnel Setup

A named tunnel gives you a fixed subdomain on your registered Cloudflare domain.
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
cloudflared tunnel create japanese
```

Replace `japanese` with whatever name you want — it's just a label.
This writes credentials to `~/.cloudflared/<tunnel-id>.json`.

### 3. Route a subdomain to the tunnel

```bash
cloudflared tunnel route dns japanese japanese.charlytoc.dev
```

Replace `japanese.charlytoc.dev` with the subdomain you want. This creates a CNAME record
in Cloudflare DNS automatically. You can verify it in the Cloudflare dashboard under DNS.

### 4. Set the tunnel URL in your `.env`

Point the frontend at the tunnel so the browser's API calls go through it:

```env
WEB_API_URL=https://japanese.charlytoc.dev/api
WEB_REALTIME_URL=https://japanese.charlytoc.dev/realtime
```

Then restart `./taskfile.sh web` for the new URLs to take effect.

Also update `SITE_URL` so Django allows the tunnel hostname:

```env
SITE_URL=https://japanese.charlytoc.dev
```

### 5. Run

```bash
./taskfile.sh tunnel
# or with a custom local URL:
./taskfile.sh tunnel japanese http://localhost:9003
```

The tunnel name defaults to `japanese` and the local URL defaults to
`http://localhost:$ENTRYPOINT_PORT`. Both can be overridden as positional args.

## Daily workflow

```
Terminal 1:  ./taskfile.sh start       # Docker stack (Django + Nginx + Realtime)
Terminal 2:  ./taskfile.sh web         # Next.js dev server
Terminal 3:  ./taskfile.sh tunnel      # Cloudflare tunnel
```

Share `https://japanese.charlytoc.dev` — that's it.

## Multiple tunnels / machines

Each developer can run `cloudflared tunnel create <their-name>` and route their own
subdomain. The tunnel credentials live in `~/.cloudflared/` and are per-machine;
nothing in this repo needs to change.

## Troubleshooting

| Error | Fix |
|---|---|
| `No file cert.pem` | Run `cloudflared tunnel login` |
| `tunnel not found` | Run `cloudflared tunnel create <name>` |
| `DNS record not found` | Run `cloudflared tunnel route dns <name> <subdomain>` |
| Browser API calls fail through tunnel | Check `WEB_API_URL` in `.env` points to the tunnel, restart `./taskfile.sh web` |
| Django 400 / CORS error | Add tunnel hostname to `SITE_URL` or `ALLOWED_HOSTS` in `.env`, restart `./taskfile.sh start` |
