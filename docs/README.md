# Documentação do Sistema — Mútua-PI (Gestão de Reservas)

Bem-vindo à documentação técnica oficial da plataforma web de gestão de ambientes compartilhados e equipamentos do **Crea Tec HUB** da **Mútua – Caixa de Assistência dos Profissionais do CREA-PI**.

Este diretório reúne as diretrizes de arquitetura, o estado atual de desenvolvimento do Front-end e, em especial, o **contrato de integração de API** e **modelo de dados** para a equipe de desenvolvimento do Back-end (Spring Boot / Java 21 + PostgreSQL).

---

## 🗂️ Estrutura da Documentação

A documentação está organizada nos seguintes módulos temáticos:

| Documento | Descrição e Finalidade | Público Principal |
| :--- | :--- | :--- |
| 📑 [**Contrato de API do Back-end**](file:///c:/Users/alder/Mutua/docs/contrato-api-backend.md) | **Guia principal para quem for desenvolver o Back-end**. Mapeamento de todos os endpoints RESTful, payloads JSON (Request/Response DTOs), cabeçalhos JWT, códigos HTTP e tratamento unificado de erros e conflitos (409). | Desenvolvedor Back-end |
| 🔄 [**Ciclo de Vida das Reservas**](file:///c:/Users/alder/Mutua/docs/ciclo-de-vida-reservas.md) | Máquina de estados das reservas e empréstimos (`PENDENTE`, `CONFIRMADA`, `EM_USO`, `CONCLUIDA`, `CANCELADA`, `RECUSADA`). Regras de transição, quem pode alterar o que e prevenção de sobreposição de horários. | Back-end / PO / QA |
| 🗄️ [**Modelo de Banco de Dados**](file:///c:/Users/alder/Mutua/docs/modelo-banco-dados.md) | Esquema conceitual de entidades relacionais PostgreSQL/JPA (`Usuario`, `Recurso`, `RegraUso`, `Reserva`, `Emprestimo`, `HistoricoAuditoria`) e definição da *Exclusion Constraint* do PostgreSQL para bloqueio concorrente de horários. | Back-end / DBA |
| 💻 [**Arquitetura do Front-end**](file:///c:/Users/alder/Mutua/docs/arquitetura-frontend.md) | Panorama do que já foi construído no Front-end (React 19 + TypeScript + Vite): catálogo de espaços, catálogo HUB, Minhas Reservas, balcão de fiscalização, painel de despacho e histórico de auditoria com modo autônomo offline. | Front-end / QA |
| 📋 [**Especificações e Planos (Superpowers)**](file:///c:/Users/alder/Mutua/docs/superpowers/) | Registros cronológicos de especificações de design (`specs/`) e planos de implementação passo a passo (`plans/`) validados durante as sprints. | Toda a equipe |

---

## 🚀 Como Executar o Projeto Localmente

### 1. Front-end (React + Vite + TypeScript)
```bash
# Acessar a pasta do frontend
cd frontend

# Instalar dependências (Node 18+)
npm install

# Iniciar servidor de desenvolvimento (Vite)
npm run dev

# Validar compilação e TypeScript estrito
npm run build

# Executar linter
npm run lint
```

O aplicativo estará disponível em `http://localhost:5173`. O Front-end possui **modo de demonstração autônomo**: caso a API do Back-end ainda não esteja online, todos os serviços (`authService`, `ambienteService`, `equipamentoService`, `reservaService` e `adminService`) respondem com bases mock ricas e simulações completas de regras de negócio.

---

## 👥 Responsáveis do Projeto

- **Front-end**: Nicolas (ICEV Software House)
- **Demandante**: Mútua-PI / CREA-PI
- **Supervisão Acadêmica & Técnica**: ICEV Software House
