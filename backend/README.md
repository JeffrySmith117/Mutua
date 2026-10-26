# Back-end — Mútua-PI Reservas

API REST em Java 21 + Spring Boot 3.4, PostgreSQL, JWT. Implementa o contrato em
[`docs/contrato-api-backend.md`](../docs/contrato-api-backend.md). Base: `http://localhost:8080/api/v1`.

## Como rodar

Com Docker (banco + API):

```bash
docker compose up --build
```

Sem Docker, com um PostgreSQL local (banco, usuário e senha `mutua`):

```bash
cd backend
mvn spring-boot:run
```

Swagger: `http://localhost:8080/api/v1/swagger-ui.html`.

Na primeira subida é criado o administrador `admin@mutua-pi.com.br` / `admin123`
(`ADMIN_EMAIL` / `ADMIN_SENHA` mudam isso). **Troque a senha e o `JWT_SECRET` fora do desenvolvimento.**

## Testes

```bash
cd backend
mvn verify
```

Os testes sobem um PostgreSQL real embutido (sem Docker), pois a regra de conflito depende da
exclusion constraint do banco.

## Estrutura

```
br.icev.mutua
├── auth/        login, cadastro, JWT, segurança e CORS
├── usuario/     entidade, perfis e administrador inicial
├── recurso/     ambientes e equipamentos (uma tabela só, com tipo)
├── reserva/     reservas, ciclo de vida, auditoria e rotina de vencimentos
├── emprestimo/  retirada e devolução no balcão
├── relatorio/   métricas, pendências e histórico
├── admin/       rotas /admin/**
└── common/      erros, fuso e utilitários
```

O schema vive em `src/main/resources/db/migration` (Flyway). Mudanças de banco entram como novas
migrations (`V3__...`), nunca editando as já aplicadas.

## Decisões de regra de negócio

- **Conflito de horário em duas camadas**: o service verifica antes (mensagem clara) e a exclusion
  constraint `reserva_sem_sobreposicao` garante no banco, inclusive em requisições simultâneas.
  Intervalos são `[início, fim)`: 10h–11h e 11h–12h não colidem.
- `PENDENTE`, `CONFIRMADA` e `EM_USO` ocupam o horário. `CANCELADA`, `RECUSADA`, `CONCLUIDA` e
  `NAO_COMPARECEU` liberam.
- **Coworking** tem capacidade compartilhada (24): fica fora da constraint (`reserva.exclusivo = false`)
  e é controlado por lotação no service, com a linha do recurso travada durante a criação.
- Recursos com `exigeAprovacao` nascem `PENDENTE`; os demais, `CONFIRMADA`.
- Cancelamento de `CONFIRMADA` exige 2 h de antecedência. Check-in só no dia, para ambientes.
- Uma rotina (a cada minuto) expira pendências vencidas, marca não comparecimento (30 min de
  tolerância) e conclui o uso de ambientes.
- Horários são hora local de Fortaleza, sem fuso, como no contrato.
- CPF aparece mascarado nas listagens administrativas (LGPD). Só o formato (11 dígitos) é validado,
  não os dígitos verificadores, porque os dados de exemplo do front usam CPFs fictícios.
- A taxa de ocupação (`/admin/metricas`) é horas reservadas ÷ horas de funcionamento no mês, só de
  salas e auditório.

## Compatibilidade com o front atual

O código do front diverge em alguns pontos do contrato. A API aceita os dois formatos para não
bloquear a integração:

| Contrato | Também aceito (usado pelo front hoje) |
|---|---|
| `POST /auth/login`, `/cadastro`, `GET /auth/me` | `/auth/entrar`, `/auth/cadastrar`, `/auth/perfil`, `POST /auth/sair` |
| `GET /reservas/minhas` | `GET /reservas` |
| `PATCH /reservas/{id}/cancelar` | `DELETE /reservas/{id}` |
| `recursoId`, `dataInicio`, `dataFim` | `ambienteId`/`equipamentoId`, `data`+`horarioInicio`/`horarioFim`, `dataRetirada`+`horarioRetirada`, `dataDevolucao`+`horarioDevolucao`, `numeroArt` |
| `recursoNome`, `podeCancelar`, `podeCheckin` | `titulo`, `permitirCancelamento`, `permitirCheckin` (ambos vão na resposta) |

Ainda dependem de ajuste no front: `VITE_API_URL` (hoje `http://localhost:3000/api`; deve ser
`http://localhost:8080/api/v1`), `perfil` e `status` em MAIÚSCULAS na API, e o `catch` dos serviços,
que hoje transforma qualquer erro (inclusive o 409 de conflito) em sucesso simulado.
