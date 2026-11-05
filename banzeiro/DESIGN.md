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

## Referência 6 (padrão atual, prevalece sobre o resto)
Imagem: scratchpad/ref6.jpg (app clínico, duas telas). Linguagem: texto simples, números grandes, cards de cor sólida, nada de ícone enfiado em canto de card, nada de chip com bolinha, nada de fonte mono. Componentes extraídos (medidas para tela de 390px; no desktop pode crescer ~10%):
- **Botão redondo de topo**: círculo 56px, bg surface, ícone 20px fill ink. Sem borda.
- **Número herói**: 60px, peso 600, tracking -0.04em, ink. Ao lado, pílula de variação: h-28, bg surface, 14px, seta 14px em ok, valor em semibold + palavra regular ("↑ 8% hoje"). Rótulo abaixo: 16px regular ink ("Saídas hoje"). À direita, FAB 56px preto com "+" branco.
- **Busca**: h-52, radius 18, bg surface, 1px line, lupa 20px ink-3 à esquerda, placeholder 16px ink-3.
- **Card de ação** (rolagem horizontal): ~250x240, radius 28, padding 20, cor sólida (gold-light, negro, sunken). Topo esquerdo: círculo 48px branco com ícone 20px ink. Título 21px semibold, linha 15px (ink-2 ou white/70 no escuro). Rodapé: rótulo 12px caixa alta tracking .04em à esquerda e botão redondo preto 52px com seta branca à direita (no card negro o botão é gold com seta negro). Pode ter linhas curvas finas decorativas bem suaves no fundo.
- **Card de estatística**: surface, radius 32, padding 24. Título 17px semibold. Dois números 50px semibold com pílula cinza (bg sunken, 14px, "↓ 11% semana") e rótulo 15px. Minibarras verticais 4px (ink e ok). Gráfico de 2 linhas suaves (stroke 3px, ink e gold), sem eixos pesados, linhas verticais de grade bem claras, balão preto radius 16 com texto branco 14px e setinha.
- **Faixa da semana**: título do mês 26px semibold; à direita, container branco radius 16 com pílula sunken "Semana" + seta. Card branco radius 28 com 7 colunas: sigla 13px ink-3 ("SEG"), número 18px medium; dia selecionado = bloco sunken radius 16 cobrindo sigla e número, com ponto 6px gold embaixo.
- **Agenda do dia**: título "Quarta 4" 21px semibold; à direita dois botões quadrados 44px radius 12 bg sunken com setas. Coluna de horas à esquerda: hora 16px semibold ("08:00"), linhas finas line entre horas. Card de evento: bg sunken (ou frame), radius 20, padding 14: avatar 52px redondo, nome 17px medium, linha 14px ink-3 (pode ter ícone 14px antes), horário 14px ink-3. Status no canto superior direito como ícone 24px: check em círculo ok (feito), relógio em círculo sunken (aguardando). Card em destaque: bg gold-tint com classe .dots e botão redondo preto 52px com seta à direita.
- **Barra inferior mobile**: barra negro radius 26 h-56, ícones 24px white/40 (ativo white fill), FAB gold 64px elevado no centro com anel canvas 6px (já no Shell).
- Fonte mono foi removida: a classe font-mono agora é Onest com algarismos tabulares.
