# syntax=docker/dockerfile:1
# Ambiente Docker exclusivo para desenvolvimento local.
FROM node:24-alpine AS development

ARG LOCAL_USER=app
ARG USER_ID=1000
ARG GROUP_ID=1000

RUN deluser node && \
    delgroup node 2>/dev/null || true; \
    addgroup -g "$GROUP_ID" "$LOCAL_USER" && \
    adduser -D -u "$USER_ID" -G "$LOCAL_USER" "$LOCAL_USER"

WORKDIR /app
RUN chown "${USER_ID}:${GROUP_ID}" /app

COPY --chown=${USER_ID}:${GROUP_ID} package.json package-lock.json ./

USER ${USER_ID}:${GROUP_ID}
# Conserva os pacotes baixados entre builds. A camada ainda é invalidada quando
# package.json ou package-lock.json mudam, mas o npm não baixa tudo novamente.
RUN --mount=type=cache,target=/home/${LOCAL_USER}/.npm,uid=${USER_ID},gid=${GROUP_ID} \
    npm ci && \
    sha256sum package-lock.json | cut -d ' ' -f 1 > node_modules/.package-lock.sha256

COPY --chown=${USER_ID}:${GROUP_ID} . .

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]
