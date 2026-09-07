# Guia de Design — Sistema de Equipamentos EduTech

> Direção visual e de interação. Vale para todo código de front-end deste repositório.
> Leitura obrigatória antes de criar qualquer tela.

---

## 1. Quem usa e em que situação

Operador do EduTech, em três contextos reais:

1. **Na mesa**, cadastrando equipamento e conferindo inventário. Sessão longa, muitos dados na tela.
2. **No depósito ou laboratório**, celular na mão, procurando um item específico. Sessão de segundos, muitas vezes com uma mão só.
3. **No balcão**, com um professor esperando, registrando saída ou devolução. Precisa ser rápido e sem erro.

Nenhum desses momentos pede impressão visual. Todos pedem legibilidade, densidade correta e confirmação clara do que aconteceu.

**Consequência de design:** a interface é uma ferramenta de trabalho, não uma vitrine. Fundo claro, alto contraste, informação densa e organizada.

## 2. Conceito

**Ficha de inventário.** O sistema é a versão digital da etiqueta colada no equipamento e da ficha de patrimônio. O vocabulário visual vem daí: códigos monoespaçados, campos rotulados, tabelas de conferência, carimbo de status.

Isso dá personalidade sem recorrer a efeito. Um `EDT-NTB-014` em fonte monoespaçada, com o peso e o espaçamento certos, é mais característico do que qualquer gradiente.

## 3. Cor

Paleta base, cinco valores:

| Token | Hex | Uso |
|---|---|---|
| `--papel` | `#F6F7F8` | Fundo da aplicação |
| `--superficie` | `#FFFFFF` | Cartões, tabelas, campos |
| `--tinta` | `#14181D` | Texto principal |
| `--tinta-fraca` | `#5B6672` | Texto secundário, rótulos |
| `--linha` | `#DFE4E9` | Bordas e divisores |

Cor institucional, usada com parcimônia:

| Token | Hex | Uso |
|---|---|---|
| `--azul` | `#12467E` | Ação primária, links, foco |
| `--azul-claro` | `#EAF1F9` | Fundo de seleção e estado ativo |

O azul aparece em botão primário, link e anel de foco. Em nenhum outro lugar. Interface de trabalho não precisa de cor decorativa.

### Cor de status é o núcleo do sistema

Este é o único lugar onde vale gastar ousadia. O sistema tem dois eixos independentes, situação e condição, e o operador precisa ler os dois de relance. Cada eixo ganha uma **forma diferente**, para que a distinção não dependa só de cor:

**Situação** aparece como pílula sólida:

| Situação | Fundo | Texto |
|---|---|---|
| Em uso | `#E3F0E8` | `#1C6B3C` |
| Parado | `#EDEFF2` | `#4A5560` |
| Emprestado | `#FDF0DA` | `#8A5A00` |
| Em manutenção | `#FBE4DC` | `#9A3412` |
| Baixado | `#E5E7EA` | `#6B7280` com texto riscado |

**Condição** aparece como chip contornado, com marcador circular à esquerda:

| Condição | Marcador |
|---|---|
| Novo | `#1C6B3C` |
| Bom | `#3F8F5F` |
| Regular | `#B78103` |
| Precisa de manutenção | `#C2410C` |
| Avariado | `#B02A1E` |
| Inservível | `#6B7280` |

Regra: pílula sólida sempre significa situação, chip contornado sempre significa condição. Nunca inverter. Todos os pares de cor passam em contraste 4.5:1, e a forma diferencia os eixos para quem não distingue matiz.

## 4. Tipografia

Duas famílias, papéis distintos:

- **IBM Plex Sans** para texto e interface. Tem origem industrial e desenho menos neutro que as sans padrão de dashboard, o que dá caráter sem custar legibilidade.
- **IBM Plex Mono** para tudo que é código: tombo, número de série, patrimônio Senac, timestamps do histórico.

O uso do monoespaçado é semântico, não decorativo. Se é um código que alguém vai comparar com uma etiqueta física, é mono. Se é linguagem, é sans. Isso resolve um problema real: comparar `EDT-NTB-014` na tela com a etiqueta em fonte proporcional é mais lento e mais sujeito a erro.

### Escala

Razão de 1.25, base de 16px:

| Nome | Tamanho | Peso | Uso |
|---|---|---|---|
| `titulo` | 31px | 600 | Título de página |
| `secao` | 25px | 600 | Cabeçalho de bloco |
| `destaque` | 20px | 500 | Nome do equipamento na ficha |
| `corpo` | 16px | 400 | Texto padrão |
| `apoio` | 14px | 400 | Rótulo de campo, célula de tabela |
| `nota` | 13px | 400 | Metadado, timestamp |

Entrelinha 1.5 no corpo, 1.2 nos títulos. Largura máxima de texto corrido em 70 caracteres.

O tombo tem tratamento próprio: mono, 15px, peso 500, `letter-spacing: 0.02em`.

## 5. Layout

**Inventário é lista, não grade de cartões.** Grade de cartões idênticos é o retrato do layout gerado automaticamente, e além disso desperdiça espaço num contexto em que a pessoa compara itens.

```
┌──────────────────────────────────────────────────┐
│ [logo] Equipamentos  Reservas  Pessoas    [Você] │  topo fixo, 56px
├──────────────────────────────────────────────────┤
│ Equipamentos                      [+ Cadastrar]  │
│ ┌─ busca ───────────┐ [Situação ▾] [Categoria ▾] │  filtros persistentes
│                                                   │
│ TOMBO         EQUIPAMENTO      SITUAÇÃO   LOCAL   │
│ ──────────────────────────────────────────────── │
│ EDT-NTB-014   Dell Latitude    ●Emprest.  LAB01   │
│ EDT-MON-007   LG 24MK430       ●Em uso    LAB01   │
│ EDT-PRJ-002   Epson S41+       ○Parado    DEPOSITO│
└──────────────────────────────────────────────────┘
```

- Alinhamento à esquerda em tudo. Nada centralizado exceto estado vazio.
- Tombo sempre na primeira coluna, é a chave de leitura.
- No celular, a tabela vira lista de linhas com tombo e nome na primeira linha, situação e local na segunda. Sem scroll horizontal.
- Densidade: 44px de altura por linha, suficiente para toque e ainda compacto.

A **ficha do equipamento** é a única tela com hierarquia forte:

```
EDT-NTB-014                         [Emprestado]
Notebook Dell Latitude 3440
Patrimônio Senac 45821 · Série ABC123456

┌ Onde está ───────────┐ ┌ Condição ────────────┐
│ LAB01                │ │ ○ Bom                │
│ Com Maria Silva      │ │ Avaliado em 12/03    │
│ Devolução 14/03      │ │                      │
└──────────────────────┘ └──────────────────────┘

[Devolver]  [Transferir]  [Enviar para manutenção]

Histórico
12/03 14:22  Saída para Maria Silva          LAB01 → SALA-A2
28/02 09:10  Devolução de João Costa         SALA-B1 → LAB01
```

## 6. Componentes

**Botões.** Três níveis apenas: primário (azul sólido), secundário (contorno), e destrutivo (texto vermelho, sem fundo). Altura 40px, raio 6px. Nada de raio grande nem sombra colorida.

**Campos.** Rótulo acima, em `apoio`, cor `--tinta-fraca`, em caixa de sentença. Borda `--linha`, 1px. No foco, borda azul e anel de 3px em `--azul-claro`. Mensagem de erro abaixo do campo, nunca só borda vermelha.

**Tabela.** Cabeçalho em `--tinta-fraca`, peso 500, sem caixa alta. Divisores horizontais apenas. Linha inteira clicável, com fundo `--azul-claro` no hover.

**Sombra.** Uma só, discreta: `0 1px 2px rgba(20,24,29,.06)`. Aplicada em elementos flutuantes, nunca em cartão estático.

**Raio.** 6px em controles, 8px em painéis. Um valor por categoria de elemento, não o mesmo em tudo.

## 7. Onde o glass entra

Um lugar, e por razão funcional: o **leitor de QR Code** na Entrega 4. A câmera ocupa a tela inteira e o painel de instrução flutua sobre a imagem ao vivo. Ali a translucidez serve para manter o enquadramento visível enquanto o texto é legível:

```css
background: rgba(20, 24, 29, .55);
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,.15);
```

Fora desse contexto, nenhum elemento translúcido. Em tela de dados, blur atrás de texto é ruído.

## 8. Movimento

Motion responde a ação, nunca acontece sozinho.

- Transição de estado em 120ms, `ease-out`. Hover, foco, abertura de menu.
- Confirmação de ação: o item alterado recebe um realce de fundo que esvanece em 800ms. Isso substitui o toast em operações de linha e mostra exatamente o que mudou.
- Nada de entrada com fade e deslize em seções, carrossel automático, parallax ou elemento pulsante.
- `prefers-reduced-motion: reduce` desliga tudo isso.

## 9. As dez heurísticas, aplicadas

1. **Visibilidade do estado.** Situação e condição visíveis em toda listagem e no topo da ficha. Ação em andamento desabilita o botão e mostra rótulo de progresso.
2. **Correspondência com o mundo real.** Vocabulário do EduTech: tombo, ficha, empréstimo, devolução, baixa. Nunca "registro", "entidade" ou "submeter".
3. **Controle e liberdade.** Toda ação de movimentação pede confirmação com resumo do que vai acontecer. Como o log é imutável, correção é feita por nova movimentação, e a interface deve explicar isso em vez de fingir que dá para editar.
4. **Consistência.** Um verbo por ação em todo o sistema. O botão "Devolver" gera a confirmação "Devolvido" e a entrada "Devolução" no histórico.
5. **Prevenção de erro.** Tombo sugerido automaticamente. Equipamento em manutenção não aparece na lista de reserváveis. Data final anterior à inicial é bloqueada no campo, não só no envio.
6. **Reconhecer em vez de lembrar.** Categoria, local e pessoa são sempre seleção, nunca digitação livre. Busca por tombo aceita o código parcial.
7. **Flexibilidade.** Busca com foco automático ao abrir a listagem. Enter envia formulário. Filtros preservados ao voltar da ficha.
8. **Minimalismo.** Cada tela responde a uma pergunta. A listagem responde "onde está e com quem". Nada de gráfico decorativo ou contador que ninguém usa.
9. **Erros úteis.** "Este tombo já pertence ao EDT-NTB-014" em vez de "violação de restrição única". Erro sempre diz o que fazer em seguida.
10. **Ajuda no contexto.** O formato do tombo é explicado ao lado do campo, não em página de documentação separada.

## 10. Texto da interface

- Caixa de sentença sempre. Nada de caixa alta em rótulo.
- Botão diz o que acontece: "Registrar devolução", não "Confirmar".
- Erro sem pedido de desculpas e sem vaguidão.
- Estado vazio convida à ação: "Nenhum equipamento cadastrado ainda. Cadastre o primeiro para começar o inventário."
- Nada de exclamação, nada de "Ops", nada de emoji na interface.

## 11. Proibido

Estes itens não entram, mesmo que pareçam bonitos isoladamente:

- Fundo escuro com gradiente, brilho ou luz difusa
- Cartão translúcido fora do leitor de QR
- Rótulo em caixa alta com espaçamento aumentado acima de título
- Seta `→` dentro de texto de botão
- Metadados unidos por ponto médio como enfeite
- Sombra colorida, brilho neon, borda com gradiente
- Grade de cartões idênticos para listar equipamento
- Animação de entrada em seções ao rolar a página
- Ícone sem rótulo em ação destrutiva
- Biblioteca de componentes pronta

## 12. O que entra no Bloco 8

O esqueleto do front implementa apenas a base do sistema, não telas de equipamento:

1. Tokens de cor, tipografia, espaçamento e raio declarados como CSS custom properties em `index.css`, dentro de `@theme` do Tailwind 4.
2. Fontes IBM Plex Sans e IBM Plex Mono carregadas.
3. Componentes base: `Botao`, `Campo`, `Rotulo`, `MensagemErro`.
4. Tela de login usando esses componentes.
5. Foco visível em todos os elementos interativos, testado com navegação por teclado.

A tela de login é simples e centralizada, porque é a única tela do sistema sem dados: caixa de 380px, nome do sistema em `secao`, dois campos, botão primário de largura total. Sem ilustração, sem cartão flutuando sobre imagem, sem coluna lateral decorativa.

---

*Senac Labs EduTech — Tecnologias Educacionais — Senac RN*
