# EduTech - Controle de Equipamentos

Sistema interno de gestão de equipamentos do Senac Labs EduTech. Controla onde cada equipamento está, com quem está, em que condição e as reservas de uso.

## Stack Utilizada
- **Front-end**: React 19, TypeScript, Vite, Tailwind CSS 4.
- **Back-end**: Node, Fastify, Prisma, PostgreSQL 16, Zod, JWT.

## Pré-requisitos
- Docker Desktop
- Node 22
- npm

## Como rodar o projeto do zero

Siga exatamente os passos abaixo na ordem apresentada:

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/victorrodriguessf/edutech-equipamentos.git
   cd edutech-equipamentos
   ```

2. **Instalar dependências**
   Rode na raiz do projeto:
   ```bash
   npm install
   ```
   > [!WARNING]
   > Nunca rode `npm install` dentro das pastas `api/` ou `web/`. Use sempre pela raiz.

3. **Configurar variáveis de ambiente**
   Crie os arquivos baseados nos exemplos:
   ```bash
   cp .env.example .env
   cp api/.env.example api/.env
   cp web/.env.example web/.env
   ```
   *Nota: No arquivo `api/.env`, gere duas chaves aleatórias seguras para JWT e preencha as senhas de banco e de seed de usuários (conforme a tabela abaixo).*

4. **Gerar chaves JWT**
   Rode o comando abaixo duas vezes para gerar senhas seguras (uma para `JWT_SECRET` e outra para `JWT_REFRESH_SECRET`):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

5. **Subir o Banco de Dados**
   ```bash
   docker compose up -d
   ```
   *Verifique se subiu corretamente com `docker compose ps` (deve mostrar "healthy").*

6. **Rodar migrations e popular o banco**
   ```bash
   npm run migrate -w api
   npm run db:seed -w api
   ```

7. **Subir os serviços**
   Em um terminal, inicie a API:
   ```bash
   npm run dev:api
   ```
   Em outro terminal, inicie o front-end:
   ```bash
   npm run dev:web
   ```

O sistema estará acessível em http://localhost:5173.

## Tabela de Variáveis de Ambiente

| Variável | Arquivo | Descrição |
|----------|---------|-----------|
| `POSTGRES_PASSWORD` | `.env` (Raiz) | Senha do usuário do banco de dados (Docker). |
| `DATABASE_URL` | `api/.env` | URL de conexão com o banco para o Prisma usar. |
| `JWT_SECRET` | `api/.env` | Chave secreta de assinatura do JWT Access Token. |
| `JWT_REFRESH_SECRET` | `api/.env` | Chave secreta independente para o JWT Refresh Token. |
| `PORT` | `api/.env` | Porta em que a API vai rodar (ex: 3333). |
| `CORS_ORIGIN` | `api/.env` | URL exata do front-end permitida no CORS (ex: `http://localhost:5173`). Não pode ser `*`. |
| `NODE_ENV` | `api/.env` | Ambiente atual (ex: `development` ou `production`). |
| `SEED_SENHA_ADMIN` | `api/.env` | Senha que será cadastrada para o usuário Administrador no banco. |
| `SEED_SENHA_OPERADOR` | `api/.env` | Senha que será cadastrada para o usuário Operador no banco. |
| `SEED_FORCAR_SENHA` | `api/.env` | Quando `true`, o seed reescreve a senha dos usuários existentes. **Nunca usar `true` fora do desenvolvimento.** |
| `VITE_API_URL` | `web/.env` | URL base para o front-end acessar a API (ex: `http://localhost:3333`). |

## Scripts Disponíveis

**Na Raiz:**
- `npm run dev:api`: Inicia o servidor Fastify.
- `npm run dev:web`: Inicia o Vite (React).
- `npm run build`: Roda o build de ambos os workspaces.
- `npm run lint`: Verifica a qualidade de código em ambos.
- `npm run test`: Roda a suíte de testes.

**No Workspace `api` (`-w api`):**
- `dev`, `build`, `start`: Execução e compilação da API.
- `migrate`: Roda o Prisma Migrate.
- `db:seed`: Roda o script de seed.
- `studio`: Abre o painel web do Prisma Studio.

**No Workspace `web` (`-w web`):**
- `dev`, `build`, `preview`: Inicialização e compilação do React via Vite.

## Importação de Equipamentos (Planilha do EduTech)

O sistema conta com um script de importação automatizada a partir da planilha oficial do EduTech. 

**Comando de execução:**
```bash
npm run db:importar -w api -- "/caminho/absoluto/para/planilha.xlsx"
```
Para testar a importação sem alterar o banco de dados, adicione a flag `--simular` antes do caminho.

**Formato esperado da planilha:**
- Deve ser um arquivo `.xlsx`.
- Os dados devem estar na aba chamada `Equipamentos`.
- O cabeçalho deve estar na **linha 4** (as 3 primeiras linhas são ignoradas).
- Colunas obrigatórias lidas pelo script: `Unidade de Origem`, `Unidade Destino`, `Dispositivo`, `Localização Atual`, `Chapa`, `Usuário ADMIN`, `Endereço MAC`, `Observação`.

**Mapeamento de Locais:**
O script mapeia a coluna `Localização Atual` estritamente para 8 locais autorizados no sistema:
- `Suporte EDUTECH` ➔ `SUPORTE-EDUTECH`
- `Biblioteca` ➔ `BIBLIOTECA`
- `Diretoria Regional` ➔ `DIRETORIA-REGIONAL`
- `Carreta Móvel TI e GESTÃO` ➔ `CARRETA-TI`
- `Carreta Móvel MODA e BELEZA` ➔ `CARRETA-MODA`
- `Mossoró` ➔ `MOSSORO`
- `Centro` ➔ `CENTRO`
- `Alecrim` ➔ `ALECRIM`

*Caso a `Localização Atual` não corresponda a nenhum desses valores ou esteja em branco, a linha será rejeitada no relatório.*

**Unidade Dona (`unidade_dona`)**
A coluna `Unidade de Origem` da planilha representa a unidade que é **dona** (responsável patrimonial) do equipamento, e não necessariamente o local onde ele se encontra fisicamente. Esse valor é salvo na coluna `unidade_dona` no banco de dados. Caso venha vazio, é preenchido com a string `"Não informada"`.

## Documentação e Regras do Projeto

Leia antes de fazer qualquer modificação:
- [**ARQUITETURA.md**](./ARQUITETURA.md): Fonte da verdade. Define o modelo de dados, as regras de negócio centrais, os endpoints da API e o escopo funcional.
- [**DESIGN.md**](./DESIGN.md): Guia de front-end. Define tokens visuais, tipografia, componentes e regras estritas do que não pode aparecer na interface.
- [**AGENTS.md**](./AGENTS.md): Regras de ouro para a condução do projeto, estrutura monorepo, regras que não podem ser quebradas e modo de trabalho.

## Problemas Comuns

### Porta 5432 já em uso por outro Postgres
- **Sintoma:** O comando `docker compose up -d` falha indicando porta 5432 indisponível ou "address already in use".
- **Solução:** Pare o serviço local do Postgres na sua máquina ou mude a porta exposta no `docker-compose.yml` para algo como `5433:5432` (e ajuste o `DATABASE_URL` no `.env` da API proporcionalmente).

### Container do banco não sobe ou fica unhealthy
- **Sintoma:** O `docker compose ps` mostra estado `exited`, ou não atinge `healthy`.
- **Solução:** Verifique se as variáveis `POSTGRES_PASSWORD` no `.env` raiz estão consistentes. Para resetar, limpe os volumes órfãos: `docker compose down -v`.

### Erro P1001 do Prisma, sem conexão com o banco
- **Sintoma:** Ao rodar migrate ou seed, o Prisma avisa `Can't reach database server`.
- **Solução:** Confirme se o Docker subiu corretamente (`docker compose ps`) e certifique-se que o usuário e a senha em `DATABASE_URL` no `api/.env` coincidem exatamente com os configurados no raiz.

### Migration fora de sincronia com o schema
- **Sintoma:** O Prisma avisa que existem migrations não aplicadas ou divergência de estado de schema (`drift`).
- **Solução:** Você pode forçar a sincronia resetando o banco com `npx prisma migrate reset -w api`, mas atenção: isso apaga todos os dados e roda o seed novamente.

### Erro de CORS ou cookie de refresh não chegando ao front
- **Sintoma:** Erro de CORS no console do navegador (DevTools) ao tentar fazer login ou atualizar a página.
- **Solução:** Garanta que a variável `CORS_ORIGIN` no `api/.env` tenha *exatamente* o protocolo e porta de onde o front-end está rodando (ex: `http://localhost:5173`), sem barra no final. A API não aceitará requisições de outras origens.

### CORS_ORIGIN ausente ou com wildcard derrubando a API na inicialização
- **Sintoma:** Ao iniciar a API, ela aborta a inicialização logando um ZodError `Wildcard (*) não é permitido no CORS_ORIGIN`.
- **Solução:** A aplicação exige explicitamente que o CORS não utilize curingas quando operando com `credentials: true`. Modifique o `api/.env` para colocar a origem exata.

### node_modules ou package-lock duplicado dentro de um workspace
- **Sintoma:** Erros exóticos do TypeScript, ESLint, React não carregando pacotes, ou lentidão absurda.
- **Solução:** O monorepo proíbe `node_modules` nas pastas filhas. Apague a pasta `node_modules` e o arquivo `package-lock.json` de dentro de `web/` ou `api/`, e em seguida rode `npm install` novamente na raiz do projeto.

### Prisma não encontrando o .env correto no monorepo
- **Sintoma:** Erro reclamando de variável vazia ou não subindo banco ao invocar Prisma da raiz.
- **Solução:** Todos os comandos de Prisma devem ser rodados explicitamente passando o workspace da API, exemplo: `npm run db:seed -w api`, para que o CLI do Prisma identifique os arquivos na pasta certa.

### Sessão caindo após troca dos segredos JWT
- **Sintoma:** Ao atualizar o código ou reiniciar, os usuários são deslogados.
- **Solução:** Se os valores de `JWT_SECRET` e `JWT_REFRESH_SECRET` foram trocados no `.env`, todas as sessões anteriores perdem validade e o usuário precisará fazer login novamente.

## Pendências de segurança (Entrega 5)

- Rate limit no endpoint de login.
- Revisar `npm audit` antes do deploy.
