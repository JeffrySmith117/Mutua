# Design Spec — UI/UX Minimalista para Mútua-PI (Home/Dashboard & Tokens Globais)

- **Data**: 21 de Outubro de 2026
- **Status**: Aprovado
- **Escopo**: Reformulação dos Design Tokens Globais (`frontend/src/index.css`) e da Home do Associado (`DashboardPage.tsx` e `Dashboard.css`).

---

## 1. Visão Geral e Objetivos

O objetivo desta especificação é modernizar a interface do sistema Mútua-PI, aplicando princípios de design minimalista corporativo (*Executive Minimalist*):
1. **Redução de Ruído Cognitivo**: Eliminar gradientes densos, fundos multicoloridos e sobreposições de sombras ("efeito caixa de sapato").
2. **Hierarquia 60-30-10**:
   - 60% Neutros (Branco puro `#FFFFFF` e Slate suave `#F8FAFC`).
   - 30% Estrutura Institucional (Azul Petróleo Nobre `#163E59` / `#1B4D6E`).
   - 10% Foco de Conversão (Verde Esmeralda Sólido `#059669`).
3. **Escaneabilidade e Conversão Rápida**: Permitir que o associado visualize seu status ativo em menos de 2 segundos ou inicie uma nova reserva de sala ou equipamento com apenas 1 clique.

---

## 2. Design Tokens (`frontend/src/index.css`)

### 2.1 Paleta de Cores Minimalista
- `--cor-fundo`: `#F8FAFC` (fundo neutro suave)
- `--cor-superficie`: `#FFFFFF` (cards e containers elevados)
- `--cor-primaria`: `#163E59` (azul institucional da Mútua/CREA para títulos e destaques estruturais)
- `--cor-primaria-suave`: `#EBF3F8`
- `--cor-cta`: `#059669` (verde esmeralda focado em conversão de reservas)
- `--cor-cta-hover`: `#047857`
- `--cor-cta-suave`: `#ECFDF5`
- `--cor-texto-principal`: `#0F172A`
- `--cor-texto-secundario`: `#334155`
- `--cor-texto-mutado`: `#64748B`
- `--cor-borda`: `#E2E8F0`
- `--cor-borda-hover`: `#CBD5E1`

### 2.2 Tipografia e Espaçamentos
- `--fonte-principal`: `'Inter', system-ui, -apple-system, sans-serif`
- `--fonte-mono`: `'JetBrains Mono', monospace`
- Pesos permitidos: `400` (Regular), `500` (Medium), `600` (SemiBold). Eliminação de `800`/`900` pesados.
- Espaçamento estrutural aumentado para favorecer o respiro visual (`gap: 1.5rem` a `2.5rem`).

### 2.3 Sombras Sutis
- `--sombra-card`: `0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)`
- `--sombra-card-hover`: `0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.03)`
- `--raio-card`: `12px`
- `--raio-btn`: `8px`

---

## 3. Arquitetura da Dashboard (`DashboardPage.tsx` e `Dashboard.css`)

### 3.1 Camadas do Layout
1. **Header do Associado (Hero Minimalista)**:
   - Saudação personalizada: `Olá, {primeiroNome}` com subtitle descritivo de boas-vindas.
   - Status resumido em linha: `Você possui X reservas ativas`.
   - Grupo de CTAs rápidos no topo direito:
     - Botão Primário: `+ Nova Reserva` (Verde Esmeralda sólido) -> redireciona para `/ambientes`.
     - Botão Secundário: `Solicitar HUB` (Neutro elegante) -> redireciona para `/equipamentos`.
2. **Card de Próximo Agendamento**:
   - Card contextual exibido com destaque apenas quando o associado tiver reserva ativa (confirmada ou em andamento).
   - Mostra: badge de status minimalista (`Confirmada`), título do ambiente/equipamento, data/horário legível, protocolo e link de ação rápida para `Minhas Reservas`.
3. **Filtro em Chips/Pílulas Interativo**:
   - Filtros: `Todos`, `Salas de Reunião`, `Coworking`, `Auditório`, `Crea Tec HUB`.
   - Permite alternar instantaneamente os itens em destaque exibidos na página inicial.
4. **Catálogo de Destaques em Grade Limpa**:
   - Grade responsiva com 3 colunas (desktop) e 1 coluna (mobile).
   - Cards brancos com foto/ilustração técnica clean, especificações chave (capacidade, itens essenciais), badge de disponibilidade (`Disponível` / `Ocupado`) e botão direto `Reservar`.
5. **Rodapé de Apoio ao Associado**:
   - Links discretos de apoio: Regulamento de Uso dos Ambientes, Guia Crea Tec HUB e Contato/Suporte CREA-PI.

---

## 4. Plano de Verificação e Qualidade
1. **Inspeção Visual**: Verificar ausência de gradientes excessivos, contrastes WCAG AA/AAA em todos os textos.
2. **Responsividade**: Garantir layout perfeito em telas mobile (375px+), tablet e desktop (1280px+).
3. **Semântica e Acessibilidade**: Botões com estados de foco acessíveis, atributos `aria-*` adequados.
4. **Build e Teste**: Executar `npm run build` no frontend para garantir conformidade TypeScript sem erros.
