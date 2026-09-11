# Auth API

API de autenticação e autorização construída com NestJS. O projeto demonstra a implementação incremental de usuários, papéis (roles), permissões e proteção de rotas administrativas.

> Status: fundação e persistência inicial concluídas. NestJS, TypeScript estrito, aliases, Docker, PostgreSQL, Prisma e a base de usuários estão prontos. Autenticação e autorização serão implementadas nas próximas etapas.

## Objetivo

Criar uma API segura e modular em que somente usuários com a role ADMIN podem gerenciar usuários. A autorização evolui de controle por papel (RBAC) para permissões granulares.

~~~text
User --< UserRole >-- Role --< RolePermission >-- Permission
~~~

## Destaques técnicos

- **NestJS 12** e TypeScript em modo estrito
- **Node.js 24** fixado via .nvmrc
- Alias @/ para imports a partir de src/
- Build de compilação validado com tsc-alias
- Docker Compose com API, PostgreSQL e Redis
- Docker para desenvolvimento local com hot reload
- Prisma 7 com migration versionada e tabela users
- Base de testes com Vitest, lint com Oxlint e build verificado
- Configuração de ambiente preparada com .env e .env.example

## Arquitetura planejada

~~~text
src/
  modules/
    users/
      controllers/        # camada HTTP
      services/           # regras de negócio
      dto/                # contratos de entrada e saída
      repositories/       # acesso a persistência
      users.module.ts
    auth/                 # controllers, services, dto, strategies e guards
    roles/                # controllers, services, dto e repositories
    permissions/          # controllers, services, dto e repositories
  shared/
    auth/                 # guards, decorators e estratégias
    database/             # PrismaModule e PrismaService
    redis/                # controle de tentativas de login
  main.ts
  app.module.ts
prisma/
  schema.prisma
  models/
    users/
      user.prisma         # modelos agrupados por domínio
  migrations/
~~~

Cada domínio mantém suas camadas internas. Controllers lidam com HTTP, services concentram regras de negócio, DTOs definem contratos de entrada e saída e repositories isolam persistência. Integrações compartilhadas ficam em shared/.

## Segurança planejada

- Senhas protegidas com **Argon2id**; nenhum hash é devolvido em respostas.
- Autenticação por **JWT**.
- JwtAuthGuard para exigir sessão válida.
- RolesGuard e @Roles('ADMIN') para proteger /users.
- Permissões como USER_READ, USER_CREATE, USER_UPDATE e USER_DELETE.
- Login limitado a três falhas. Na quarta tentativa, a API retorna 429 Too Many Requests e informa o tempo restante no cabeçalho Retry-After.
- Redis armazena o bloqueio temporário com TTL configurável. Chaves usam o hash do e-mail normalizado, nunca o e-mail puro.
- O login não revela se um e-mail existe ou não.

~~~dotenv
LOGIN_MAX_ATTEMPTS=3
LOGIN_LOCK_TTL_SECONDS=900
~~~

## Como executar

### Com Docker (desenvolvimento)

~~~bash
./docker-boot-project.sh
~~~

O script cria o .env a partir do .env.example se necessário, constrói a imagem, inicia a API, PostgreSQL e Redis, gera o Prisma Client e aplica as migrations já versionadas. Os comandos de testes continuam comentados: os testes atuais podem ser executados pelos comandos da seção de qualidade.

Também é possível iniciar manualmente:

~~~bash
docker compose up --build
~~~

O Compose executa npm run start:dev com hot reload. Alterações em src/ são refletidas automaticamente no container.

| Serviço | Endereço padrão |
| --- | --- |
| API | http://localhost:8000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

Para encerrar mantendo os dados do PostgreSQL:

~~~bash
docker compose down
~~~

Para apagar também o volume do banco:

~~~bash
docker compose down --volumes
~~~

### Localmente

~~~bash
nvm use
npm install
npm run start:dev
~~~

### Prisma e tabela `users`

Os modelos do banco ficam em `prisma/models/`, separados por domínio: por enquanto, `prisma/models/users/user.prisma`. O arquivo `prisma/schema.prisma` mantém apenas a configuração comum do Prisma. Juntos, eles são a única fonte de verdade do banco. O módulo Nest em `src/modules/users/` contém as camadas da aplicação e usa o tipo `User` gerado automaticamente pelo Prisma, sem duplicar o modelo.

~~~bash
# criar uma migration após alterar um arquivo em prisma/models/
npm run prisma:migrate -- --name descricao_da_alteracao

# abrir a interface visual do banco
npm run prisma:studio
~~~

A migration é salva em `prisma/migrations/` e deve ser versionada no Git. A tabela inicial possui `id`, `name`, `email` único, `passwordHash`, `createdAt` e `updatedAt`. A senha nunca é armazenada em texto puro; o hash será gerado na etapa de autenticação.

O arquivo .env contém valores de desenvolvimento. Para outro ambiente, use .env.example como modelo e substitua todos os segredos.

No Linux, ajuste USER_ID e GROUP_ID no .env com o resultado de `id -u` e `id -g`. Docker Compose usa esses valores ao criar o usuário do container, evitando arquivos pertencentes a root ou a outro usuário no diretório do projeto.

## Qualidade

~~~bash
npm run lint
npm test
npm run test:e2e
npm run build
~~~

A estratégia de qualidade prevê testes unitários, de integração com PostgreSQL isolado e E2E para login, JWT, 401, 403, 429 e acesso administrativo. A CI em GitHub Actions executa em push e pull request: instalação limpa, lint, testes, E2E e build. Não há CD ou deploy configurado.

## Estratégia de branches

~~~text
feature/nome-da-funcionalidade
          ↓ pull request + CI aprovada
         dev
          ↓ pull request + CI aprovada
        main
~~~

- main: versão estável; recebe pull requests somente de dev.
- dev: branch de integração; recebe pull requests das branches de funcionalidade.
- feature/nome-da-funcionalidade: uma branch por funcionalidade nova.

O workflow bloqueia pull requests diretas de feature para main. Quando o repositório estiver no GitHub, configure uma ruleset ou branch protection para dev e main com:

1. Pull request obrigatório antes do merge.
2. Checks obrigatórios: Política de branches e Qualidade.
3. Branch atualizada antes do merge.
4. Bloqueio de push direto, force push e exclusão de branch.

A CI faz a validação; a ruleset do GitHub é a configuração que realmente impede o merge enquanto os checks não passarem.

## Roadmap

- [x] Inicializar NestJS com TypeScript estrito
- [x] Configurar alias @/
- [x] Criar Dockerfile, Docker Compose, PostgreSQL e Redis
- [x] Definir ambiente local e exemplo de variáveis
- [ ] Integrar @nestjs/config e validar variáveis de ambiente
- [x] Integrar Prisma e criar a tabela users
- [ ] Criar roles, permissões e seeds do administrador inicial
- [ ] Implementar login JWT e limitação de tentativas com Redis
- [ ] Proteger /users com ADMIN
- [x] Criar pipeline de CI com lint, testes, E2E e build
- [ ] Adicionar testes de integração/E2E com PostgreSQL e Redis
- [ ] Documentar a API com Swagger/OpenAPI

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| JWT_ACCESS_SECRET | segredo para assinatura dos access tokens |
| LOCAL_USER, USER_ID, GROUP_ID | usuário e UID/GID do container no Linux |
| POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB | credenciais do PostgreSQL no Compose |
| DATABASE_URL | string de conexão usada pelo Prisma |
| REDIS_URL | endereço do Redis |
| LOGIN_MAX_ATTEMPTS | quantidade permitida de falhas de login |
| LOGIN_LOCK_TTL_SECONDS | tempo de bloqueio após atingir o limite |
| ADMIN_EMAIL, ADMIN_PASSWORD | credenciais usadas pelo futuro seed do administrador inicial |

## Licença

Projeto de estudo e portfólio.
