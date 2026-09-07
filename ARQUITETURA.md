# Sistema de Gestão de Equipamentos — Senac Labs EduTech

> Documento de arquitetura e escopo. Serve como contexto permanente para sessões de desenvolvimento assistido por IA. Toda geração de código deve respeitar o que está definido aqui. Divergência em relação a este documento é erro, não preferência.

---

## 1. Objetivo

Sistema interno para controlar os equipamentos sob guarda do Senac Labs EduTech: onde cada item está, com quem está, em que condição, e até quando ficará reservado.

Substitui o controle em planilha. Não substitui o patrimônio institucional do Senac, apenas se vincula a ele.

## 2. Contexto de negócio

- Cada equipamento possui um **tombo interno** no padrão `EDT-CAT-NNN` (ex.: `EDT-NTB-014`), definido no documento "Padrão de Tombamento de Equipamentos".
- O tombo interno é a chave natural do sistema. Nunca é reaproveitado, nem alterado após o cadastro.
- Cada equipamento pode ter também o **tombamento oficial do Senac**, campo opcional. Os dois números convivem.
- Categorias não são fixas no código. Ficam em tabela própria e podem ser cadastradas pela equipe.

### Quem usa

Apenas a equipe do EduTech opera o sistema. Quem recebe o equipamento emprestado (professor, aluno, outro setor) **não tem login**. Isso obriga a separar duas entidades:

- `usuarios`: equipe do EduTech, com autenticação
- `pessoas`: quem recebe equipamento, cadastro simples sem senha

### Reserva

Auto-serviço, sem fluxo de aprovação. A equipe cria a reserva diretamente e ela já vale.

## 3. Stack definida

| Camada | Tecnologia |
|---|---|
| Front-end | React 19, TypeScript, Vite, Tailwind CSS |
| API | Node, Fastify, TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL 16 |
| Autenticação | JWT com refresh token |
| Ambiente | Docker Compose |
| Versionamento | Git |

Restrições:

- Não introduzir Java, PHP, Python ou qualquer linguagem adicional.
- Não adicionar biblioteca nova sem necessidade justificada. Preferir o que já está no projeto.
- Não usar bibliotecas de componentes pesadas. Tailwind puro, componentes próprios.
- Não usar ORM alternativo, query builder paralelo ou SQL cru fora de migrations.

## 4. Estrutura do repositório

```
edutech-equipamentos/
├── docker-compose.yml
├── ARQUITETURA.md            (este documento)
├── README.md
├── api/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── server.ts
│       ├── env.ts
│       ├── routes/
│       ├── services/          (regra de negócio)
│       ├── schemas/           (validação com Zod)
│       ├── middlewares/
│       └── lib/
└── web/
    └── src/
        ├── main.tsx
        ├── routes/
        ├── pages/
        ├── components/
        ├── hooks/
        ├── services/          (chamadas à API)
        └── types/
```

Regra: rota não contém regra de negócio. Rota valida entrada, chama service, devolve resposta.

## 5. Modelo de dados

### Enums

```
SituacaoEquipamento  : EM_USO | PARADO | EMPRESTADO | EM_TRANSITO | EM_MANUTENCAO | BAIXADO
CondicaoEquipamento  : NOVO | BOM | REGULAR | PRECISA_MANUTENCAO | AVARIADO | INSERVIVEL
SituacaoReserva      : AGENDADA | EM_ANDAMENTO | DEVOLVIDA | ATRASADA | CANCELADA
TipoMovimentacao     : CADASTRO | SAIDA | DEVOLUCAO | TRANSFERENCIA_ENVIO |
                       TRANSFERENCIA_RECEBIMENTO | ENVIO_MANUTENCAO |
                       RETORNO_MANUTENCAO | BAIXA
PapelUsuario         : ADMIN | OPERADOR
```

**Situação e condição são campos distintos e independentes.** Situação descreve onde o equipamento está na operação. Condição descreve o estado físico dele. Um notebook pode estar `EMPRESTADO` e ao mesmo tempo com condição `PRECISA_MANUTENCAO`.

| Situação | Significado |
|---|---|
| `EM_USO` | Instalado e operando em local fixo |
| `PARADO` | Funcional, guardado, sem uso no momento |
| `EMPRESTADO` | Com uma pessoa, fora do local padrão |
| `EM_TRANSITO` | Enviado para outra unidade, ainda não recebido no destino |
| `EM_MANUTENCAO` | Fisicamente fora, em conserto |
| `BAIXADO` | Descartado, doado, furtado ou sem conserto |

| Condição | Significado |
|---|---|
| `NOVO` | Sem uso, recém adquirido |
| `BOM` | Funciona sem restrição |
| `REGULAR` | Funciona com desgaste ou limitação leve |
| `PRECISA_MANUTENCAO` | Defeito identificado, ainda não enviado ao conserto |
| `AVARIADO` | Não funciona, aguardando avaliação |
| `INSERVIVEL` | Sem conserto viável, candidato a baixa |

`PRECISA_MANUTENCAO` e `EM_MANUTENCAO` são coisas diferentes de propósito: o primeiro é o diagnóstico, o segundo é o item estando fora. A fila de manutenção pendente sai do cruzamento dos dois.

### Tabelas

**`usuarios`** — equipe do EduTech, com login
```
id                uuid PK
nome              text
email             text unique
senha_hash        text
papel             PapelUsuario
ativo             boolean default true
criado_em         timestamptz
```

**`pessoas`** — quem recebe equipamento, sem login
```
id                uuid PK
nome              text
matricula         text null
setor             text null
email             text null
telefone          text null
ativo             boolean default true
criado_em         timestamptz
```

**`categorias`** — cadastrável pela equipe
```
id                uuid PK
prefixo           char(3) unique       (NTB, DSK, MON...)
nome              text unique
descricao         text null
ativo             boolean default true
criado_em         timestamptz
```

Carga inicial obrigatória no seed:

| Prefixo | Nome |
|---|---|
| `NTB` | Notebook |
| `DSK` | Computador |
| `MON` | Monitor |
| `TAB` | Tablet |
| `VRS` | Óculos VR |
| `PRJ` | Projetor |
| `IMP` | Impressora |
| `I3D` | Impressora 3D |
| `CAM` | Câmera e vídeo |
| `DRN` | Drone |
| `STR` | Streaming e casa conectada |
| `PER` | Periférico |
| `RDE` | Rede e energia |
| `DIV` | Outros |

Definidas a partir do inventário real de 161 equipamentos. `CAM` inclui tripé e
acessórios de captura. `STR` cobre Chromecast e assistentes de voz.

**`locais`**
```
id                uuid PK
codigo            text unique          (SUP-EDUTECH, BIBLIOTECA, CARRETA-TI)
nome              text
unidade           text NOT NULL        (Alecrim, Centro, Zona Norte, Zona Sul,
                                        Barreira Roxa, Mossoró, Caicó, Assú)
tipo              text                 (laboratorio, deposito, sala, carreta, externo)
ativo             boolean default true
```

O acervo é distribuído por 8 unidades do Senac RN, e há dois locais itinerantes
(Carreta Móvel TI e GESTÃO, Carreta Móvel MODA e BELEZA). Por isso `unidade` é
obrigatória.

**`equipamentos`**
```
id                uuid PK
tombo             text unique NOT NULL     (EDT-NTB-014)
tombo_senac       text null                (patrimônio oficial, opcional)
nome              text NOT NULL
categoria_id      uuid FK -> categorias NOT NULL
marca             text null
modelo            text null
numero_serie      text null
endereco_mac      text null
email_conta       text null                (conta vinculada ao aparelho)
senha_conta_cif   text null                (senha cifrada, nunca em texto puro)
situacao          SituacaoEquipamento NOT NULL
condicao          CondicaoEquipamento NOT NULL
local_padrao_id   uuid FK -> locais NOT NULL
local_atual_id    uuid FK -> locais NOT NULL
pessoa_atual_id   uuid FK -> pessoas null
data_aquisicao    date null
garantia_ate      date null
observacoes       text null
ativo             boolean default true
criado_em         timestamptz
atualizado_em     timestamptz
```

**`reservas`**
```
id                  uuid PK
equipamento_id      uuid FK -> equipamentos
pessoa_id           uuid FK -> pessoas
local_destino_id    uuid FK -> locais
inicio              timestamptz
fim_previsto        timestamptz
fim_real            timestamptz null
finalidade          text
situacao            SituacaoReserva
condicao_saida      CondicaoEquipamento null
condicao_retorno    CondicaoEquipamento null
observacoes         text null
criado_por          uuid FK -> usuarios
criado_em           timestamptz
```

**`credenciais_reveladas`** — auditoria, apenas INSERT
```
id                uuid PK
equipamento_id    uuid FK -> equipamentos
usuario_id        uuid FK -> usuarios
data_hora         timestamptz
ip                text null
```

**`movimentacoes`** — log imutável, apenas INSERT
```
id                uuid PK
equipamento_id    uuid FK -> equipamentos
reserva_id        uuid FK -> reservas null
tipo              TipoMovimentacao
data_hora         timestamptz
local_origem_id   uuid FK -> locais null
local_destino_id  uuid FK -> locais null
pessoa_id         uuid FK -> pessoas null
usuario_id        uuid FK -> usuarios
situacao_apos     SituacaoEquipamento
condicao          CondicaoEquipamento null
observacao        text null
```

### Índices e constraints necessários

- `equipamentos.tombo` único
- `equipamentos.tombo_senac` único quando não nulo (índice único parcial)
- `equipamentos.situacao`, `equipamentos.condicao`, `equipamentos.categoria_id`, `equipamentos.local_atual_id` indexados
- `movimentacoes.equipamento_id` + `data_hora` indexados (consulta de histórico)
- `reservas.equipamento_id` + `inicio` + `fim_previsto` indexados
- Constraint de sobreposição de reserva no banco, usando `btree_gist`:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservas ADD CONSTRAINT reserva_sem_sobreposicao
EXCLUDE USING gist (
  equipamento_id WITH =,
  tstzrange(inicio, fim_previsto) WITH &&
) WHERE (situacao IN ('AGENDADA', 'EM_ANDAMENTO'));
```

A validação na API é para dar mensagem amigável. A garantia real fica no banco.

## 6. Cadastro de equipamentos

### Campos obrigatórios

| Campo | Regra |
|---|---|
| Nome | Texto livre, mínimo 3 caracteres |
| Categoria | Seleção na tabela `categorias`. Nunca campo digitado |
| Condição | Seleção no enum `CondicaoEquipamento` |
| Situação | Seleção no enum `SituacaoEquipamento`. Padrão sugerido: `PARADO` |
| Local | Seleção na tabela `locais`. Define `local_padrao_id` e `local_atual_id` |
| Tombo interno | Sugerido pelo sistema, editável (ver abaixo) |

### Campos opcionais

Tombamento Senac, marca, modelo, número de série, data de aquisição, garantia, observações.

Equipamento antigo frequentemente chega sem série ou nota fiscal. Nenhum desses campos pode bloquear o cadastro.

### Geração do tombo interno (modo híbrido)

1. Ao selecionar a categoria, o sistema consulta o maior sequencial existente naquela categoria e sugere o próximo, formatado com três dígitos: `EDT-{prefixo}-{seq}`.
2. O campo permanece **editável**. O operador pode sobrescrever, por exemplo para reaproveitar numeração de um inventário anterior.
3. Se o tombo digitado já existir, o cadastro é **bloqueado** com mensagem indicando qual equipamento o utiliza.
4. Se o tombo digitado pular números na sequência, o cadastro é **permitido com aviso**, não bloqueado.
5. Validação de formato obrigatória: `EDT-[A-Z]{3}-\d{3}`, e o prefixo precisa existir na tabela `categorias`.
6. A consulta do sequencial e a inserção rodam na **mesma transação**, para evitar tombo duplicado em cadastro simultâneo.
7. Após salvo, o tombo é **imutável**. Nenhum endpoint permite alterá-lo.

### Movimentação de cadastro

Todo cadastro grava, na mesma transação, uma movimentação do tipo `CADASTRO`, contendo local de destino, situação inicial, condição inicial e o usuário responsável.

Criar equipamento sem gravar essa movimentação é bug. O histórico de um item nunca começa vazio.

### Cadastro de categorias

Tela própria, restrita ao papel `ADMIN`. Prefixo com exatamente três letras maiúsculas, único, imutável após criação. Categoria com equipamento vinculado não pode ser excluída, apenas desativada.

## 7. Credenciais de conta de aparelho

Parte do acervo (óculos VR, tablets) tem conta de fabricante vinculada ao
aparelho. O técnico precisa da senha para operar o equipamento, então ela é
armazenada de forma reversível, não hasheada.

### Como é armazenada

- Cifra **AES-256-GCM**, com IV aleatório por registro e tag de autenticação.
- Chave em variável de ambiente `CRIPTO_CHAVE`, 32 bytes em base64, **nunca no
  banco e nunca no repositório**.
- A chave entra na rotina de backup, guardada separada do dump do banco. Perder
  a chave significa perder todas as senhas armazenadas.

### Como é acessada

1. `senha_conta_cif` **nunca** é retornada em listagem, busca, exportação ou na
   ficha do equipamento. Nenhum `select` amplo pode incluí-la.
2. A senha só sai por um endpoint dedicado, `GET /equipamentos/:id/credencial`,
   restrito ao papel `ADMIN`.
3. Toda revelação grava uma linha em `credenciais_reveladas` com usuário, data,
   hora e IP. A gravação da auditoria e a resposta ficam na mesma transação: se
   a auditoria falhar, a senha não é devolvida.
4. Na interface, a senha aparece mascarada com ação explícita de revelar, e volta
   a mascarar ao sair da tela. Nunca é pré-carregada.
5. `email_conta` não é segredo e circula normalmente, inclusive na busca.

### Fora de escopo aqui

Rotação automática de senha, geração de senha, integração com gerenciador
externo. Se as senhas passarem a ser individuais por aparelho, este desenho
continua válido sem alteração.

## 8. Regras de negócio invioláveis

1. **Situação do equipamento é sempre derivada de uma movimentação.** Nenhum endpoint permite alterar `situacao` diretamente. Alterar situação sem gravar movimentação é bug.
2. **Condição pode ser alterada por avaliação direta**, mas toda alteração de condição gera movimentação de registro com a condição anterior na observação.
3. **`movimentacoes` nunca sofre UPDATE nem DELETE.** Correção se faz com nova movimentação.
4. **Toda operação que altera equipamento e grava movimentação roda dentro de uma transação.** As duas coisas acontecem juntas ou nenhuma acontece.
5. **Tombo interno é imutável após o cadastro.**
6. **Equipamento com situação `EM_TRANSITO`, `EM_MANUTENCAO` ou `BAIXADO` não pode ser reservado nem emprestado.**
7. **Devolução exige informar a condição de retorno.** Se a condição retornar pior que a de saída, o sistema sugere registrar `PRECISA_MANUTENCAO`.
8. **Atraso é calculado, nunca marcado manualmente:** `fim_previsto < now() AND fim_real IS NULL`.
9. **Exclusão é lógica.** Nada é apagado do banco, usa-se `ativo = false` ou situação `BAIXADO`.
10. **Todo timestamp é `timestamptz`, gravado em UTC.** Conversão para America/Fortaleza acontece só na exibição.
11. **Transferência entre unidades tem dois passos.** `TRANSFERENCIA_ENVIO` coloca o equipamento em `EM_TRANSITO` e registra o local de destino. `TRANSFERENCIA_RECEBIMENTO` confirma a chegada, atualiza `local_atual_id` e devolve a situação anterior. Equipamento não muda de local sem confirmação de recebimento.
12. **Senha de conta de aparelho nunca trafega fora do endpoint dedicado**, nunca é logada, e nunca aparece em mensagem de erro.

## 9. Endpoints da API

```
POST   /auth/login
POST   /auth/refresh
GET    /auth/me

GET    /equipamentos                  filtros: situacao, condicao, categoria, local, busca
POST   /equipamentos
GET    /equipamentos/:tombo
PATCH  /equipamentos/:id
GET    /equipamentos/:id/movimentacoes
GET    /equipamentos/proximo-tombo    query: categoriaId

POST   /equipamentos/:id/saida        movimentação SAIDA
POST   /equipamentos/:id/devolucao    movimentação DEVOLUCAO
POST   /equipamentos/:id/manutencao   envio ou retorno
POST   /equipamentos/:id/transferencia/envio
POST   /equipamentos/:id/transferencia/recebimento
POST   /equipamentos/:id/condicao     reavaliação de estado físico
POST   /equipamentos/:id/baixa
GET    /equipamentos/:id/credencial   revela a senha, apenas ADMIN, auditado

GET    /reservas                      filtros: periodo, situacao, equipamento, pessoa
POST   /reservas
PATCH  /reservas/:id
DELETE /reservas/:id                  cancela, não apaga

GET    /categorias    POST /categorias    PATCH /categorias/:id
GET    /pessoas       POST /pessoas       PATCH /pessoas/:id
GET    /locais        POST /locais        PATCH /locais/:id

GET    /dashboard                     contadores e listas resumidas
GET    /exportar/equipamentos.csv
```

Busca por `:tombo` no GET de equipamento, porque é o que o QR Code e o operador usam.

## 10. Convenções

- Banco em `snake_case`, código TypeScript em `camelCase`, mapeamento via `@map` do Prisma.
- Validação de entrada com Zod em todas as rotas. Nenhuma rota confia no corpo recebido.
- Erros com formato padronizado: `{ erro: string, detalhes?: unknown }` e HTTP status correto.
- Nenhuma credencial no repositório. Tudo em `.env`, com `.env.example` versionado.
- Mensagens de interface em português.
- Commits pequenos, um por entrega.

## 11. Entregas

### Entrega 0 — Fundação

- Repositório inicializado com a estrutura de pastas definida
- `docker-compose.yml` com PostgreSQL e API
- `schema.prisma` completo, com todas as tabelas, enums e relacionamentos
- Primeira migration aplicada, incluindo a constraint de sobreposição
- Seed com as 10 categorias padrão, 3 locais, 5 pessoas, 2 usuários e 20 equipamentos fictícios
- `.env.example` e README inicial

**Critério de conclusão:** `docker compose up` sobe o ambiente e o Prisma Studio exibe as tabelas populadas.

### Entrega 1 — Cadastro e consulta

- Autenticação com JWT e refresh token
- CRUD de equipamentos, categorias, locais e pessoas na API
- Geração híbrida do tombo com validação de formato, unicidade e aviso de salto
- Movimentação `CADASTRO` gravada em transação
- Front: login, listagem com busca e filtros, formulário de cadastro, ficha do equipamento
- Campos `endereco_mac` e `email_conta` no cadastro e na ficha
- Importação do inventário real: 161 equipamentos, 8 unidades, tratando chapa
  ausente (13 itens), chapa duplicada e categoria inferida pelo nome do dispositivo

**Critério de conclusão:** cadastrar um equipamento pela interface com tombo sugerido automaticamente, localizá-lo na busca e abrir a ficha com a movimentação de cadastro no histórico.

### Entrega 2 — Empréstimo e devolução

- Endpoints de saída e devolução, com transação e gravação em `movimentacoes`
- Situação, local e pessoa atual atualizados como consequência da movimentação
- Fluxo de manutenção: envio e retorno
- Transferência entre unidades em dois passos, com situação `EM_TRANSITO`
- Armazenamento cifrado da senha de conta, endpoint de revelação restrito a
  ADMIN e tabela de auditoria
- Reavaliação de condição com registro do estado anterior
- Front: ações na ficha do equipamento e histórico de movimentações

**Critério de conclusão:** emprestar um item, ver a situação virar `EMPRESTADO` com a pessoa vinculada, devolver, e encontrar os dois eventos no histórico com data e hora.

### Entrega 3 — Reservas

- CRUD de reservas com período
- Validação de sobreposição na API e constraint no banco
- Cálculo de atraso
- Vínculo entre reserva e movimentação de saída
- Front: agenda por período, criação de reserva com feedback imediato de conflito, tela de atrasados

**Critério de conclusão:** o sistema recusa reserva conflitante e informa qual reserva ocupa o período.

### Entrega 4 — Operação em campo

- Dashboard com contadores por situação e por condição
- Fila de manutenção pendente: itens com condição `PRECISA_MANUTENCAO` e situação diferente de `EM_MANUTENCAO`
- Geração de etiqueta com QR Code apontando para a ficha
- Leitura de QR pela câmera do celular
- Interface responsiva para uso no celular
- Exportação para CSV

**Critério de conclusão:** escanear a etiqueta pelo celular e abrir a ficha do equipamento.

### Entrega 5 — Publicação e continuidade

- Deploy em ambiente de homologação
- Variáveis de ambiente organizadas por ambiente
- Rotina de backup do banco definida e testada
- README com instalação, execução e deploy passo a passo
- Documento de operação para a equipe

**Critério de conclusão:** outra pessoa sobe o projeto seguindo apenas o README.

## 12. Pontos que exigem revisão manual

Código gerado por IA nestes trechos precisa ser lido linha a linha antes do commit:

- Geração do tombo dentro de transação, e o comportamento em cadastro simultâneo
- Validação de sobreposição de período e a constraint `EXCLUDE`
- Qualquer comparação ou conversão de data e fuso horário
- SQL das migrations, sempre lido antes de aplicar
- Geração e renovação de token, e o tratamento de expiração
- Transações que alteram equipamento e gravam movimentação
- Qualquer trecho que escreva nos campos `situacao` ou `tombo`
- Cifra e decifra da senha de conta, e o endpoint de revelação
- Todo `select` de equipamento, conferindo que `senha_conta_cif` não vaza

Cenários de teste obrigatórios para sobreposição de reserva: sobreposição total, parcial no início, parcial no fim, período contido dentro de outro, e períodos adjacentes que não se sobrepõem.

Cenários obrigatórios para o tombo: sugestão em categoria vazia, sugestão em categoria com itens, tombo duplicado, tombo com formato inválido, prefixo inexistente, e salto de numeração.

## 13. Fora de escopo

Não implementar sem decisão explícita:

- Fluxo de aprovação de reserva
- Login para quem recebe equipamento
- Assinatura digital de termo de responsabilidade
- Cadastro de acessórios como itens independentes
- Controle de licenças de software
- Integração com o sistema de patrimônio do Senac
- Rotação ou geração automática de senha de conta de aparelho
- Controle da rede acadêmica por unidade (colunas descartadas na importação)
- Notificações automáticas por e-mail ou Teams
- Aplicativo nativo

Se uma dessas aparecer no meio de outra tarefa, parar e sinalizar em vez de implementar.

---

*Senac Labs EduTech — Tecnologias Educacionais — Senac RN*
