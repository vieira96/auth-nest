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
# O entrypoint da API instala dependências quando necessário, gera o client,
# aplica migrations e executa o seed antes do Nest iniciar.
docker compose up -d --build --wait

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
