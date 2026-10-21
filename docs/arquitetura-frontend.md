# Arquitetura do Front-end — Mútua-PI

**Responsável**: Nicolas (Front-end Lead)  
**Projeto**: Mútua-PI — Sistema de Gestão de Reservas  
**Stack**: React 19 • TypeScript (Strict) • Vite 8 • React Router 7 • TanStack Query 5 • CSS Vanilla  

---

## 1. Visão Geral da Arquitetura

O Front-end foi construído com foco em **alta responsividade (mobile-first para o associado e desktop para a administração)**, performance instantânea (Vite) e conformidade estrita com os requisitos da Mútua-PI / ICEV Software House.

O sistema possui uma arquitetura desacoplada e **resiliente**: todos os serviços HTTP em `src/services/` estão preparados para consumir a API REST real do Spring Boot via Axios e, ao mesmo tempo, possuem **fallbacks com bases mock completas e simulação de regras de negócio**, permitindo demonstrações autônomas sem depender do banco de dados estar rodando.

---

## 2. Estrutura de Pastas e Módulos

```
frontend/src/
├── components/
│   └── layout/
│       ├── PainelLayout.tsx          # Shell da aplicação (Sidebar, Topbar, navegação por perfil)
│       └── RotaProtegida.tsx         # Guarda de rota por perfil (PROFISSIONAL / ADMIN)
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx             # Login com alternador rápido de demonstração (Associado / Admin)
│   │   ├── CadastroPage.tsx          # Cadastro público com validação de CREA e CPF
│   │   └── Auth.css                  # Estilos modernos das telas de autenticação
│   ├── dashboard/
│   │   ├── DashboardPage.tsx         # Home com atalhos, boas-vindas institucionais e resumo
│   │   └── Dashboard.css
│   ├── ambientes/
│   │   ├── AmbientesPage.tsx         # Catálogo de salas, auditório e coworking + modal de agendamento
│   │   └── Ambientes.css
│   ├── equipamentos/
│   │   ├── EquipamentosPage.tsx      # Catálogo Crea Tec HUB + modal de empréstimo com Termo de Guarda
│   │   └── Equipamentos.css
│   ├── reservas/
│   │   ├── MinhasReservasPage.tsx    # Central do associado: cancelamento, check-in e comprovante timbrado
│   │   └── MinhasReservas.css
│   └── admin/
│       ├── AdminPage.tsx             # Painel administrativo unificado com 4 abas operacionais
│       ├── HistoricoModalAuditoria.tsx # Modal de auditoria detalhada com timeline e impressão timbrada
│       └── Admin.css                 # Estilos do painel, cards, balcão e regras @media print
├── services/
│   ├── api.ts                        # Instância centralizada do Axios com interceptor de JWT
│   ├── authService.ts                # Login, cadastro, sessão no localStorage e perfil
│   ├── ambienteService.ts            # Listagem de espaços e verificação de horários livres
│   ├── equipamentoService.ts         # Catálogo HUB e termos de responsabilidade
│   ├── reservaService.ts             # Criação, listagem e cancelamento de reservas
│   └── adminService.ts               # Métricas, despacho de solicitações, balcão HUB e auditoria
├── styles/
│   └── variaveis.css                 # Design Tokens (paleta Confea/CREA, tipografia, raios, sombras)
├── types/
│   └── index.ts                      # Interfaces globais TypeScript
├── App.tsx                           # Configuração do React Router e TanStack Query Provider
├── index.css                         # Reset global, fontes Inter/Outfit e utilitários
└── main.tsx                          # Ponto de entrada React 19
```

---

## 3. Páginas e Funcionalidades Entregues no Front-end

### 3.1 Autenticação e Perfis (`/entrar` e `/cadastro`)
- Login funcional com credenciais JWT e botões de atalho de teste rápido para alternar entre perfil **Associado** (`elias.mendes@crea-pi.org.br`) e **Administrador** (`admin@mutua-pi.com.br`).
- Cadastro público com máscaras e validação em conformidade com a LGPD.

### 3.2 Catálogo de Ambientes & Agendamento (`/ambientes`)
- Visualização em cards de todos os espaços da nova sede da Mútua-PI: Coworking (24 posições), Salas Multiuso, Sala de Reuniões Executiva A e Auditório Master Cláudio Portella.
- Modal interativo de reserva com seleção de data, horário de início/fim e finalidade.

### 3.3 Catálogo do Crea Tec HUB (`/equipamentos`)
- Catálogo dos equipamentos tecnológicos de ponta para engenharia: Drones RTK centimétricos, Estações Totais Eletrônicas, Câmeras Termográficas e Decibelímetros.
- Fluxo de solicitação de empréstimo com aceite obrigatório do **Termo de Guarda e Responsabilidade** e exigência de vinculação de ART / SISANT.

### 3.4 Central "Minhas Reservas" (`/minhas-reservas`)
- Gestão das reservas ativas e históricas do profissional.
- Ações dinâmicas conforme status:
  - **Cancelar Reserva** com liberação do horário.
  - **Realizar Check-in** no dia do uso.
  - **Emitir Comprovante Timbrado**: visualização e impressão da folha oficial de confirmação com carimbo institucional da Mútua-PI.

### 3.5 Painel Administrativo (`/admin` — Apenas perfil `ADMIN`)
O painel administrativo reúne 4 abas integradas:
1. **📥 Fila de Despacho & Aprovações**: Cartões com solicitações pendentes de auditório e equipamentos para parecer da diretoria (aprovação ou recusa com justificativa).
2. **🔄 Balcão de Retiradas & Devoluções HUB**: Tabela de controle de balcão com conferência presencial de equipamentos em campo e checklist de devolução (avaliação do estado físico: *ótimo, bom, regular ou avariado*).
3. **🏢 Status dos Espaços da Sede**: Inventário visual com capacidade, recursos audiovisuais e status de operacionalidade.
4. **📜 Histórico Geral & Auditoria**: Ferramenta de auditoria com busca reativa por associado/recurso, filtros por categoria, status e período, paginação, proteção de CPF (LGPD) e modal com linha do tempo vertical e impressão da **Ficha de Auditoria Oficial**.

---

## 4. Comunicação com a API e Mock Integrado

Todos os módulos de `src/services/` utilizam o seguinte padrão seguro:

```typescript
export const recursoService = {
  async listar(): Promise<Recurso[]> {
    try {
      const resposta = await api.get<Recurso[]>('/recursos')
      return resposta.data
    } catch (error) {
      // Se a API não estiver respondendo, usa os dados simulados realistas
      return RECURSOS_MOCK
    }
  }
}
```

Isso garante que o Front-end:
- Nunca quebra com tela em branco em caso de instabilidade na API.
- Funciona perfeitamente em demos presenciais e validações com a Mútua-PI.
- Conecta-se instantaneamente à API Spring Boot assim que o Back-end estiver no ar.

---

## 5. Como Contribuir e Executar Testes

```bash
# Rodar servidor de desenvolvimento com Hot Reload
npm run dev

# Checar erros de tipagem TypeScript e gerar bundle otimizado
npm run build

# Executar análise estática de código com Oxlint
npm run lint
```
