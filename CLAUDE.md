# Guia do Projeto — Mútua-PI (Crea Tec HUB)

> **Siga sempre as regras do DESIGN.md em qualquer alteração de interface.**

Sistema de gestão e reserva de espaços de coworking, salas de reunião, auditório e empréstimo de equipamentos técnicos de ponta (drones, câmeras termográficas, estações totais) da Caixa de Assistência dos Profissionais do CREA (Mútua-PI / Crea Tec HUB).

---

## 🛠️ Stack Tecnológica

### Frontend (`frontend/`)
- **Runtime & Build**: Node.js, Vite 8
- **Framework & Linguagem**: React 19, TypeScript
- **Roteamento**: React Router v7
- **Gerenciamento de Estado**: Zustand (`authStore.ts`, `themeStore.ts`)
- **Requisições de Dados**: TanStack Query (React Query v5) + Axios
- **Estilos**: CSS puro modularizado com Design Tokens padronizados em `src/index.css` e `DESIGN.md`
- **Linter**: Oxlint

### Backend (`backend/`)
- **Linguagem & Runtime**: Java 21, Spring Boot 3.4
- **Segurança**: Spring Security + JWT (Tokens stateless) + Rate Limiting por IP/E-mail
- **Banco de Dados**: PostgreSQL com migrações Flyway (`db/migration/`)
- **Controle de Concorrência**: Exclusion constraint em banco e locks de agendamento
- **Documentação da API**: OpenAPI / Swagger UI (`/swagger-ui.html`)
- **Build & Dependências**: Maven (`pom.xml`)

### Infraestrutura
- **Contêineres**: Docker & Docker Compose (`docker-compose.yml`)
- **CI/CD**: GitHub Actions (`.github/workflows/backend.yml`)

---

## 📁 Estrutura de Diretórios

```
Mutua/
├── .claude/
│   └── skills/
│       └── frontend-design/      # Diretrizes visuais especializadas
├── backend/                      # API Spring Boot 3.4 (Java 21)
│   ├── src/main/java/br/icev/mutua/
│   │   ├── admin/                # Gestão de recursos e usuários
│   │   ├── auth/                 # Autenticação, JWT e rate limiting
│   │   ├── comum/                # Exceptions, handlers e LGPD
│   │   ├── emprestimo/           # Retirada/devolução de equipamentos
│   │   ├── recurso/              # Catálogo de ambientes e equipamentos
│   │   ├── relatorio/            # Indicadores e auditoria
│   │   ├── reserva/              # Ciclo de vida e regras de reservas
│   │   └── usuario/              # Entidade e repositório de usuários
│   └── src/main/resources/
│       └── db/migration/         # Scripts SQL Flyway (V1, V2)
├── frontend/                     # Aplicação SPA React 19 + Vite
│   ├── src/
│   │   ├── components/layout/    # PainelLayout, RotaProtegida
│   │   ├── pages/
│   │   │   ├── admin/            # Painel do Gestor Mútua
│   │   │   ├── ambientes/        # Catálogo de salas e auditório
│   │   │   ├── auth/             # Login e Cadastro
│   │   │   ├── dashboard/        # Central do Associado (Página principal)
│   │   │   ├── equipamentos/     # Empréstimos do Crea Tec HUB
│   │   │   └── reservas/         # Minhas Reservas e comprovantes
│   │   ├── services/             # Clientes de API Axios
│   │   ├── store/                # Zustand stores (Auth e Tema)
│   │   ├── types/                # Definições TypeScript
│   │   ├── App.tsx               # Roteador central
│   │   └── index.css             # Tokens globais e reset
├── docs/                         # Documentações de arquitetura e contrato
├── DESIGN.md                     # Design System Minimalista oficial
└── CLAUDE.md                     # Guia do assistente
```

---

## ⚡ Comandos Úteis

### Frontend
```bash
cd frontend
npm install              # Instalar dependências
npm run dev              # Iniciar servidor de desenvolvimento (Vite)
npm run build            # Validar TypeScript e gerar bundle de produção
npm run lint             # Executar linter (Oxlint)
```

### Backend
```bash
cd backend
./mvnw clean test        # Executar testes unitários e de integração
./mvnw spring-boot:run   # Iniciar API localmente (porta 8080)
```

### Docker
```bash
docker compose up -d     # Subir banco PostgreSQL e serviços auxiliares
```

---

## 🎨 Diretrizes de Desenvolvimento de Interface

- **Referência Mandatória**: Consulte sempre [DESIGN.md](DESIGN.md).
- **Sem sombras difusas**: Use linhas finas (`1px solid var(--line)`) e fundos contrastantes.
- **Pílulas**: Todos os botões principais, chips de status e filtros utilizam `border-radius: 100px`.
- **Tipografia**: Família `Inter Tight` ou `Inter`, com tracking tight nos títulos (`-0.04em`) e espaçamento aberto em micro-labels (`+0.04em uppercase`).
- **Acessibilidade**: Contraste mínimo WCAG AA em todos os textos e estados de foco visíveis em links e botões.

