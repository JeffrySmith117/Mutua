# UI/UX Minimalista da Dashboard e Tokens Globais — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reformular a interface da Home/Dashboard e os tokens globais de estilo do Mútua-PI para um padrão minimalista corporativo (*Executive Minimalist*), com foco em respiro visual, contraste 60-30-10 e agendamento rápido em poucos cliques.

**Architecture:** Atualização dos tokens de cores e sombras em `frontend/src/index.css`, reestruturação modular dos componentes da `DashboardPage.tsx` em 4 camadas funcionais (Hero Enxuto, Próximo Agendamento, Filtro em Abas e Catálogo Limpo) e reescrita moderna do `Dashboard.css` eliminando gradientes pesados e ruídos visuais.

**Tech Stack:** React 19, TypeScript (Strict), Vite 8, React Router 7, Vanilla CSS com Design Tokens e variáveis CSS customizadas.

## Global Constraints
- Convenção de commits: Conventional Commits em português (`style:`, `feat:`, `refactor:`) conforme [README.md](file:///c:/Users/alder/Mutua/README.md).
- Paleta 60-30-10: 60% Neutros (`#F8FAFC`, `#FFFFFF`), 30% Institucional (`#163E59`), 10% CTA Conversão (`#059669`).
- Sem dependências externas de UI (manter CSS Vanilla puro do projeto).
- Preservar integridade funcional das rotas (`/ambientes`, `/equipamentos`, `/minhas-reservas`) e da store de autenticação.

---

### Task 1: Atualização dos Design Tokens Globais (`frontend/src/index.css`)

**Files:**
- Modify: `frontend/src/index.css:15-95`

**Interfaces:**
- Consumes: Estrutura existente de variáveis CSS em `:root`.
- Produces: Variáveis padronizadas `--cor-fundo`, `--cor-superficie`, `--cor-primaria`, `--cor-cta`, `--cor-cta-hover`, `--cor-cta-suave`, `--sombra-card`, `--sombra-card-hover`.

- [ ] **Step 1: Atualizar variáveis CSS em `:root` no `frontend/src/index.css`**
  Substituir a paleta carregada de gradientes pelos tokens minimalistas especificados:
  ```css
  --cor-primaria: #163E59;
  --cor-primaria-escura: #0F2B3E;
  --cor-primaria-clara: #235B80;
  --cor-primaria-suave: #EBF3F8;

  --cor-cta: #059669;
  --cor-cta-hover: #047857;
  --cor-cta-suave: #ECFDF5;

  --cor-fundo: #F8FAFC;
  --cor-fundo-card: #FFFFFF;
  --cor-borda: #E2E8F0;
  --cor-borda-hover: #CBD5E1;

  --cor-texto-principal: #0F172A;
  --cor-texto-secundario: #334155;
  --cor-texto-mutado: #64748B;

  --sombra-card: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02);
  --sombra-card-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
  --raio-card: 12px;
  --raio-btn: 8px;
  ```

- [ ] **Step 2: Verificar aplicação dos tokens e classes base no `index.css`**
  Ajustar classes utilitárias globais (como `.btn`, botões primários e resets) para utilizar `--cor-cta` e os novos raios/sombras.

- [ ] **Step 3: Commit das alterações de tokens globais**
  ```bash
  git add frontend/src/index.css
  git commit -m "style: atualiza design tokens globais com paleta minimalista"
  ```

---

### Task 2: Reestruturação da Lógica e Componentes da Dashboard (`frontend/src/pages/dashboard/DashboardPage.tsx`)

**Files:**
- Modify: `frontend/src/pages/dashboard/DashboardPage.tsx`

**Interfaces:**
- Consumes: `useAuthStore`, `useNavigate`, `Link` do React Router.
- Produces: Interface limpa com filtro reativo de categorias (`categoriaAtiva`), banner inteligente de reserva e listagem unificada em grid.

- [ ] **Step 1: Implementar estado de filtro por categoria**
  Adicionar estado para alternar entre categorias:
  ```typescript
  type CategoriaFiltro = 'todos' | 'reuniao' | 'coworking' | 'auditorio' | 'hub'
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaFiltro>('todos')
  ```

- [ ] **Step 2: Construir o Header Minimalista (Hero Limpo)**
  - Saudação personalizada `Olá, {primeiroNome}`.
  - Frase de contexto e status ativo inline.
  - Ações rápidas de conversão: Botão primário `+ Nova Reserva` (link para `/ambientes`) e `Solicitar HUB` (link para `/equipamentos`).

- [ ] **Step 3: Construir o Card de Próxima Reserva (Condicional)**
  - Exibir apenas quando houver reserva ativa (`confirmada` ou `pendente`).
  - Card horizontal com data/horário legível, badge de status discreto e botão `Ver Comprovante`.

- [ ] **Step 4: Implementar Barra de Filtros e Grade Unificada de Destaques**
  - Barra de chips/pílulas horizontais com contagem.
  - Grade de cards com imagem/ícone sutil, especificações técnicas essenciais, disponibilidade e botão direto de reserva.

- [ ] **Step 5: Adicionar Rodapé de Apoio ao Associado**
  - Links discretos para Regulamento de Uso e Suporte Mútua-PI / CREA-PI.

- [ ] **Step 6: Commit da reestruturação da DashboardPage**
  ```bash
  git add frontend/src/pages/dashboard/DashboardPage.tsx
  git commit -m "feat: reestrutura dashboard com layout minimalista e filtro instantaneo"
  ```

---

### Task 3: Estilização Minimalista (`frontend/src/pages/dashboard/Dashboard.css`)

**Files:**
- Modify: `frontend/src/pages/dashboard/Dashboard.css`

**Interfaces:**
- Consumes: Classes e IDs gerados na `DashboardPage.tsx` e variáveis globais do `index.css`.
- Produces: Estilos elegantes, responsivos e sem ruído visual para o layout da Dashboard.

- [ ] **Step 1: Estilizar o Header/Hero Minimalista**
  Fundo branco com micro-borda (`#E2E8F0`), padding moderado (`1.75rem 2rem`), alinhamento flexível entre saudação e botões de ação rápida.

- [ ] **Step 2: Estilizar o Card de Próximo Agendamento**
  Design com borda sutil de destaque no lado esquerdo (`border-left: 4px solid var(--cor-cta)`), fundo suave e metadados alinhados.

- [ ] **Step 3: Estilizar a Barra de Filtros (Chips)**
  Pílulas com transição suave, estado ativo com fundo azul institucional (`#163E59`) ou verde e texto branco; estados inativos com fundo neutro (`#F1F5F9`).

- [ ] **Step 4: Estilizar a Grade de Destaques e Cards de Espaço/HUB**
  Cards com `border-radius: var(--raio-card)`, borda `1px solid var(--cor-borda)`, `box-shadow: var(--sombra-card)` e efeito hover sutil (`translateY(-2px)` e sombra leve).

- [ ] **Step 5: Responsividade Mobile-First**
  Regras `@media (max-width: 768px)` garantindo que o hero empilhe harmoniosamente, os filtros tenham rolagem horizontal suave e os cards fiquem em coluna única legível.

- [ ] **Step 6: Commit dos estilos minimalistas da Dashboard**
  ```bash
  git add frontend/src/pages/dashboard/Dashboard.css
  git commit -m "style: reformula dashboard.css com design minimalista executivo"
  ```

---

### Task 4: Validação, Build TypeScript e Teste Visual

**Files:**
- Verify: `frontend/`

- [ ] **Step 1: Executar build do TypeScript**
  ```bash
  cd frontend
  npm run build
  ```
  Garantir zero erros de compilação ou inconsistência de tipos.

- [ ] **Step 2: Verificar funcionamento e renderização no navegador**
  Confirmar que a página carrega sem avisos de console, os filtros por categoria funcionam e a estética atende aos critérios minimalistas.

- [ ] **Step 3: Commit final e fechamento da tarefa**
  ```bash
  git add .
  git commit -m "chore: valida build e entrega da dashboard minimalista"
  ```
