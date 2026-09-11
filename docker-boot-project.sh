#!/usr/bin/env bash

# Inicializa o ambiente Docker local da Auth API.

set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

log() {
  printf '\n==> %s\n' "$*"
}

fail() {
  printf '\nErro: %s\n' "$*" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "Docker nao foi encontrado."
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 nao esta disponivel."

[[ -f .env.example ]] || fail ".env.example nao foi encontrado."

if [[ ! -f .env ]]; then
  log "Criando .env a partir de .env.example"
  cp .env.example .env
fi

# O Docker Compose tambem le .env; carregamos aqui para mostrar as portas reais.
set -a
. ./.env
set +a

USER_ID="${USER_ID:-$(id -u)}"
GROUP_ID="${GROUP_ID:-$(id -g)}"

log "Construindo a imagem e iniciando os containers"
docker compose up -d --build

LOCK_HASH="$(sha256sum package-lock.json | cut -d ' ' -f 1)"
INSTALLED_LOCK_HASH="$(docker compose exec -T api sh -c 'cat node_modules/.package-lock.sha256 2>/dev/null || true')"

if [[ "$LOCK_HASH" != "$INSTALLED_LOCK_HASH" ]]; then
  log "Sincronizando dependências no volume node_modules"
  docker compose exec -T api npm ci
  docker compose exec -T api sh -c 'sha256sum package-lock.json | cut -d " " -f 1 > node_modules/.package-lock.sha256'
fi

log "Gerando o Prisma Client"
docker compose exec -T api npm run prisma:generate

log "Aplicando migrations pendentes do Prisma"
docker compose exec -T api npm run prisma:migrate:deploy

# Descomentar quando os testes de integração e E2E forem adicionados.
log "Executando testes"
docker compose exec -T api npm test
docker compose exec -T api npm run test:e2e

log "Status dos containers"
docker compose ps

log "Ambiente pronto"
printf '%s\n' \
  "API:        http://localhost:${PORT:-8000}" \
  "PostgreSQL: localhost:${POSTGRES_PORT:-5432}" \
  "Redis:      localhost:${REDIS_PORT:-6379}"
