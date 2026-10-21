# Especificação de Design — Histórico de Reservas e Auditoria Admin (Prompt 13)

**Data**: 21/10/2026  
**Autor**: Nicolas (Front-end)  
**Projeto**: Mútua-PI — Sistema de Gestão de Reservas  
**Status**: Aprovado para Planejamento  

---

## 1. Contexto e Motivação
A Mútua-PI e o Crea Tec HUB necessitam de uma ferramenta de auditoria centralizada para consulta e fiscalização de todo o histórico de utilização dos bens institucionais (estações de coworking, salas privativas, auditório master e equipamentos de alta precisão da engenharia como drones RTK, estações totais e câmeras termográficas).

Conforme estipulado no documento [Detalhamento do projeto.pdf](file:///c:/Users/alder/Mutua/Detalhamento%20do%20projeto.pdf) (Prompt 13 e requisitos D12/D13/D15), a equipe administrativa da Mútua precisa rastrear a trajetória completa de cada reserva e empréstimo, incluindo quem solicitou, quem autorizou, as datas de retirada e devolução e o estado de conservação física do bem verificado no balcão presencial.

---

## 2. Objetivos e Não-Objetivos

### Objetivos (MVP - Sprint 3)
- Implementar a 4ª aba administrativa: **"📜 Histórico & Auditoria"** na página [`AdminPage.tsx`](file:///c:/Users/alder/Mutua/frontend/src/pages/admin/AdminPage.tsx).
- Disponibilizar filtros combinados: busca textual por associado (nome ou registro CREA) e recurso (ambiente ou patrimônio do equipamento), filtro por categoria de recurso, status e intervalo de datas.
- Respeitar a conformidade com a LGPD através do mascaramento automático de CPF (`123.***.***-00` ou `***.456.789-**`) na listagem e na ficha de auditoria.
- Criar **Modal de Auditoria Detalhada com Linha do Tempo**, apresentando o ciclo de vida ponta a ponta da solicitação (solicitação, despacho administrativo, retirada no balcão, devolução e vistorias).
- Fornecer ferramenta de impressão/exportação para visualização em formato de **Ficha de Auditoria Timbrada da Mútua-PI**.
- Integrar com a camada de serviço em [`adminService.ts`](file:///c:/Users/alder/Mutua/frontend/src/services/adminService.ts) com fallback mock resiliente e compatibilidade com a futura API Spring Boot.

### Não-Objetivos (Fase 2)
- Gráficos pesados de BI ou relatórios de taxa de utilização analítica.
- Armazenamento de fotos de vistoria (previsto apenas para Fase 2).
- Penalidades financeiras automáticas por atraso na devolução.

---

## 3. Modelo de Dados e Contratos

### Tipos em `frontend/src/services/adminService.ts`
```typescript
import type { CondicaoEquipamento } from '../types'

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

---

## 4. Interface e Experiência do Usuário (UI/UX)

### 4.1 Navegação em Abas no Painel Admin
A aba "📜 Histórico & Auditoria" será posicionada como a quarta opção na barra de navegação superior do painel:
1. `📥 Fila de Despacho & Aprovações`
2. `🔄 Balcão de Retiradas & Devoluções HUB`
3. `🏢 Status dos Espaços da Sede`
4. `📜 Histórico & Auditoria`

### 4.2 Barra de Filtros e Busca
- **Busca Global**: Input com debounce/reativo por nome do profissional, número do CREA, patrimônio ou nome do espaço.
- **Filtro de Categoria**: Select entre "Todos os Recursos", "Espaços da Sede" e "Equipamentos HUB".
- **Filtro de Status**: Select com badges visuais para "Todos", "Concluídas", "Em Uso", "Canceladas", "Recusadas".
- **Filtro de Período**: Campos `Data Inicial` e `Data Final` com botão de limpeza de filtros.
- **Contador Dinâmico**: Exibição da quantidade de registros correspondentes (ex: "Exibindo 8 de 8 registros históricos").

### 4.3 Tabela de Histórico
- Colunas:
  - **Protocolo**: Identificador único (ex: `HUB-2026-0008` ou `MUT-2026-0814`).
  - **Recurso**: Nome e patrimônio/sala com ícone correspondente.
  - **Associado**: Nome do profissional, CREA-PI e CPF mascarado (LGPD).
  - **Período**: Data e horário de início até fim.
  - **Status**: Tag estilizada com cores institucionais (Verde = Concluída, Azul = Em Uso, Vermelho = Recusada/Cancelada).
  - **Ação**: Botão "Ver Auditoria" para abrir a ficha completa.

### 4.4 Modal de Detalhes da Auditoria com Linha do Tempo
- **Cabeçalho**: Protocolo oficial, status atual e identificação do bem.
- **Resumo do Solicitante**: Nome, registro CREA, CPF protegido, finalidade registrada.
- **Vistoria de Balcão (se equipamento)**: Checklist de itens físicos, estado de conservação no recebimento e na entrega, observações do atendente responsável.
- **Linha do Tempo Visual**: Linha vertical com nós representando cada evento da reserva desde a criação até o arquivamento.
- **Ações**: Botão de Fechar e Botão "Imprimir Ficha de Auditoria" que aciona a folha de estilo de impressão timbrada.

---

## 5. Tratamento de Erros e Casos de Borda
- **Nenhum registro encontrado**: Empty state amigável com botão "Limpar Filtros".
- **Falha de rede na API**: O serviço captura a exceção de forma transparente e fornece dados mock enriquecidos da Mútua-PI, garantindo funcionamento autônomo.
- **Proteção de Rotas**: Restrito a usuários com perfil `ADMIN` gerenciado pelo `RotaProtegida` do sistema.

---

## 6. Critérios de Aceite (Prompt 13)
1. A aba "📜 Histórico & Auditoria" está acessível no `/admin` e carrega a listagem histórica.
2. A filtragem por termo de busca, tipo de recurso, status e intervalo de datas atualiza os resultados instantaneamente.
3. CPFs de associados são exibidos exclusivamente no padrão mascarado (LGPD).
4. O modal de auditoria detalhada abre ao clicar em um registro e apresenta a linha do tempo cronológica com vistorias.
5. O botão de impressão permite gerar o documento timbrado sem quebras de layout.
6. A compilação (`npm run build`) e validação de linter (`npm run lint`) passam sem erros.
