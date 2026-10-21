# Implementação do Histórico de Reservas e Auditoria Admin (Prompt 13)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar no Painel Administrativo a consulta de histórico de reservas por usuário e por recurso com filtros por período/tipo/status, dados pessoais protegidos por máscara (LGPD) e modal de auditoria com linha do tempo e emissão de ficha timbrada.

**Architecture:** Extensão desacoplada do `adminService` para fornecer dados de auditoria com resiliência mock/API; subcomponente modal dedicado com timeline cronológica e folha de estilo de impressão `@media print`; aba integrada no `AdminPage.tsx` com busca reativa e paginação.

**Tech Stack:** React 19, TypeScript (strict), Vite, CSS Vanilla (Design System Mútua-PI).

## Global Constraints
- Seguir as convenções de commit em português (`feat: ...`, `fix: ...`, `docs: ...`).
- Cumprir LGPD: CPF de associados deve ser sempre mascarado (`***.456.789-**` ou `123.***.***-00`) e nunca exposto em URL ou log.
- Manter compatibilidade com React 19 Compiler (evitar funções impuras em renderização).
- Não utilizar bibliotecas externas adicionais (manter stack leve e sem sobrecarga de bundle).

---

### Task 1: Contratos de Dados e Métodos de Histórico no `adminService`

**Files:**
- Modify: `frontend/src/services/adminService.ts`

**Interfaces:**
- Produces:
  - `export type StatusHistorico = 'concluida' | 'cancelada' | 'recusada' | 'em_uso'`
  - `export type TipoRecursoHistorico = 'todos' | 'ambiente' | 'equipamento'`
  - `export interface EventoLinhaTempo`
  - `export interface RegistroHistorico`
  - `export interface FiltrosHistorico`
  - `adminService.listarHistorico(filtros?: FiltrosHistorico): Promise<RegistroHistorico[]>`
  - `adminService.obterHistoricoPorId(id: string): Promise<RegistroHistorico | null>`

- [x] **Step 1: Adicionar as interfaces e tipos de histórico em `adminService.ts`**

Adicionar ao topo do arquivo `frontend/src/services/adminService.ts`:
```typescript
export type StatusHistorico = 'concluida' | 'cancelada' | 'recusada' | 'em_uso'
export type TipoRecursoHistorico = 'todos' | 'ambiente' | 'equipamento'

export interface EventoLinhaTempo {
  titulo: string
  dataHora: string
  responsavel: string
  descricao: string
  tipo: 'solicitacao' | 'aprovacao' | 'retirada' | 'devolucao' | 'cancelamento' | 'recusa'
}

export interface RegistroHistorico {
  id: string
  protocolo: string
  tipo: 'ambiente' | 'equipamento'
  recursoNome: string
  patrimonioOuLocal: string
  profissionalNome: string
  registroCrea: string
  cpfMascarado: string
  dataInicio: string
  dataFim: string
  status: StatusHistorico
  motivoCancelamentoOuRecusa?: string
  dadosBalcao?: {
    retiradoEm?: string
    devolvidoEm?: string
    condicaoRetirada?: CondicaoEquipamento
    condicaoDevolucao?: CondicaoEquipamento
    atendenteBalcao: string
    observacoes?: string
    itensConferidos?: string[]
  }
  finalidade: string
  linhaDoTempo: EventoLinhaTempo[]
}

export interface FiltrosHistorico {
  busca?: string
  tipo?: TipoRecursoHistorico
  status?: 'todos' | StatusHistorico
  dataInicio?: string
  dataFim?: string
}
```

- [x] **Step 2: Adicionar base de dados mock representativa e métodos `listarHistorico` e `obterHistoricoPorId`**

Incluir a constante `HISTORICO_MOCK: RegistroHistorico[]` com registros de auditório, coworking, drones RTK, câmeras termográficas e estações totais com diferentes status (`concluida`, `em_uso`, `cancelada`, `recusada`). Implementar os métodos no objeto `adminService`:
```typescript
async listarHistorico(filtros?: FiltrosHistorico): Promise<RegistroHistorico[]> {
  try {
    const resposta = await api.get<RegistroHistorico[]>('/admin/historico', { params: filtros })
    return resposta.data
  } catch {
    let resultado = [...HISTORICO_MOCK]
    if (!filtros) return resultado

    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase().trim()
      resultado = resultado.filter(
        (r) =>
          r.profissionalNome.toLowerCase().includes(termo) ||
          r.registroCrea.toLowerCase().includes(termo) ||
          r.recursoNome.toLowerCase().includes(termo) ||
          r.patrimonioOuLocal.toLowerCase().includes(termo) ||
          r.protocolo.toLowerCase().includes(termo)
      )
    }

    if (filtros.tipo && filtros.tipo !== 'todos') {
      resultado = resultado.filter((r) => r.tipo === filtros.tipo)
    }

    if (filtros.status && filtros.status !== 'todos') {
      resultado = resultado.filter((r) => r.status === filtros.status)
    }

    if (filtros.dataInicio) {
      resultado = resultado.filter((r) => r.dataInicio >= filtros.dataInicio!)
    }

    if (filtros.dataFim) {
      resultado = resultado.filter((r) => r.dataFim <= filtros.dataFim!)
    }

    return resultado
  }
},

async obterHistoricoPorId(id: string): Promise<RegistroHistorico | null> {
  try {
    const resposta = await api.get<RegistroHistorico>(`/admin/historico/${id}`)
    return resposta.data
  } catch {
    return HISTORICO_MOCK.find((r) => r.id === id) || null
  }
}
```

- [x] **Step 3: Validar compilação e tipagem do TypeScript**

Comando: `cd frontend && npm run build`  
Esperado: Compilação concluída sem erros de tipagem.

- [x] **Step 4: Commitar as alterações**

```bash
git add frontend/src/services/adminService.ts
git commit -m "feat: adiciona modelos e servico de historico e auditoria no adminService"
```

---

### Task 2: Subcomponente Modal de Auditoria e Linha do Tempo

**Files:**
- Create: `frontend/src/pages/admin/HistoricoModalAuditoria.tsx`
- Modify: `frontend/src/pages/admin/Admin.css`

**Interfaces:**
- Consumes: `RegistroHistorico` de `../../services/adminService`
- Produces: `HistoricoModalAuditoria: React.FC<{ registro: RegistroHistorico; aoFechar: () => void }>`

- [x] **Step 1: Criar o componente `HistoricoModalAuditoria.tsx`**

Criar `frontend/src/pages/admin/HistoricoModalAuditoria.tsx` com:
- Exibição timbrada do cabeçalho institucional (Mútua-PI / Crea Tec HUB).
- Resumo do associado e do bem (com CPF mascarado para LGPD).
- Caixa de vistoria presencial de balcão (estado físico: ótimo, bom, regular, avariado e itens checados).
- Linha do tempo visual cronológica (solicitação -> aprovação -> retirada -> devolução / cancelamento).
- Ação `window.print()` estilizada para emissão de ficha de auditoria oficial.

- [x] **Step 2: Adicionar estilos de auditoria e `@media print` no `Admin.css`**

Adicionar as classes para a timeline vertical, ícones de etapa, caixas de checklist e regras de impressão para ocultar botões e formatar folha A4 limpa no `Admin.css`.

- [x] **Step 3: Validar build do frontend**

Comando: `cd frontend && npm run build`  
Esperado: Compilado com sucesso.

- [x] **Step 4: Commitar as alterações**

```bash
git add frontend/src/pages/admin/HistoricoModalAuditoria.tsx frontend/src/pages/admin/Admin.css
git commit -m "feat: cria modal de auditoria com linha do tempo e impressao timbrada"
```

---

### Task 3: Integração da Aba "📜 Histórico & Auditoria" no `AdminPage.tsx`

**Files:**
- Modify: `frontend/src/pages/admin/AdminPage.tsx`
- Modify: `frontend/src/pages/admin/Admin.css`

**Interfaces:**
- Consumes: `adminService.listarHistorico`, `RegistroHistorico`, `FiltrosHistorico`, `HistoricoModalAuditoria`

- [x] **Step 1: Expandir o estado de abas para incluir `'historico'`**

Em `frontend/src/pages/admin/AdminPage.tsx`:
```typescript
const [abaAtiva, setAbaAtiva] = useState<'pendencias' | 'balcao' | 'inventario' | 'historico'>('pendencias')
```

- [x] **Step 2: Adicionar botão da aba e conteúdo da aba com barra de filtros reativa**

Inserir o 4º botão de aba:
```tsx
<button
  type="button"
  className={`admin-aba-btn ${abaAtiva === 'historico' ? 'aba-ativa' : ''}`}
  onClick={() => setAbaAtiva('historico')}
>
  <span>📜 Histórico Geral & Auditoria</span>
</button>
```

Inserir o container da aba com:
- Barra de busca com inputs controlados para texto, tipo (`ambiente`, `equipamento`, `todos`), status e período.
- Tabela responsiva com badges de status, CPF mascarado e botão "Inspecionar Auditoria".
- Paginação inteligente e contador de registros.
- Empty state com botão "Limpar Filtros".

- [x] **Step 3: Conectar o modal de auditoria ao clique em "Inspecionar Auditoria"**

Armazenar `registroParaAuditoria: RegistroHistorico | null` no estado e renderizar `<HistoricoModalAuditoria />` quando selecionado.

- [x] **Step 4: Ajustar estilos de tabela, filtros e responsividade no `Admin.css`**

- [x] **Step 5: Validar compilação e lint**

Comando: `cd frontend && npm run build && npm run lint`  
Esperado: Zero erros de compilação e warnings sanados.

- [x] **Step 6: Commitar as alterações**

```bash
git add frontend/src/pages/admin/AdminPage.tsx frontend/src/pages/admin/Admin.css
git commit -m "feat: integra aba de historico e auditoria no painel administrativo"
```

---

### Task 4: Validação Funcional Ponta a Ponta e Integração

**Files:**
- Inspect & Test: Navegador integrado / Servidor local Vite

- [x] **Step 1: Iniciar servidor dev se necessário e testar a navegação**

Acessar a rota `/admin` e navegar para a aba "📜 Histórico Geral & Auditoria".

- [x] **Step 2: Testar filtros e buscas**
- Buscar por nome de associado (ex: "Elias", "Valéria").
- Filtrar por status (`Concluídas`, `Em Uso`, `Canceladas`).
- Filtrar por categoria (Espaços vs Equipamentos HUB).
- Abrir o modal de auditoria de um registro de equipamento e verificar a linha do tempo e vistorias.
- Abrir o modal de um ambiente e verificar a linha do tempo.

- [x] **Step 3: Executar build final de validação**

Comando: `cd frontend && npm run build`  
Esperado: Sucesso absoluto.

- [x] **Step 4: Commitar e integrar branch**

```bash
git add .
git commit -m "chore: finaliza integracao do modulo de historico e auditoria"
```
