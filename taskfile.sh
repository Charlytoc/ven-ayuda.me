#!/usr/bin/env bash

set -o errexit
set -o errtrace
set -o nounset
set -o pipefail

function _error() {
  echo "****** Failed ******" >&2
  if [ "$1" != "0" ]; then
    echo "Exit code of $1 occurred on line number $2"
  fi
}
trap '_error $? $LINENO' ERR

function _finish() {
  echo "-- $0 completed --" >&2
}
trap _finish EXIT

function help() {
  echo "$0 <task> <args>"
  echo ""
  echo "Development Tasks:"
  echo "  setup-env         Copy .env if missing, generate VAPID keys, uv sync Django .venv"
  echo "  setup-django      Initialize Django (migrate, create superuser)"
  echo "  start [--rebuild,-r]   Start backend (Docker: Django, Celery, Redis, Nginx)"
  echo "  down              Stop development environment"
  echo "  down-clean        Stop and clean development environment (removes volumes)"
  echo "  migrate [app migration] Run Django migrations"
  echo "  test [args ...]   Run Django tests inside the django container (manage.py test)"
  echo "  shell [cmd ...]   Open a shell in the django container (or run a one-off command)"
  echo "  web               Start frontend natively (npm run dev)"
  echo "  tunnel [name] [url] Run Cloudflare tunnel (defaults: ven-emergencias http://localhost:\${ENTRYPOINT_PORT:-9000})"
  echo "  psql              Connect to PostgreSQL database"
  echo ""
  echo "Examples:"
  echo "  ./taskfile.sh start                  # Start backend (no rebuild)"
  echo "  ./taskfile.sh start --rebuild        # Start backend with rebuild"
  echo "  ./taskfile.sh migrate                # Make and apply migrations"
  echo "  ./taskfile.sh migrate core 0038      # Roll back to specific migration"
  echo "  ./taskfile.sh test                   # Full test suite"
  echo "  ./taskfile.sh test core.tests -v 2   # App label + verbosity"
}

function test() {
  docker compose -f docker-compose.yml exec django python manage.py test "$@"
}

function _set_env_var() {
  local env_file="$1"
  local key="$2"
  local value="$3"
  if grep -q "^${key}=" "$env_file"; then
    sed -i '' "s|^${key}=.*|${key}=${value}|" "$env_file"
  else
    echo "${key}=${value}" >> "$env_file"
  fi
}

function ensure_vapid_keys() {
  local root="$1"
  local env_file="$root/.env"

  local pub priv
  pub=$(grep '^WEB_PUSH_VAPID_PUBLIC_KEY=' "$env_file" 2>/dev/null | cut -d= -f2- || true)
  priv=$(grep '^WEB_PUSH_VAPID_PRIVATE_KEY=' "$env_file" 2>/dev/null | cut -d= -f2- || true)

  if [ -n "$pub" ] && [ -n "$priv" ]; then
    return
  fi

  echo "Generating Web Push VAPID keys..."
  local keys
  keys=$(cd "$root/django" && uv run python scripts/generate_vapid_keys.py)
  pub=$(echo "$keys" | sed -n '1p')
  priv=$(echo "$keys" | sed -n '2p')

  if [ -z "$pub" ] || [ -z "$priv" ]; then
    echo "Failed to generate VAPID keys" >&2
    return 1
  fi

  _set_env_var "$env_file" "WEB_PUSH_VAPID_PUBLIC_KEY" "$pub"
  _set_env_var "$env_file" "WEB_PUSH_VAPID_PRIVATE_KEY" "$priv"

  local subject
  subject=$(grep '^WEB_PUSH_VAPID_SUBJECT=' "$env_file" 2>/dev/null | cut -d= -f2- || true)
  if [ -z "$subject" ]; then
    _set_env_var "$env_file" "WEB_PUSH_VAPID_SUBJECT" "mailto:admin@ven-emergencias.com"
  fi

  echo "Generated WEB_PUSH_VAPID_PUBLIC_KEY and WEB_PUSH_VAPID_PRIVATE_KEY in .env"
}

function setup-env() {
  local root
  root="$(cd "$(dirname "$0")" && pwd)"

  if [ ! -f "$root/.env" ]; then
    cp "$root/.env.example" "$root/.env"
    echo "Copied .env.example to .env"
    echo "Please ask for sensitive environment variable values"
  fi

  if ! grep -qE '^CONTAINER_SUFFIX=.+' "$root/.env"; then
    local suffix
    suffix=$(openssl rand -hex 3)
    if grep -q '^CONTAINER_SUFFIX=' "$root/.env"; then
      sed -i '' "s/^CONTAINER_SUFFIX=.*/CONTAINER_SUFFIX=${suffix}/" "$root/.env"
    else
      echo "CONTAINER_SUFFIX=${suffix}" >> "$root/.env"
    fi
    echo "Generated CONTAINER_SUFFIX=${suffix}"
  fi

  if ! command -v uv >/dev/null 2>&1; then
    echo "uv is not installed. Install it, then re-run: ./taskfile.sh setup-env" >&2
    echo "  https://docs.astral.sh/uv/getting-started/installation/" >&2
    return 1
  fi

  echo "Syncing Django project (creates/updates django/.venv for IDE lint and IntelliSense)..."
  (cd "$root/django" && uv sync)
  echo "Django venv ready at django/.venv — select that interpreter in your editor if needed."

  ensure_vapid_keys "$root"
}

function setup-django() {
  migrate
  # Create the shared default organization + a superuser attached to it.
  docker compose -f docker-compose.yml exec django python manage.py shell -c "
from django.contrib.auth.hashers import make_password

from core.models import User
from core.services.signup_organization import get_or_create_default_organization

org = get_or_create_default_organization()
print(f'Organization ready: {org.name} ({org.domain})')

user, created = User.objects.get_or_create(
    email='admin@localhost.com',
    defaults={
        'password': make_password('p'),
        'is_staff': True,
        'is_superuser': True,
        'organization': org,
    },
)
if not created and user.organization_id != org.id:
    user.organization = org
    user.save(update_fields=['organization'])

if created:
    print(f'Superuser created: {user.email}')
else:
    print(f'Superuser already exists: {user.email}')
"
}

function start() {
  local build_flag=""
  local should_remove_images=false

  for arg in "$@"; do
    if [[ "$arg" == "--rebuild" || "$arg" == "-r" ]]; then
      build_flag="--build"
      should_remove_images=true
      break
    fi
  done

  if [ "$should_remove_images" = true ]; then
    # Stop containers and remove only images from this stack
    docker compose -f docker-compose.yml down --rmi local --remove-orphans
  else
    # Only stop containers
    docker compose -f docker-compose.yml down --remove-orphans
  fi

  # Start the stack with new configuration
  docker compose -f docker-compose.yml up -d --force-recreate $build_flag

  docker compose -f docker-compose.yml exec django python manage.py migrate
}

function web() {
  local web_dir
  web_dir="$(cd "$(dirname "$0")/web" && pwd)"
  source "$(dirname "$0")/.env" 2>/dev/null || true
  local port="${WEB_PORT:-3000}"

  local missing=()
  [[ -z "${WEB_API_URL:-}" ]] && missing+=("WEB_API_URL")
  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "ERROR: missing required variables in .env: ${missing[*]}" >&2
    echo "  WEB_API_URL — URL the browser uses to reach the API (e.g. http://localhost:9000/api)" >&2
    exit 1
  fi

  # Type generation reads the schema directly from Django, stays on the local network.
  local openapi_url="${WEB_OPENAPI_URL:-http://localhost:${DJANGO_PORT:-8000}/api/openapi.json}"

  echo "web → API=${WEB_API_URL}"
  cd "$web_dir"
  OPENAPI_URL="$openapi_url" \
  NEXT_PUBLIC_API_BASE_URL="$WEB_API_URL" \
  npm run dev -- --port "$port"
}

function tunnel() {
  if ! command -v cloudflared >/dev/null 2>&1; then
    echo "cloudflared is not installed or not available in PATH" >&2
    echo "Install from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/" >&2
    exit 1
  fi

  source "$(dirname "$0")/.env" 2>/dev/null || true
  local tunnel_name="${1:-ven-emergencias}"
  local tunnel_url="${2:-http://localhost:${ENTRYPOINT_PORT:-9000}}"
  echo "tunnel → ${tunnel_name} @ ${tunnel_url}"
  cloudflared tunnel run --url "$tunnel_url" "$tunnel_name"
}

function down() {
  echo "Stopping development environment..."
  docker compose -f docker-compose.yml down
  echo "Development environment stopped!"
}

function down-clean() {
  echo "Stopping and cleaning development environment..."
  docker compose -f docker-compose.yml down -v --rmi all --remove-orphans
  echo "Development environment stopped and cleaned!"
}

function migrate() {
  if [ "$#" -eq 0 ]; then
    # Default behavior: make and apply migrations
    docker compose -f docker-compose.yml exec django python manage.py makemigrations
    docker compose -f docker-compose.yml exec django python manage.py migrate
  elif [ "$#" -eq 2 ]; then
    # Undo migration: migrate to specific number
    docker compose -f docker-compose.yml exec django python manage.py migrate "$1" "$2"
  else
    echo "Usage:"
    echo "  ./taskfile.sh migrate                    # Make and apply all migrations"
    echo "  ./taskfile.sh migrate <app> <migration>  # Migrate to specific migration"
    echo "Example:"
    echo "  ./taskfile.sh migrate core 0038         # Roll back to migration 0038"
    exit 1
  fi
}

function psql() {
  docker compose -f docker-compose.yml exec postgres psql -U "${POSTGRES_USER:-startup-user}" -d "${POSTGRES_DB:-startup-db}"
}

function shell() {
  if [ "$#" -eq 0 ]; then
    docker compose -f docker-compose.yml exec -it django bash
  else
    docker compose -f docker-compose.yml exec -it django "$@"
  fi
}

TIMEFORMAT="Task completed in %3lR"
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    time help
else
    time "${@:-help}"
fi
