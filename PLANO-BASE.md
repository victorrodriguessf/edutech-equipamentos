# Plano de Implementação — Base do Projeto

> Cobre a Entrega 0 (fundação) e a autenticação da Entrega 1 do documento `ARQUITETURA.md`.
> Cada bloco é uma tarefa fechada, com critério de aceite verificável. Executar em ordem, um por vez, parando ao fim de cada um.

---

## Decisões desta fase

| Item | Decisão |
|---|---|
| Repositório | Monorepo com npm workspaces: `api/` e `web/` |
| Docker | Apenas PostgreSQL. API e front rodam localmente com Node |
| Node | Versão 22 LTS |
| Gerenciador | npm |
| Hash de senha | `bcryptjs` |
| Refresh token | Stateless, sem tabela no banco |
| Front nesta fase | Só login e rota protegida. Sem telas de equipamento |

**Sobre o monorepo:** um `node_modules` único na raiz, um `npm install` só, e scripts de atalho para não precisar trocar de pasta. O custo é que todo comando de dependência precisa do `-w`, e o Prisma exige atenção com caminhos relativos. Ambos estão tratados nos blocos abaixo.

**Sobre o refresh token stateless:** não há tabela de tokens, então não existe revogação individual. Para uma equipe de poucos operadores internos isso é aceitável e economiza uma tabela e um bloco inteiro. Se no futuro for preciso deslogar alguém remotamente, entra a tabela `refresh_tokens` com o `jti`. Fica registrado aqui como decisão consciente, não esquecimento.

## Estrutura final desta fase

```
edutech-equipamentos/
├── package.json            raiz: workspaces e scripts de atalho
├── package-lock.json       único, na raiz
├── node_modules/           único, na raiz
├── AGENTS.md
├── ARQUITETURA.md
├── PLANO-BASE.md
├── README.md
├── .gitignore
├── docker-compose.yml
├── api/
│   ├── package.json        sem package-lock próprio
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── env.ts
│       ├── lib/prisma.ts
│       ├── lib/erros.ts
│       ├── middlewares/autenticar.ts
│       ├── schemas/auth.schema.ts
│       ├── services/auth.service.ts
│       └── routes/
│           ├── index.ts
│           ├── health.routes.ts
│           └── auth.routes.ts
└── web/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── .env.example
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── routes/
        ├── pages/Login.tsx
        ├── pages/Inicio.tsx
        ├── components/RotaProtegida.tsx
        ├── hooks/useAuth.tsx
        ├── services/api.ts
        └── types/
```

---

## Bloco 1 — Bootstrap do repositório

**Objetivo:** monorepo versionado, com a documentação no lugar e os dois workspaces reconhecidos pelo npm.

**Passos**
1. `git init` na raiz.
2. Criar `.gitignore` cobrindo: `node_modules/`, `dist/`, `.env`, `.env.local`, `*.log`, `.DS_Store`, `postgres-data/`.
3. Colocar `AGENTS.md`, `ARQUITETURA.md` e `PLANO-BASE.md` na raiz.
4. Criar `package.json` na raiz com `"private": true` e `"workspaces": ["api", "web"]`. Sem dependências ainda.
5. Criar `api/package.json` e `web/package.json` mínimos, com `name` e `"private": true`.
6. Scripts de atalho na raiz:
   ```
   "dev:api":     "npm run dev -w api"
   "dev:web":     "npm run dev -w web"
   "db:migrate":  "npm run migrate -w api"
   "db:seed":     "npm run seed -w api"
   "db:studio":   "npm run studio -w api"
   ```
7. `README.md` inicial com nome do projeto, stack e a frase "instruções de execução no Bloco 9".
8. Commit: `chore: estrutura inicial do monorepo`.

**Aceite:** `npm install` na raiz cria um único `node_modules` e um único `package-lock.json`. `npm ls -ws` lista os dois workspaces. Não existe `node_modules` nem lock dentro de `api/` ou `web/`.

**Não fazer:** instalar dependência de aplicação, adicionar Turborepo ou Nx, criar CI, rodar `npm install` dentro das subpastas.

---

## Bloco 2 — PostgreSQL em Docker

**Objetivo:** banco rodando e acessível localmente.

**Passos**
1. Criar `docker-compose.yml` na raiz com um serviço `db`:
   - imagem `postgres:16`
   - porta `5432:5432`
   - variáveis: `POSTGRES_USER=edutech`, `POSTGRES_PASSWORD` vindo de env, `POSTGRES_DB=edutech`
   - volume nomeado para persistência
   - `healthcheck` com `pg_isready`
2. Criar `.env` na raiz apenas com a senha do banco, e `.env.example` correspondente.

**Aceite:** `docker compose up -d` sobe o container, `docker compose ps` mostra healthy, e `psql` ou qualquer cliente conecta em `localhost:5432`.

**Não fazer:** adicionar serviço de API, front, pgAdmin ou Adminer ao compose.

---

## Bloco 3 — Esqueleto da API

**Objetivo:** servidor Fastify de pé, com env validado e tratamento de erro padronizado.

**Passos**
1. Completar `api/package.json` com os scripts, usando `tsx` no desenvolvimento.
2. Instalar **pela raiz**: `npm i fastify @fastify/cors @fastify/cookie zod dotenv -w api` e `npm i -D typescript tsx @types/node -w api`.
3. `src/env.ts`: carrega `.env` e valida com Zod. Falta de variável obrigatória derruba o processo com mensagem clara. Variáveis: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, `CORS_ORIGIN`, `NODE_ENV`.
4. `src/lib/erros.ts`: classe `ErroApp` com `mensagem` e `status`, e helpers `naoEncontrado`, `naoAutorizado`, `conflito`, `dadosInvalidos`.
5. `src/app.ts`: instancia Fastify, registra CORS e cookie, registra o error handler global que devolve `{ erro, detalhes? }`, e trata `ZodError` como 400.
6. `src/routes/health.routes.ts`: `GET /health` devolvendo `{ status: 'ok', horario }`.
7. `src/server.ts`: sobe na porta do env.
8. Scripts: `dev`, `build`, `start`.
9. `.env.example` preenchido, `.env` real fora do Git.

**Aceite:** `npm run dev` sobe a API, `GET /health` responde 200, e remover uma variável do `.env` faz o processo falhar com mensagem legível.

**Não fazer:** criar rota de equipamento, instalar Prisma ainda, montar logger customizado.

---

## Bloco 4 — Schema Prisma

**Objetivo:** modelo de dados completo do `ARQUITETURA.md` traduzido para Prisma.

**Passos**
1. Instalar pela raiz: `npm i @prisma/client -w api` e `npm i -D prisma -w api`. Rodar `npx prisma init` **de dentro de `api/`**, para o schema nascer em `api/prisma/`.
   Todos os comandos do Prisma nos blocos seguintes rodam com `-w api` a partir da raiz, ou de dentro de `api/`. O `.env` lido pelo Prisma é o `api/.env`, não o da raiz.
2. Escrever `schema.prisma` com todos os enums da seção 5 do `ARQUITETURA.md`: `SituacaoEquipamento`, `CondicaoEquipamento`, `SituacaoReserva`, `TipoMovimentacao`, `PapelUsuario`.
3. Modelos: `Usuario`, `Pessoa`, `Categoria`, `Local`, `Equipamento`, `Reserva`, `Movimentacao`.
4. Usar `@@map` nas tabelas e `@map` nos campos para manter `snake_case` no banco.
5. Aplicar os campos obrigatórios definidos na seção 6: em `Equipamento`, os campos `nome`, `categoriaId`, `situacao`, `condicao`, `localPadraoId`, `localAtualId` e `tombo` são `NOT NULL`; `tomboSenac`, `marca`, `modelo`, `numeroSerie` são opcionais.
6. Índices declarados via `@@index` conforme a seção 5.
7. `src/lib/prisma.ts` exportando uma instância única do client.
8. Gerar a primeira migration e **exibir o SQL antes de aplicar**.

**Aceite:** `npx prisma migrate dev` aplica sem erro, `npx prisma studio` abre e lista as 7 tabelas vazias, e `npx prisma validate` passa.

**Não fazer:** inventar campo, renomear campo, remover campo, ou tentar criar a constraint de sobreposição aqui (é o próximo bloco).

---

## Bloco 5 — Constraints que o Prisma não gera

**Objetivo:** garantias que precisam de SQL manual.

**Passos**
1. Criar migration vazia: `npx prisma migrate dev --create-only --name constraints_manuais`.
2. Escrever no SQL da migration:
   - `CREATE EXTENSION IF NOT EXISTS btree_gist;`
   - Constraint `EXCLUDE` impedindo sobreposição de reserva do mesmo equipamento quando a situação for `AGENDADA` ou `EM_ANDAMENTO`, usando `tstzrange(inicio, fim_previsto)`.
   - Índice único parcial em `tombo_senac` para valores não nulos.
   - `CHECK` garantindo `fim_previsto > inicio`.
   - `CHECK` de formato do tombo: `tombo ~ '^EDT-[A-Z]{3}-[0-9]{3}$'`.
3. Aplicar a migration.
4. Documentar essas constraints em comentário no topo do arquivo SQL, explicando o porquê de cada uma.

**Aceite:** inserir manualmente duas reservas sobrepostas do mesmo equipamento é recusado pelo banco. Inserir dois equipamentos com o mesmo `tombo_senac` é recusado. Inserir tombo com formato errado é recusado. Dois equipamentos com `tombo_senac` nulo são aceitos.

**Não fazer:** implementar a validação na API ainda. Aqui é só banco.

---

## Bloco 6 — Seed

**Objetivo:** ambiente com dados realistas para desenvolver e testar.

**Passos**
1. `prisma/seed.ts` idempotente, usando `upsert`.
2. Categorias, as 10 do `ARQUITETURA.md`: NTB, DSK, MON, TAB, VRS, PRJ, IMP, PER, RDE, DIV.
3. Locais: `LAB01`, `LAB02`, `DEPOSITO`.
4. Usuários: um `ADMIN` e um `OPERADOR`, senha vinda de variável de ambiente, nunca fixa no código.
5. Pessoas: 5 registros fictícios com nome e setor.
6. Equipamentos: 20 itens distribuídos entre as categorias, com tombo válido no formato, situações e condições variadas, incluindo pelo menos um `PRECISA_MANUTENCAO` e um `EM_MANUTENCAO`.
7. Cada equipamento do seed grava sua movimentação `CADASTRO`, respeitando a regra 3 do `AGENTS.md`.
8. Script `db:seed` no `package.json` e configuração `prisma.seed`.

**Aceite:** rodar o seed duas vezes seguidas não duplica registro nem quebra. O Prisma Studio mostra 10 categorias, 20 equipamentos e 20 movimentações de cadastro.

**Não fazer:** senha em texto no código, dado sensível real, mais de 20 equipamentos.

---

## Bloco 7 — Autenticação

**Objetivo:** login funcional com JWT e refresh token.

**Passos**
1. Dependências: `@fastify/jwt`, `bcryptjs` e seus tipos.
2. `services/auth.service.ts`:
   - `login(email, senha)`: busca usuário ativo, compara hash com bcrypt, devolve access token (15 min) e refresh token (7 dias), assinados com segredos diferentes.
   - `renovar(refreshToken)`: valida e emite novo access token.
   - Falha de credencial sempre com a mesma mensagem genérica, sem revelar se o e-mail existe.
3. `schemas/auth.schema.ts` com Zod para o corpo do login.
4. `middlewares/autenticar.ts`: lê o `Authorization: Bearer`, valida, e injeta `request.usuario` com `id`, `nome`, `papel`.
5. Middleware `exigirAdmin` para rotas restritas.
6. Rotas: `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`.
7. Refresh token entregue em cookie `httpOnly`, `sameSite: lax`, `secure` apenas em produção.
8. Tipagem do `request.usuario` via declaration merging do Fastify.

**Aceite:** login com credencial do seed devolve token; `GET /auth/me` com o token devolve os dados do usuário; sem token devolve 401; token expirado devolve 401; senha errada devolve 401 com a mesma mensagem de e-mail inexistente.

**Não fazer:** criar rota de cadastro público de usuário, recuperação de senha, ou qualquer endpoint de equipamento.

---

## Bloco 8 — Esqueleto do front

**Objetivo:** aplicação React de pé, com login e uma rota protegida.

**Passos**
1. Gerar o projeto Vite em `web/` (template React + TypeScript). Se o gerador criar `node_modules` ou lock dentro de `web/`, apagar os dois e rodar `npm install` na raiz para reintegrar ao workspace.
2. Tailwind CSS 4 via `@tailwindcss/vite`, instalado com `npm i -D tailwindcss @tailwindcss/vite -w web`, e `@import "tailwindcss";` no `index.css`. **Não** usar a configuração no formato do Tailwind 3.
3. `npm i react-router -w web` para rotas.
4. `services/api.ts`: wrapper de `fetch` com base URL vinda do env, injeção do header `Authorization`, e tentativa automática de refresh em resposta 401.
5. `hooks/useAuth.tsx`: contexto com `usuario`, `login`, `logout`, `carregando`. Access token em memória, nunca em `localStorage`.
6. `components/RotaProtegida.tsx`: redireciona para `/login` quando não autenticado.
7. `pages/Login.tsx`: formulário com e-mail e senha, estado de carregando, exibição de erro.
8. `pages/Inicio.tsx`: placeholder mostrando o nome do usuário logado e um botão de sair.
9. `.env.example` com `VITE_API_URL`.

**Aceite:** com API rodando, o login pelo formulário leva para `/inicio` mostrando o nome do usuário. Acessar `/inicio` sem login redireciona para `/login`. Recarregar a página mantém a sessão via refresh no cookie. Sair limpa o estado e volta para `/login`.

**Não fazer:** biblioteca de componentes, tema escuro, layout definitivo, tela de equipamento.

---

## Bloco 9 — Documentação e fechamento

**Objetivo:** outra pessoa consegue subir o projeto sozinha.

**Passos**
1. `README.md` com: descrição, stack, pré-requisitos, passo a passo do zero até a aplicação rodando, variáveis de ambiente explicadas uma a uma, e a lista de scripts de cada pasta.
2. Seção de solução de problemas com pelo menos: porta 5432 ocupada, container sem subir, migration fora de sincronia, erro de CORS, `node_modules` duplicado dentro de um workspace, e Prisma não encontrando o `.env`.
3. Deixar claro no README que `npm install` roda **apenas na raiz**, nunca dentro de `api/` ou `web/`.
4. Comentário no topo de `schema.prisma` apontando para o `ARQUITETURA.md`.
5. Commit final da fase.

**Aceite:** seguindo apenas o README em uma máquina limpa, chega-se ao login funcionando.

---

## Ordem de execução e verificação

| Bloco | Depende de | Verificação rápida |
|---|---|---|
| 1 Bootstrap | — | `npm ls -ws` |
| 2 Postgres | 1 | `docker compose ps` |
| 3 API | 1 | `GET /health` |
| 4 Schema | 2, 3 | `prisma studio` |
| 5 Constraints | 4 | INSERT conflitante recusado |
| 6 Seed | 5 | seed rodado duas vezes |
| 7 Auth | 6 | login devolve token |
| 8 Front | 7 | login pela tela |
| 9 Docs | 8 | subir do zero |

## Uso com o Antigravity

- Abrir o projeto e confirmar que `AGENTS.md` está sendo lido antes da primeira tarefa.
- Despachar **um bloco por vez**, colando o texto do bloco como tarefa.
- Usar modo de planejamento nos blocos 4, 5 e 7. São os que envolvem schema, SQL manual e segurança.
- Ler o plano proposto pelo agente antes de aprovar, conferindo contra o `ARQUITETURA.md`.
- Nos blocos 5 e 7, revisar o código gerado linha a linha, conforme a seção 11 do `ARQUITETURA.md`.
- Commitar ao fim de cada bloco. Bloco que não passou no critério de aceite não vira commit.

## O que fica para depois desta fase

CRUD de equipamentos, geração híbrida do tombo, importação por CSV, movimentações de saída e devolução, reservas, dashboard, QR Code e deploy. Tudo detalhado nas Entregas 1 a 5 do `ARQUITETURA.md`.
