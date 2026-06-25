# Cloudflare Tunnel Setup

Expose the local backend at `api.ven-emergencias.com`. Frontend is on Vercel at `ven-emergencias.com`.

## Architecture

| Host | Serves |
|------|--------|
| `ven-emergencias.com` | Vercel (Next.js) |
| `api.ven-emergencias.com` | Cloudflare tunnel → nginx on `localhost:$ENTRYPOINT_PORT` |

## Prerequisites

- `cloudflared` installed ([download](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/))
- `ven-emergencias.com` on Cloudflare nameservers
- Existing `~/.cloudflared/cert.pem` from `cloudflared tunnel login` (likely **charlytoc.dev** — that's fine)

## One-time setup (manual)

### 1. Create the tunnel

```bash
cloudflared tunnel create ven-emergencias
```

Note the **tunnel ID** from the output. Credentials land in `~/.cloudflared/<tunnel-id>.json`.

You do **not** need to re-run `cloudflared tunnel login` for `ven-emergencias.com` if you add DNS manually.

### 2. Local config

```bash
cp docs/ven-emergencias-tunnel.yml.example ~/.cloudflared/ven-emergencias.yml
```

Edit `~/.cloudflared/ven-emergencias.yml`:

- `credentials-file` → your `~/.cloudflared/<tunnel-id>.json`
- `service` port → match `ENTRYPOINT_PORT` in `.env` (e.g. `9023`)

### 3. DNS (Cloudflare dashboard)

**ven-emergencias.com** zone → DNS:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `api` | `<tunnel-id>.cfargotunnel.com` | Proxied |

Do **not** use `cloudflared tunnel route dns` if your `cert.pem` is for **charlytoc.dev** — that command targets the wrong zone and creates `api.ven-emergencias.com.charlytoc.dev` instead.

### 4. `.env`

```env
SITE_URL=https://api.ven-emergencias.com
FRONTEND_URL=https://ven-emergencias.com
WEB_API_URL=https://api.ven-emergencias.com/api
ENTRYPOINT_PORT=9023
```

On Vercel: `NEXT_PUBLIC_API_BASE_URL=https://api.ven-emergencias.com/api`

Restart after changes: `./taskfile.sh start`

### 5. Run

```bash
./taskfile.sh start
./taskfile.sh tunnel
```

`./taskfile.sh tunnel` uses `~/.cloudflared/ven-emergencias.yml` when that file exists.

## Daily workflow

```
Terminal 1:  ./taskfile.sh start
Terminal 2:  ./taskfile.sh tunnel
```

## Delete and recreate

```bash
cloudflared tunnel delete ven-emergencias
rm -f ~/.cloudflared/ven-emergencias.yml ~/.cloudflared/<old-tunnel-id>.json
```

Delete the `api` CNAME in Cloudflare DNS, then repeat one-time setup.

## Troubleshooting

| Error | Fix |
|---|---|
| `tunnel not found` | `cloudflared tunnel create ven-emergencias` |
| `ERR_NAME_NOT_RESOLVED` (but `dig @1.1.1.1 api.ven-emergencias.com A` works) | Flush Mac DNS: `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder` |
| `route dns` creates `….charlytoc.dev` | Don't use `route dns` — add CNAME manually on `ven-emergencias.com` |
| 502 from API | `./taskfile.sh start` + `./taskfile.sh tunnel` both running |
| CORS error in browser | Restart Django after setting `FRONTEND_URL`; site must match (apex vs `www`) — Django allows both automatically |
| `cert.pem` overwrite warning on login | Keep charlytoc.dev cert; use manual DNS for ven-emergencias.com |

## Verify

```bash
dig @1.1.1.1 api.ven-emergencias.com A +short
curl https://api.ven-emergencias.com/api/health
```

Expected: `{"status": "ok"}`
