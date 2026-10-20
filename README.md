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

## 📌 Funcionalidades Planejadas

- [ ] Autenticação e cadastro de usuários
- [ ] Cadastro de ambientes e equipamentos
- [ ] Consulta de disponibilidade por data/horário
- [ ] Reserva de ambientes (coworking, salas, auditório)
- [ ] Reserva de equipamentos (Crea Tec HUB)
- [ ] Prevenção de conflitos de reserva
- [ ] Registro de retirada/devolução de equipamentos
- [ ] Histórico de utilização
- [ ] Notificações e lembretes
- [ ] Painel administrativo
- [ ] Relatórios e indicadores
