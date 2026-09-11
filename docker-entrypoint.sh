#!/usr/bin/env sh

# Prepara o ambiente de desenvolvimento antes de iniciar o Nest.
set -eu

rm -f /tmp/api-ready

LOCK_HASH="$(sha256sum package-lock.json | cut -d ' ' -f 1)"
INSTALLED_LOCK_HASH="$(cat node_modules/.package-lock.sha256 2>/dev/null || true)"

if [ "$LOCK_HASH" != "$INSTALLED_LOCK_HASH" ]; then
  echo "==> Sincronizando dependências no volume node_modules"
  npm ci
  printf '%s\n' "$LOCK_HASH" > node_modules/.package-lock.sha256
fi

echo "==> Gerando Prisma Client"
npm run prisma:generate

echo "==> Aplicando migrations pendentes do Prisma"
npm run prisma:migrate:deploy

echo "==> Garantindo os roles padrão"
npm run prisma:seed

touch /tmp/api-ready
exec "$@"
