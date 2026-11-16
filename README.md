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
├── backend/           # Java 21 + Spring Boot 3.4 + PostgreSQL (API REST com JWT)
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

Do clone ao sistema integrado, em 3 passos. Pré-requisitos: **Docker** e **Node.js 20+**.

**1. Banco e API** (na raiz do projeto)

```bash
docker compose up --build
```

A API sobe em `http://localhost:8080/api/v1` (Swagger em `/swagger-ui.html`) e o PostgreSQL em `localhost:5432`.

**2. Front-end** (em outro terminal)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

O `.env.example` já aponta para a API local (`VITE_API_URL=http://localhost:8080/api/v1`) e deixa o modo de demonstração desligado (`VITE_USE_MOCK=false`), para os erros reais da API aparecerem na tela.

**3. Acessar:** abra `http://localhost:5173`.

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador (criado na primeira subida) | `admin@mutua-pi.com.br` | `admin123` |
| Profissional | crie em "Criar uma conta" (senha de 8+ caracteres, CPF com 11 dígitos) | — |

> ⚠️ A senha do admin, o `JWT_SECRET` e a senha do banco são **só para desenvolvimento**. Em produção use `SPRING_PROFILES_ACTIVE=prod` e as variáveis descritas em [`backend/README.md`](backend/README.md).

**Sem Docker:** com um PostgreSQL local (banco, usuário e senha `mutua`), rode `cd backend && mvn spring-boot:run`.

**Sem back-end (apenas demonstração do front):** defina `VITE_USE_MOCK=true` no `.env`. Os dados passam a ser simulados no navegador.

**Testes do back-end:** `cd backend && mvn verify` (sobem um PostgreSQL embutido, sem Docker).

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
- [x] Integração do front com o back-end Spring Boot (API real, erros e perfis tratados na interface)
- [ ] Notificações e lembretes por e-mail/WhatsApp (Fase 2)
- [ ] Relatórios analíticos e indicadores gráficos de ocupação (Fase 2)
