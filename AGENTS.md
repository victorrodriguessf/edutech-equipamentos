# AGENTS.md

Instruções para agentes de IA que trabalham neste repositório.

## Projeto

Sistema interno de gestão de equipamentos do Senac Labs EduTech. Controla onde cada equipamento está, com quem está, em que condição, e as reservas de uso.

## Leitura obrigatória

Antes de qualquer alteração de código, leia **`ARQUITETURA.md`** na raiz. Ele define modelo de dados, regras de negócio, endpoints e escopo.

Antes de qualquer alteração de front-end, leia também **`DESIGN.md`**. Ele define tokens, tipografia, componentes e o que não pode aparecer na interface.

Em caso de conflito entre este arquivo e `ARQUITETURA.md`, vale `ARQUITETURA.md`.

## Stack fixa

React 19, TypeScript, Vite, Tailwind CSS 4, Node, Fastify, Prisma, PostgreSQL 16, Zod, JWT.

Não introduzir outra linguagem, outro ORM, outro framework de UI, biblioteca de componentes prontos ou state manager. Se achar que falta uma dependência, **pergunte antes de instalar**.

## Estrutura

Monorepo com npm workspaces.

```
package.json     raiz, define os workspaces e os scripts de atalho
api/             back-end, package.json próprio
web/             front-end, package.json próprio
```

Regras do monorepo:

- `node_modules` existe apenas na raiz. Nunca rodar `npm install` dentro de `api/` ou `web/`.
- Instalar dependência sempre pela raiz com `-w`: `npm i fastify -w api`.
- Dependência de ferramenta compartilhada (typescript, prettier) fica na raiz com `-D -w`.
- Não usar Lerna, Turborepo, Nx, pnpm ou yarn. Apenas npm workspaces.
- Comandos do Prisma rodam com `-w api`, porque ele resolve caminhos a partir da pasta do workspace.

## Regras que não podem ser quebradas

1. Nunca apagar tabela, registro ou arquivo que não esteja explicitamente autorizado na tarefa. Em caso de necessidade, parar e perguntar.
2. `situacao` de equipamento nunca é escrita direto. Muda apenas como consequência de uma movimentação, dentro de transação.
3. `movimentacoes` só recebe INSERT. Nunca UPDATE, nunca DELETE.
4. Todo cadastro de equipamento grava uma movimentação `CADASTRO` na mesma transação.
5. `tombo` é imutável após o cadastro.
6. Situação e condição são campos separados e independentes. Não unificar.
7. Exclusão é lógica (`ativo = false`), nunca DELETE físico.
8. Todo timestamp é `timestamptz` em UTC. Conversão para America/Fortaleza só na exibição.
9. Toda rota valida a entrada com Zod. Nenhuma rota confia no corpo recebido.
10. Nenhuma credencial no código ou no repositório. Sempre `.env`.

## Convenções

- Banco em `snake_case`, TypeScript em `camelCase`, mapeamento com `@map` no Prisma.
- Rota não contém regra de negócio: valida entrada, chama service, devolve resposta.
- Erro no formato `{ erro: string, detalhes?: unknown }` com HTTP status correto.
- Mensagens de interface, labels e textos de erro em português.
- Comentários e nomes de variáveis em português quando descreverem domínio (`equipamento`, `tombo`, `movimentacao`).

## Como trabalhar

- Uma tarefa por bloco do `PLANO-BASE.md`. Não adiantar blocos seguintes.
- Ao terminar um bloco, parar e reportar. Não emendar no próximo.
- Nunca alterar `schema.prisma` fora do bloco de schema sem avisar.
- Nunca rodar `prisma migrate reset` ou `prisma db push` sem pedir confirmação.
- Migration gerada deve ter o SQL mostrado antes de ser aplicada.

## Fora de escopo

Não implementar sem decisão explícita: aprovação de reserva, login para quem recebe equipamento, termo de responsabilidade digital, cadastro de acessórios, controle de licenças, integração com patrimônio do Senac, notificações por e-mail ou Teams, app nativo.

Se uma dessas aparecer no meio de outra tarefa, parar e sinalizar.
