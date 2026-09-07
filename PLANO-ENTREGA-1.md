# Plano de Implementação — Entrega 1

> Cobre a Entrega 1 do `ARQUITETURA.md`: cadastro e consulta de equipamentos.
> Cada bloco entrega API e tela da mesma funcionalidade, e termina com algo
> que abre no navegador. Executar em ordem, um por vez, parando ao fim de cada um.
>
> Leitura obrigatória antes de cada bloco: `ARQUITETURA.md`, `DESIGN.md` e `AGENTS.md`.

---

## Estado da base ao iniciar

| | |
|---|---|
| Equipamentos | 160 reais, importados da planilha do EduTech |
| Categorias | 14 |
| Locais | 8 |
| Situações presentes | 96 `PARADO`, 64 `EM_TRANSITO` |
| Pessoas | 5 fictícias do seed |
| Movimentações | 160, todas do tipo `CADASTRO` |

Todo bloco é testado contra esse volume, não contra dado inventado.

## Decisões desta fase

| Item | Decisão |
|---|---|
| Organização | Por funcionalidade: API e tela no mesmo bloco |
| Listagem | Busca em foco. A tela abre com o campo de busca focado e mostra os 25 itens mais recentes até haver busca ou filtro |
| Ações de movimentação | Fora do escopo. Saída, devolução, transferência e manutenção são da Entrega 2 |
| Estado de filtros | Guardado na URL, para preservar ao voltar da ficha e permitir compartilhar link |

---

## Bloco 1 — Estrutura da aplicação

**Objetivo:** o esqueleto de navegação onde todas as telas vão morar.

**Front**
1. Layout persistente: topo fixo de 56px com nome do sistema, navegação (Equipamentos, Pessoas, Locais, Categorias) e o nome do usuário com ação de sair.
2. Navegação com indicação clara da seção ativa. No celular, vira menu acessível por botão com rótulo, nunca ícone sozinho.
3. Componentes de estado, reutilizáveis em todas as telas seguintes:
   - `Carregando`: esqueleto de conteúdo, não spinner centralizado.
   - `EstadoVazio`: título, uma frase de orientação e, quando fizer sentido, ação primária.
   - `ErroCarregamento`: explica o que falhou e oferece "Tentar de novo".
4. `Pilula` (situação) e `Chip` (condição), conforme a seção 3 do `DESIGN.md`, com as cores exatas dos dois eixos.
5. `Tombo`: componente que renderiza o código em IBM Plex Mono com o tratamento da seção 4 do `DESIGN.md`.
6. Rota `/equipamentos` como página inicial após o login, substituindo o placeholder `/inicio`.

**Aceite**
- A navegação funciona entre as quatro seções, mesmo que as páginas ainda estejam vazias.
- A seção ativa é visualmente distinguível.
- No celular, o menu abre e fecha por teclado e por toque.
- Os componentes `Pilula` e `Chip` renderizam os 5 valores de situação e os 6 de condição com as cores corretas.

**Não fazer:** conteúdo real das páginas, dashboard, ícone sem rótulo, biblioteca de componentes.

---

## Bloco 2 — Listagem de equipamentos

**Objetivo:** a tela mais usada do sistema, respondendo "onde está e com quem".

**API**
1. `GET /equipamentos` com:
   - `busca`: casa parcialmente com tombo, tombo Senac, nome, marca, modelo e número de série. Sem distinção de maiúsculas nem de acento.
   - Filtros: `situacao`, `condicao`, `categoriaId`, `localId`, `unidadeDona`.
   - Paginação: `pagina` e `porPagina`, padrão 25, máximo 100.
   - Ordenação: `ordenarPor` (tombo, nome, atualizadoEm) e `direcao`.
   - Resposta: `{ itens, total, pagina, porPagina, totalPaginas }`.
2. Cada item traz tombo, tomboSenac, nome, categoria (prefixo e nome), situação, condição, local (código e nome), unidadeDona e pessoaAtual quando houver.
3. `senha_conta_cif` nunca entra nesta resposta, em nenhuma hipótese.
4. Índices conferidos: a busca não pode fazer varredura completa em 160 linhas hoje nem em 2000 depois.

**Front**
5. Página `/equipamentos` com o campo de busca recebendo foco ao abrir.
6. Enquanto não há busca nem filtro, mostrar os 25 mais recentes e um texto discreto informando o total do acervo.
7. Busca com atraso de 300ms entre digitação e requisição.
8. Filtros como seleção: situação, condição, categoria, local e unidade dona. Filtro ativo fica visível como marcador removível.
9. Estado dos filtros e da busca na query string da URL.
10. Tabela conforme a seção 5 do `DESIGN.md`: tombo, equipamento, situação, condição, local. Linha inteira clicável, levando à ficha.
11. No celular, cada item vira duas linhas: tombo e nome na primeira, situação e local na segunda. Sem rolagem horizontal.
12. Paginação com indicação de posição, por exemplo "26 a 50 de 160".
13. Estados vazios distintos: acervo sem nenhum equipamento, e busca sem resultado. O segundo oferece limpar os filtros.

**Aceite**
- Abrir a tela mostra 25 itens e o total de 160, com o cursor já na busca.
- Buscar por `42519` encontra o equipamento pela chapa.
- Buscar por `ntb` encontra os notebooks pelo tombo.
- Buscar por `oculos` encontra os óculos VR mesmo sem acento.
- Filtrar por situação `EM_TRANSITO` retorna 64 itens.
- Filtrar por unidade dona `Carreta Móvel TI e GESTÃO` retorna 42 itens.
- Aplicar filtros, abrir uma ficha e voltar preserva busca, filtros e página.
- Copiar a URL com filtros e abrir em outra aba reproduz o mesmo resultado.
- Navegação completa por teclado, com foco visível.

**Não fazer:** ações de movimentação, exportação, gráfico, seleção múltipla.

---

## Bloco 3 — Ficha do equipamento

**Objetivo:** tudo sobre um item em uma tela, sem rolagem para o essencial.

**API**
1. `GET /equipamentos/:tombo` com todos os campos, categoria, locais, pessoa atual e unidade dona. Sem `senha_conta_cif`.
2. `GET /equipamentos/:id/movimentacoes` com paginação, ordenado da mais recente para a mais antiga, trazendo tipo, data e hora, locais de origem e destino, pessoa, usuário responsável, situação após e observação.

**Front**
3. Página `/equipamentos/:tombo` com a hierarquia da seção 5 do `DESIGN.md`:
   - Tombo em destaque, pílula de situação alinhada à direita.
   - Nome do equipamento abaixo.
   - Linha de identificação: tombo Senac, número de série, MAC.
   - Dois painéis lado a lado: "Onde está" (local, unidade dona, pessoa atual quando houver) e "Condição" (chip e observação).
   - Bloco "Conta do aparelho" quando houver `email_conta`: e-mail com ação de copiar. A senha entra no Bloco 7.
   - Observações, quando houver.
   - Histórico de movimentações em lista cronológica.
4. Tombo Senac, série, MAC e e-mail copiáveis em um toque, com confirmação visível.
5. Tombo inexistente leva a uma tela de não encontrado com ação de voltar à listagem.
6. No celular, os painéis empilham e o essencial (tombo, situação, local, pessoa) fica visível sem rolagem.

**Aceite**
- Abrir `EDT-VRS-001` mostra dados, situação `EM_TRANSITO` e o histórico com a movimentação de cadastro.
- Um equipamento sem chapa exibe o campo vazio de forma clara, sem "null" nem espaço em branco.
- Copiar o tombo Senac funciona e dá retorno visual.
- Tombo inexistente mostra a tela de não encontrado, não um erro genérico.

**Não fazer:** botões de ação de movimentação, edição na própria ficha, revelação de senha.

---

## Bloco 4 — Cadastro de equipamento

**Objetivo:** cadastrar item novo com a geração híbrida do tombo.

**API**
1. `GET /equipamentos/proximo-tombo?categoriaId=` devolve a sugestão de tombo conforme a seção 6 do `ARQUITETURA.md`.
2. `POST /equipamentos` implementando as 7 regras do tombo híbrido:
   - Validação de formato `^EDT-[A-Z]{3}-\d{3}$` e prefixo existente.
   - Tombo duplicado bloqueia, informando qual equipamento já usa.
   - Salto de numeração é permitido, com aviso na resposta.
   - Consulta do sequencial e inserção na mesma transação.
   - Movimentação `CADASTRO` gravada na mesma transação.
3. Campos obrigatórios: nome, categoria, condição, situação, local e unidade dona. Opcionais: tombo Senac, marca, modelo, número de série, MAC, e-mail da conta, datas e observações.
4. Tombo Senac duplicado é bloqueado pelo índice único, com mensagem explicando qual equipamento o utiliza.

**Front**
5. Página `/equipamentos/novo`, alcançável por ação primária na listagem.
6. Ao escolher a categoria, o tombo é preenchido automaticamente e permanece editável.
7. Ajuda no contexto ao lado do campo de tombo, explicando o formato, conforme a heurística 10.
8. Tombo duplicado é apontado no campo, com o nome do equipamento que o usa e link para a ficha dele.
9. Salto de numeração mostra aviso não bloqueante, com opção de continuar.
10. Categoria, local, unidade dona, condição e situação são seleção, nunca digitação livre.
11. Erro de campo aparece junto do campo, associado por `aria-describedby`.
12. Ao salvar, ir para a ficha do equipamento criado, com realce discreto indicando que acabou de ser cadastrado.

**Aceite**
- Escolher a categoria Notebook sugere `EDT-NTB-022`, já que existem 21 notebooks.
- Escolher uma categoria sem itens sugere o sequencial `001`.
- Digitar um tombo já existente bloqueia e nomeia o equipamento que o usa.
- Digitar tombo fora do formato bloqueia com mensagem clara.
- Pular numeração salva, exibindo aviso.
- Cadastro concluído gera movimentação `CADASTRO`, verificável no histórico da ficha.
- Formulário navegável e enviável apenas por teclado.

**Não fazer:** cadastro em lote, importação por esta tela, upload de foto.

---

## Bloco 5 — Edição e reavaliação de condição

**Objetivo:** corrigir dados e registrar mudança de estado físico.

**API**
1. `PATCH /equipamentos/:id` para dados descritivos: nome, marca, modelo, série, MAC, e-mail da conta, tombo Senac, datas, observações, local padrão e unidade dona.
2. `PATCH` **nunca** altera `tombo` nem `situacao`. Tentativa devolve erro explicando o motivo.
3. `POST /equipamentos/:id/condicao` registra nova condição, gravando movimentação com a condição anterior na observação, conforme a regra 2 da seção 8 do `ARQUITETURA.md`.

**Front**
4. Ação de editar na ficha, levando a `/equipamentos/:tombo/editar`.
5. Campo de tombo visível e desabilitado, com explicação de por que não pode mudar.
6. Ação separada para reavaliar condição, com seleção da nova condição e campo de observação.
7. Confirmação antes de salvar mudança de condição, mostrando de qual valor para qual.
8. Após salvar, voltar à ficha com o campo alterado em realce que esvanece.

**Aceite**
- Editar o nome de um equipamento persiste e aparece na listagem.
- Tentar alterar tombo pela API devolve erro claro.
- Mudar a condição de `BOM` para `PRECISA_MANUTENCAO` gera movimentação registrando a condição anterior.
- A situação do equipamento não muda ao reavaliar a condição.

**Não fazer:** exclusão de equipamento, alteração de situação, edição em massa.

---

## Bloco 6 — Categorias, locais e pessoas

**Objetivo:** manter os cadastros de apoio sem depender do banco.

**API**
1. CRUD de `categorias`, restrito a `ADMIN`. Prefixo com três letras maiúsculas, único, imutável após criação. Categoria com equipamento vinculado não pode ser desativada sem aviso, e nunca excluída.
2. CRUD de `locais`, com `unidade` obrigatória.
3. CRUD de `pessoas`, com nome obrigatório e matrícula, setor, e-mail e telefone opcionais.
4. Exclusão sempre lógica, com `ativo = false`.
5. Nas três listagens, informar quantos equipamentos estão vinculados a cada registro.

**Front**
6. Páginas `/categorias`, `/locais` e `/pessoas`, com listagem, criação e edição.
7. Categoria mostra a contagem de equipamentos e o prefixo em fonte monoespaçada.
8. Local mostra unidade e a contagem de equipamentos presentes.
9. Desativar registro com vínculo pede confirmação informando quantos itens serão afetados.
10. Ações restritas ao admin ficam ocultas para o operador, não desabilitadas sem explicação.

**Aceite**
- Criar a categoria de teste, usá-la em um equipamento e tentar desativá-la mostra o aviso com a contagem correta.
- Tentar criar prefixo repetido é bloqueado.
- A listagem de locais mostra Suporte EDUTECH com 101 equipamentos.
- Operador não vê as ações de criação de categoria.

**Não fazer:** fusão de registros, transferência em massa entre locais, importação.

---

## Bloco 7 — Credenciais de conta de aparelho

**Objetivo:** guardar a senha da conta do aparelho com cifra, acesso restrito e auditoria.

Implementa a seção 7 do `ARQUITETURA.md` na íntegra. Pode ser adiado para a
Entrega 2 sem bloquear nada.

**API**
1. Módulo de cifra com AES-256-GCM, IV aleatório por registro e tag de autenticação. Chave em `CRIPTO_CHAVE`, 32 bytes em base64, adicionada ao `api/.env` e ao `api/.env.example` com o comando de geração comentado.
2. `senha_conta_cif` gravada apenas cifrada. Nenhum caminho grava texto puro.
3. `GET /equipamentos/:id/credencial`, restrito a `ADMIN`, decifra e devolve a senha.
4. Cada revelação grava em `credenciais_reveladas` com usuário, data, hora e IP, na mesma transação da resposta. Se a auditoria falhar, a senha não é devolvida.
5. Conferir que nenhum `select` de equipamento inclui o campo cifrado.
6. A senha nunca é registrada em log, nem em mensagem de erro.

**Front**
7. No bloco "Conta do aparelho" da ficha, a senha aparece mascarada, com ação explícita de revelar, visível apenas para admin.
8. Revelada, a senha pode ser copiada e volta a mascarar ao sair da tela.
9. Aviso discreto informando que o acesso fica registrado.
10. Tela de auditoria em `/auditoria`, restrita a admin, listando revelações com equipamento, usuário e data.

**Aceite**
- Admin revela a senha, e a revelação aparece na tela de auditoria.
- Operador não vê a ação de revelar, e a chamada direta à API devolve 403.
- A senha não aparece na listagem, na ficha antes de revelar, nem na exportação.
- Sem a `CRIPTO_CHAVE` correta, a decifra falha com erro claro em vez de devolver lixo.

**Não fazer:** rotação de senha, geração de senha, integração com gerenciador externo.

---

## Ordem e verificação

| Bloco | Depende de | Verificação |
|---|---|---|
| 1 Estrutura | fase base | navegar entre seções |
| 2 Listagem | 1 | filtrar `EM_TRANSITO` e obter 64 |
| 3 Ficha | 2 | abrir `EDT-VRS-001` |
| 4 Cadastro | 3 | sugestão `EDT-NTB-022` |
| 5 Edição | 4 | mudar condição e ver no histórico |
| 6 Apoio | 4 | Suporte EDUTECH com 101 itens |
| 7 Credenciais | 3 | revelar e conferir auditoria |

## Pontos que exigem revisão manual

- Geração do tombo em transação, e o comportamento com cadastro simultâneo
- Toda consulta de equipamento, conferindo que `senha_conta_cif` não vaza
- Cifra, decifra e o endpoint de revelação
- Qualquer trecho que escreva em `situacao` ou `tombo`
- Busca sem acento e sem distinção de maiúsculas, testada com "óculos" e "oculos"

## Uso com o Antigravity

- Um bloco por tarefa, colando o texto do bloco.
- Modo de planejamento nos blocos 4 e 7, que envolvem transação e segurança.
- Pedir captura de tela ao fim de cada bloco com interface.
- Commit ao fim de cada bloco aprovado. Bloco que não passou no aceite não vira commit.

## O que fica para a Entrega 2

Saída, devolução, transferência em dois passos, fluxo de manutenção, e todas as
ações que alteram a situação do equipamento.

---

*Senac Labs EduTech — Tecnologias Educacionais — Senac RN*
