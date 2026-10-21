# Mútua-PI — Sistema de Gestão de Reservas

Sistema de gestão de ambientes compartilhados e equipamentos da **Mútua – Caixa de Assistência dos Profissionais do CREA-PI**.

---

## 📋 Sobre o Projeto

Plataforma web que permite aos profissionais vinculados ao Sistema Confea/CREA consultarem disponibilidade e realizarem reservas de:

- **Ambientes**: estações de coworking, salas de estudo, salas multiuso, salas de reunião e auditório
- **Equipamentos (Crea Tec HUB)**: drones, pacômetros, câmeras termográficas, medidores e demais equipamentos de engenharia

---

## 🏗️ Arquitetura

```
Mutua/
├── frontend/          # React + TypeScript + Vite
├── backend/           # (a definir)
└── docs/              # Documentação do projeto
```

---

## 🌿 Fluxo de Branches

```
main              ← produção (estável)
  └── develop     ← integração (desenvolvimento)
        ├── feature/nome-da-funcionalidade
        └── hotfix/nome-do-hotfix
```

### Regras de Branch
- `main` → apenas merges aprovados de `develop` ou `hotfix/*`
- `develop` → integração contínua de features
- `feature/*` → nova funcionalidade (base: `develop`)
- `hotfix/*` → correção urgente em produção (base: `main`)

---

## 📝 Convenção de Commits (Português)

Todos os commits devem seguir o padrão **Conventional Commits em português**:

```
<tipo>: <descrição curta em português>
```

### Tipos permitidos

| Tipo       | Uso                                              |
|------------|--------------------------------------------------|
| `feat`     | Nova funcionalidade                              |
| `fix`      | Correção de bug                                  |
| `docs`     | Alterações em documentação                       |
| `style`    | Formatação, sem alteração de lógica              |
| `refactor` | Refatoração de código                            |
| `test`     | Adição ou correção de testes                     |
| `chore`    | Tarefas de manutenção (build, dependências etc.) |
| `ci`       | Alterações em CI/CD                              |

### Exemplos
```
feat: adiciona tela de reserva de equipamentos
fix: corrige validação de datas sobrepostas
docs: atualiza README com fluxo de branches
chore: instala dependências do projeto frontend
```

---

## 🚀 Como Rodar Localmente

```bash
# Frontend
cd frontend
npm install
npm run dev
```

---

## 👥 Equipe

| Papel         | Responsável     |
|---------------|-----------------|
| Frontend      |Nicolas          |
| Demandante    | Mútua-PI / CREA-PI |
| Supervisão    | ICEV Software House |

---

## 📚 Documentação do Projeto

A documentação detalhada para desenvolvedores e equipe de gestão está centralizada na pasta [`docs/`](docs/):

- 📑 [**Contrato de API do Back-end**](docs/contrato-api-backend.md) — Guia completo para quem for desenvolver o Back-end (endpoints, DTOs, códigos HTTP, JWT e CORS).
- 🔄 [**Ciclo de Vida das Reservas**](docs/ciclo-de-vida-reservas.md) — Máquina de estados (`PENDENTE`, `CONFIRMADA`, `EM_USO`, etc.) e regras de cancelamento.
- 🗄️ [**Modelo de Banco de Dados**](docs/modelo-banco-dados.md) — Script DDL PostgreSQL e Exclusion Constraint temporal para prevenção física de conflitos.
- 💻 [**Arquitetura do Front-end**](docs/arquitetura-frontend.md) — Visão técnica dos componentes, rotas, telas e modo de demonstração autônomo.

---

## 📌 Funcionalidades e Status do MVP

- [x] Autenticação e cadastro de usuários (com perfil PROFISSIONAL e ADMIN)
- [x] Consulta de disponibilidade por data/horário
- [x] Catálogo e reserva de ambientes (coworking, salas, auditório)
- [x] Catálogo e empréstimo de equipamentos (Crea Tec HUB) com Termo de Guarda
- [x] Prevenção de conflitos de reserva (dupla camada: interface e validação)
- [x] Central "Minhas Reservas" com cancelamento e emissão de comprovante timbrado
- [x] Painel administrativo com fila de despacho de solicitações da diretoria
- [x] Balcão de fiscalização com registro de retirada, devolução e vistoria de conservação
- [x] Histórico de utilização e auditoria com linha do tempo e filtros LGPD
- [ ] Integração com Back-end Spring Boot (API em desenvolvimento)
- [ ] Notificações e lembretes por e-mail/WhatsApp (Fase 2)
- [ ] Relatórios analíticos e indicadores gráficos de ocupação (Fase 2)
