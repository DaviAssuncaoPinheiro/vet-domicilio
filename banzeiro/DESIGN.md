# Banzeiro · Design System

Protótipo navegável (tudo mockado) de um sistema de operação de passeios para a **Encontro das Águas Turismo** (Manaus). Produto: **Banzeiro**. Mode: Operate. Clareza, leitura rápida, detalhes precisos.

## Referências (engenharia reversa)
1. Dashboard "Planned Absences": canvas cinza claro, moldura branca 32px de raio, rail de ícones à esquerda (ícones em botões circulares 40px), nav superior em pílulas com sombra suave, pilha de avatares, grade dia a dia com células arredondadas, fins de semana listrados, coluna "hoje" azul com linha tracejada vertical, blocos coloridos com chip branco de status ("• Approved").
2. Dashboard "logip": muito branco, KPIs inline separados por divisórias, ícone em círculo cinza, gráfico de linhas fino com tooltip escuro, feed de atividade à direita.
3. App financeiro: card escuro com textura sutil (fumaça), números grandes, barra de progresso fina, bottom nav flutuante escura em pílula com item ativo expandido (ícone + rótulo).
4. App condomínio: cards amarelo lima com botão circular preto de seta, bottom nav em pílula, cards de imagem com rótulo em vidro.
5. Agenda (projeto anterior do Davi): colunas por dia, cartões violeta e âmbar com chip branco "• Concluída", cabeçalho do dia atual em azul, botão primário preto.

## Tokens (em `src/index.css`, `@theme`)
Paleta da marca Encontro das Águas Turismo (Instagram oficial): preto profundo e dourado metálico, o escudo "EA" e o zigue-zague preto e dourado que lembra o encontro dos rios.
| Token | Valor | Uso |
|---|---|---|
| canvas | #EBE9E5 | fundo quente fora da moldura |
| frame | #F5F4F1 | moldura do app |
| surface | #FFFFFF | cards |
| sunken | #F1EFEA | células, inputs |
| ink / ink-2 / ink-3 / ink-4 | #14120F / #45403A / #8A847B / #BCB6AC | texto |
| negro | #12100D | botões primários, cards escuros, bottom nav |
| gold | #C9A15B (light #E8D3A5, tint #F6EEDD, deep #8C6A2E) | acento da marca |
| lime (legado) | #D7B36B | dourado claro em superfícies escuras |
| boat (lancha) | #B08640 · tint #F4EBD9 | passeios de lancha |
| land (terrestre) | #4F7B57 · tint #E4EEE4 | roteiros terrestres |
| transfer | #4E6C8A · tint #E4EBF3 | transfers |
| now | #14120F | dia de hoje, linha do agora, seleção |
| alert | #C4533B | pendências |
| ok | #2E8A5A | embarcado |

## Tipografia
- UI: **Onest Variable** (`font-sans`). Números, horários, códigos: **Geist Mono Variable** (`font-mono`, `tabular-nums`).
- Título de página: 30px / 600 / tracking -0.025em.
- Título de card: 17px / 600 / tracking -0.01em.
- Corpo: 14px / 450. Pequeno: 12.5px. Micro (chips, cabeçalhos de coluna): 11px / 600.
- KPI: 28 a 40px mono 500 tracking -0.03em.

## Forma e profundidade
- Raios: moldura 32, card 24, bloco/célula 14, chip e botão pílula 999, ícone-botão círculo 40px.
- Sombras (classes utilitárias em index.css): `shadow-soft` (cards), `shadow-pill` (pílulas e botões claros: borda interna branca + sombra curta), `shadow-lift` (drag, popovers), `shadow-dark` (elementos negros).
- Listrado indisponível: classe `.hatch`.
- Sem bordas pesadas. Separação por cor de superfície e sombra suave.

## Ícones
Phosphor (`@phosphor-icons/react`), peso `regular` 18px na UI, `fill` só no estado ativo da bottom nav. Nunca emoji.

## Copy (PT-BR)
- Pouco texto. Título com 1 a 3 palavras, no máximo uma linha de apoio.
- Palavras do dia a dia da operação: Embarcados, Aguardando, Faltou, Zarpa em, Pendências, Folga, Sem guia.
- Nunca: sincronização, integração, inteligente, automaticamente, IA, "detectou".
- Mono só para horários, assentos e códigos. Contagens em sans com números tabulares. Sem zero à esquerda.
- Mínima, direta, sem travessão (nunca usar "—" ou "–"). Use ponto, vírgula ou "·".
- Verbos de ação nos botões: "Conferir embarque", "Sugerir escala", "Resolver".
- Sem jargão de IA, sem "revolucione", sem exclamações.
- Números sempre com contexto curto: "18 de 24 a bordo".

## Movimento
- Framer Motion. Entrada de cards: opacity 0→1, y 8→0, 380ms, ease [0.22,1,0.36,1], stagger 40ms.
- Hover em pílulas: background muda 120ms. Pressionar: scale 0.97.
- KPIs contam de 0 até o valor em 700ms (componente `CountUp`).
- Pulso "ao vivo": anel 1.4s scale 1→2.2 com fade (classe `.live-dot`).
- Respeitar `prefers-reduced-motion`.

## Responsividade
- ≥1280: rail + nav superior + grids completos.
- 768 a 1279: rail oculto, nav superior com rolagem horizontal, grids em 2 colunas.
- <768: nav vira bottom nav flutuante escura em pílula (padrão ref 3/4), cards em coluna única, timelines com rolagem horizontal e primeira coluna fixa, sem rolagem horizontal da página.
- Alvos de toque ≥ 40px.

## Specs de componentes (da pesquisa)
**Scanner QR**: câmera full-bleed simulada, scrim rgba(10,12,20,.55) com recorte 260x260 raio 28 a ~42% da altura; cantos em L 36px, traço 4px, brancos, ficam verdes no sucesso e vermelhos no erro (150ms); linha de varredura 2px com brilho, 1.8s ease-in-out alternate; chip contador "8 de 12 a bordo"; sheet de resultado sobe 320ms cubic-bezier(.2,.9,.3,1), ícone 56px com check desenhado por stroke-dashoffset 300ms; sucesso fecha em 2.5s; erro sacode ±6px 360ms; offline: pílula âmbar "Sem internet · 3 na fila" com ponto pulsando, ao reconectar "3 sincronizados".
**Planta da lancha**: casco visto de cima com proa afunilada, assento 44px desktop / 34px mobile raio 10 com encosto, corredor central; estados: livre (sunken), reservado (boat 18%), a bordo (ok com check), selecionado (now com anel), bloqueado (hatch). Legenda em pílula. Tooltip escuro 12px. Assento que embarca faz varredura de cor 250ms.
**Linha do tempo**: coluna esquerda fixa 200px (embarcação, capacidade, barra de uso 4px), hora = 96px, linha 68px, blocos raio 14 altura 52 com tint + barra de acento 3px à esquerda, chip de status branco; linha do agora tracejada azul com ponto e pílula de horário; blocos passados com opacidade 60% e preenchimento de progresso.
**Sankey**: nós 10px raio 5, links em gradiente origem→destino opacidade .28, hover .6 e demais .08 (150ms), rótulos fora do nó, cabeçalhos de coluna 11px caixa alta, entrada desenhando da esquerda para direita 700ms.
**Escala**: linhas = guias (avatar, nome, idiomas, medidor de horas), colunas = dias; arrastar levanta com sombra e rotação 1.5deg; célula válida verde tint tracejada, inválida vermelha; conflito: anel alert + chip "Sem EN"; folga = hatch; bandeja "Sem guia" no topo; toast escuro "Movido para Qui · Desfazer".
