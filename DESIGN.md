# Design System Minimalista — Mútua-PI & Crea Tec HUB

> **Regra Fundamental**: Siga sempre as regras do DESIGN.md em qualquer alteração de interface.

Inspirado em design editorial digital contemporâneo (estilo Landra/Craft): alta legibilidade, contraste intencional, ausência de sombras pesadas ou ruído visual, linhas ultra-finas (*hairlines*) e componentes em pílula (*pill-shaped*).

---

## 1. Paleta de Cores (60-30-10 Minimalista)

### Base Clara & Superfícies (60%)
- **Fundo da Página (`--bg`)**: `#FAFAFA` (Neutro limpo, descanso visual)
- **Superfície dos Cards (`--card`)**: `#FFFFFF` (Branco puro)
- **Fundo Elevado / Input (`--card-subtle`)**: `#F4F4F5`
- **Divisores e Bordas (`--line`)**: `rgba(15, 23, 42, 0.08)` (1px hairline)
- **Borda de Foco (`--line-focus`)**: `rgba(5, 150, 105, 0.4)`

### Escala de Tons Neutros e Tipografia (30%)
- **Texto Principal (`--fg`)**: `#09090B` (Preto profundo, alto contraste)
- **Texto Secundário / Muted (`--fg-muted`)**: `#52525B` (Legibilidade de apoio, 60% opacidade)
- **Texto Terciário / Placeholder (`--fg-subtle`)**: `#A1A1AA`
- **Texto Invertido (`--fg-invert`)**: `#FFFFFF`

### 1 Única Cor de Destaque / Accent (10%)
- **Destaque Principal (`--accent`)**: `#059669` (Verde Esmeralda Mútua/CREA institucional vibrante)
- **Destaque Hover (`--accent-hover`)**: `#047857`
- **Destaque Suave / Pill BG (`--accent-subtle`)**: `#ECFDF5`
- **Destaque Texto em Pill (`--accent-text`)**: `#065F46`

---

## 2. Tipografia

- **Família Única**: `'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Pesos Utilizados**:
  - `400` (Regular): Textos corridos, descrições e parágrafos.
  - `500` (Medium): Botões, títulos de seções, cabeçalhos de cards e destaques.
- **Hierarquia e Tracking**:
  - **Hero / Título de Impacto**: `clamp(36px, 4.5vw, 64px)`, `line-height: 0.95`, `letter-spacing: -0.045em`, `font-weight: 500`.
  - **Títulos de Seção (H2)**: `24px` a `32px`, `line-height: 1.1`, `letter-spacing: -0.03em`.
  - **Títulos de Card (H3)**: `18px`, `line-height: 1.25`, `letter-spacing: -0.02em`.
  - **Corpo (Body)**: `14px` a `15px`, `line-height: 1.5`, `letter-spacing: -0.01em`.
  - **Micro-labels / Pills / Tags**: `11px` a `12px`, `text-transform: uppercase`, `letter-spacing: 0.04em`, `font-weight: 500`.
  - **Dados e Métricas**: `font-variant-numeric: tabular-nums`.

---

## 3. Escala de Espaçamento

Baseada em módulo 4/8px:
- `--pad-xs`: `4px`
- `--pad-sm`: `8px`
- `--pad-md`: `16px`
- `--pad-lg`: `24px`
- `--pad-xl`: `32px`
- `--pad-2xl`: `48px`
- `--pad-3xl`: `64px`
- `--pad-container`: `clamp(16px, 3vw, 48px)`
- `--max-width`: `1280px`

---

## 4. Raios de Borda (Border Radius)

- **Pílula Completa (`--radius-pill`)**: `100px` (Botões, chips de status, barras de busca, badges).
- **Cards & Painéis (`--radius-card`)**: `20px` (Cantos refinados, sem aspecto pontiagudo).
- **Inputs & Elementos Internos (`--radius-element`)**: `12px`.

---

## 5. Estilos de Botão & Controles Interativos

- **Altura Padrão**: `44px` (touch-friendly e ergonômico).
- **Altura Compacta (`.btn-sm`)**: `36px`, `font-size: 12px`, `padding: 0 16px`.
- **Raio de Borda**: Sempre `100px` (estilo pílula).

### Variantes:
1. **`.btn-accent` (Ação Primária)**: Fundo `--accent` (`#059669`), texto `#FFFFFF`, foco suave. No hover: leve elevação `translateY(-1px)`.
2. **`.btn-dark` (Ação Executiva)**: Fundo `#09090B`, texto `#FFFFFF`.
3. **`.btn-ghost` / `.btn-outline` (Ação Secundária)**: Fundo transparente, borda `1px solid var(--line)`, texto `--fg`. No hover: fundo `--card-subtle`.
4. **Input em Pílula (`.prompt-pill`)**: Barra de busca/filtro com `border-radius: 100px`, borda sutil `1px solid var(--line)` e ícone minimalista integrado.

---

## 6. Regras de Layout & Composição

1. **Adeus Sombras Pesadas**: Nunca use `box-shadow` difuso e escuro. Use bordas *hairline* de 1px (`rgba(15, 23, 42, 0.08)`) com fundo branco sobre cinza suave.
2. **Espaço em Branco é Conteúdo**: Respiro generoso entre seções (mínimo 48px a 64px). Nada de aglomeração de cards.
3. **Pílulas de Status Monocromáticas ou com Dot**:
   - Em vez de fundos coloridos gritantes, use badges sutis com dot colorido indicador:
     - `• Disponível` (dot verde)
     - `• Em Uso` (dot âmbar)
     - `• Reservado` (dot azul)
4. **Dock / Barra Flutuante**: Ações principais e navegações contextuais podem usar docks translúcidos em pílula (`backdrop-filter: blur(14px)`).
5. **Transições**: Sempre rápidas e suaves: `transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1)`.
