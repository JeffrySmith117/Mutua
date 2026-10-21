# Contrato de Integração da API — Guia para a Equipe de Back-end (Spring Boot)

**Versão**: 1.0.0  
**Autor do Contrato**: Nicolas (Front-end Lead)  
**Destinatário**: Desenvolvedor(a) Back-end (Spring Boot 3.x / Java 21 + PostgreSQL)  
**Projeto**: Mútua-PI — Sistema de Gestão de Reservas  

---

## 1. Visão Geral e Boas-Vindas ao Colega de Back-end! 👋

Este documento é o **contrato formal de integração** entre o Front-end e o Back-end da plataforma da Mútua-PI / Crea Tec HUB.

O Front-end já está 100% desenvolvido em React 19 + TypeScript com modo autônomo. Portanto, **toda a experiência visual, as validações de formulário, os fluxos de agendamento e o painel administrativo já esperam exatamente os endpoints, parâmetros e payloads descritos abaixo**.

Ao seguir este guia na sua API Spring Boot, a integração com o Front-end funcionará na primeira tentativa, sem divergências de campos ou de regras de negócio.

### 🌐 Configuração Base
- **Base URL esperada**: `http://localhost:8080/api/v1` (configurável no Front-end via variável de ambiente `VITE_API_URL` no `.env`).
- **Formato dos Dados**: `application/json; charset=UTF-8`.
- **Formato das Datas/Horas**: Padrão **ISO 8601** (`YYYY-MM-DDTHH:mm:ss`, ex: `2026-10-24T08:30:00`). O fuso horário de referência operacional é o de Brasília/Teresina (`America/Fortaleza` / UTC-3).

---

## 2. Autenticação, Segurança e CORS

### 2.1 Cabeçalho de Autorização
Todas as rotas privadas (marcadas como 🔒) exigem o cabeçalho HTTP:
```http
Authorization: Bearer <TOKEN_JWT>
```

### 2.2 Perfis de Acesso (Roles)
- `PROFISSIONAL`: Profissional vinculado ao Sistema Confea/CREA-PI. Pode consultar disponibilidade, criar reservas, visualizar "Minhas Reservas", efetuar check-in e cancelar reservas próprias.
- `ADMIN`: Diretoria e equipe administrativa da Mútua-PI. Possui todas as permissões de `PROFISSIONAL` mais acesso irrestrito às rotas `/api/v1/admin/**` (aprovação/despacho, balcão de retiradas/devoluções, visualização de inventário e auditoria/histórico).

### 2.3 Configuração de CORS no Spring Security
O Back-end deve habilitar CORS explicitamente para o Front-end:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/v1/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "Accept")
                .allowCredentials(true);
    }
}
```

---

## 3. Padrão Unificado de Tratamento de Erros (RFC 7807)

Quando uma requisição falhar (validação, regra de negócio ou conflito), o Back-end deve retornar o erro no seguinte formato JSON unificado:

```json
{
  "timestamp": "2026-10-21T15:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "O recurso 'Sala de Reuniões Executiva A' já possui uma reserva confirmada para o horário selecionado.",
  "path": "/api/v1/reservas",
  "validationErrors": [
    {
      "field": "dataInicio",
      "message": "Horário sobreposto a uma reserva existente (Protocolo MUT-2026-0814)."
    }
  ]
}
```

### Principais Códigos HTTP Utilizados:
- `200 OK`: Consulta ou operação realizada com sucesso.
- `201 Created`: Recurso/reserva criada com sucesso (retorna o objeto criado no corpo).
- `400 Bad Request`: Payload mal formatado ou campos obrigatórios ausentes.
- `401 Unauthorized`: Token JWT ausente, expirado ou inválido.
- `403 Forbidden`: Perfil do usuário não tem permissão para a rota (ex: `PROFISSIONAL` tentando acessar `/admin`).
- `404 Not Found`: Recurso não localizado.
- `409 Conflict`: **CRÍTICO** — Retornado quando há tentativa de sobreposição de horário para o mesmo ambiente ou equipamento.

---

## 4. Endpoints da API

---

### 4.1 Módulo de Autenticação (`/api/v1/auth`)

#### `POST /api/v1/auth/login` (Público)
Realiza a autenticação e retorna o JWT com as informações do usuário.

**Request Body:**
```json
{
  "email": "elias.mendes@crea-pi.org.br",
  "senha": "senhaSegura123"
}
```

**Response Body (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "usr-1",
    "nome": "Eng. Mecânico Elias Pio Mendes",
    "email": "elias.mendes@crea-pi.org.br",
    "registroCrea": "CREA-PI 32415/D",
    "cpf": "123.456.789-00",
    "perfil": "PROFISSIONAL"
  }
}
```

#### `POST /api/v1/auth/cadastro` (Público)
Cadastro público de novos associados. **Importante**: Todo cadastro público nasce exclusivamente com perfil `PROFISSIONAL` (contas `ADMIN` devem ser geradas via seed no banco ou criadas por outro administrador).

**Request Body:**
```json
{
  "nome": "Eng. Agrimensor Carlos Eduardo Vieira",
  "email": "carlos.vieira@crea-pi.org.br",
  "senha": "senhaSegura123",
  "registroCrea": "CREA-PI 22419/D",
  "cpf": "987.654.321-11",
  "telefone": "(86) 99876-5432"
}
```

**Response Body (201 Created):**
```json
{
  "id": "usr-2",
  "nome": "Eng. Agrimensor Carlos Eduardo Vieira",
  "email": "carlos.vieira@crea-pi.org.br",
  "registroCrea": "CREA-PI 22419/D",
  "perfil": "PROFISSIONAL",
  "mensagem": "Cadastro realizado com sucesso."
}
```

#### `GET /api/v1/auth/me` 🔒
Retorna os dados do usuário dono do token JWT atual.

---

### 4.2 Módulo de Ambientes (`/api/v1/ambientes`)

#### `GET /api/v1/ambientes` (Público ou 🔒)
Lista todos os espaços físicos da sede da Mútua-PI.

**Response Body (200 OK):**
```json
[
  {
    "id": "amb-1",
    "nome": "Espaço Coworking Compartilhado",
    "tipo": "COWORKING",
    "capacidade": 24,
    "localizacao": "Térreo • Ala Sul Sede Mútua-PI",
    "recursosDisponiveis": ["Wi-Fi 6", "Climatização", "Café", "Tomadas individuais"],
    "horarioFuncionamento": "Segunda a Sexta, das 08h às 18h",
    "exigeAprovacao": false,
    "ativo": true
  },
  {
    "id": "amb-2",
    "nome": "Auditório Master Cláudio Portella",
    "tipo": "AUDITORIO",
    "capacidade": 60,
    "localizacao": "3º Andar • Sede Mútua-PI",
    "recursosDisponiveis": ["Projetor Laser 6000L", "Som Digital", "Microfones", "Púlpito"],
    "horarioFuncionamento": "Segunda a Sexta, das 08h às 21h",
    "exigeAprovacao": true,
    "ativo": true
  }
]
```

#### `GET /api/v1/ambientes/{id}/disponibilidade?data=YYYY-MM-DD` 🔒
Retorna os blocos horários ocupados e livres do espaço para a data informada.

**Response Body (200 OK):**
```json
{
  "ambienteId": "amb-2",
  "data": "2026-10-28",
  "intervalosOcupados": [
    {
      "inicio": "08:00:00",
      "fim": "12:00:00",
      "protocolo": "MUT-2026-0915",
      "motivo": "Seminário de Infraestrutura"
    }
  ],
  "horarioAbertura": "08:00:00",
  "horarioFechamento": "21:00:00"
}
```

---

### 4.3 Módulo de Equipamentos — Crea Tec HUB (`/api/v1/equipamentos`)

#### `GET /api/v1/equipamentos` 🔒
Lista o catálogo de equipamentos tecnológicos de engenharia do Crea Tec HUB.

**Response Body (200 OK):**
```json
[
  {
    "id": "eq-1",
    "nome": "Drone DJI Phantom 4 RTK",
    "patrimonio": "HUB-0042",
    "categoria": "Topografia / VANT",
    "descricao": "Aeronave para mapeamento aéreo centimétrico com estação D-RTK 2.",
    "prazoMaximoDias": 3,
    "exigeArtSisAnt": true,
    "status": "DISPONIVEL",
    "especificacoes": ["Câmera 20MP", "Obturador Mecânico", "3 Baterias"],
    "ativo": true
  },
  {
    "id": "eq-2",
    "nome": "Estação Total Leica FlexLine TS07",
    "patrimonio": "HUB-0008",
    "categoria": "Geodésia / Agrimensura",
    "descricao": "Estação total manual de alta precisão angular de 2 segundos.",
    "prazoMaximoDias": 5,
    "exigeArtSisAnt": true,
    "status": "EM_CAMPO",
    "especificacoes": ["Precisão 2\"", "Alcance 500m sem prisma", "Tripé incluso"],
    "ativo": true
  }
]
```

---

### 4.4 Módulo de Reservas & Empréstimos (`/api/v1/reservas`)

#### `POST /api/v1/reservas` 🔒
Cria uma solicitação de reserva de ambiente ou de empréstimo de equipamento.

> ⚠️ **Regra Fundamental de Conflito (HTTP 409)**: O Back-end DEVE rejeitar qualquer reserva cujo intervalo `[dataInicio, dataFim]` se sobreponha a uma reserva com status `CONFIRMADA` ou `EM_USO` para o mesmo recurso.

**Request Body:**
```json
{
  "recursoId": "eq-1",
  "tipo": "equipamento",
  "dataInicio": "2026-10-24T08:30:00",
  "dataFim": "2026-10-26T17:00:00",
  "finalidade": "Levantamento planialtimétrico cadastral para projeto de regularização fundiária.",
  "documentoVinculado": "ART: PI2026008491 • Cadastro SISANT: 412850-BR",
  "termoAceito": true
}
```

**Response Body (201 Created):**
```json
{
  "id": "res-101",
  "protocolo": "HUB-2026-0112",
  "recursoId": "eq-1",
  "recursoNome": "Drone DJI Phantom 4 RTK",
  "usuarioId": "usr-1",
  "status": "PENDENTE",
  "dataInicio": "2026-10-24T08:30:00",
  "dataFim": "2026-10-26T17:00:00",
  "criadoEm": "2026-10-21T15:00:00",
  "mensagem": "Solicitação registrada com sucesso! Aguardando despacho da gestão."
}
```

#### `GET /api/v1/reservas/minhas` 🔒
Lista o histórico de reservas do profissional autenticado.

**Response Body (200 OK):**
```json
[
  {
    "id": "res-101",
    "protocolo": "HUB-2026-0112",
    "recursoNome": "Drone DJI Phantom 4 RTK",
    "tipo": "equipamento",
    "patrimonioOuLocal": "HUB-0042",
    "dataInicio": "2026-10-24T08:30:00",
    "dataFim": "2026-10-26T17:00:00",
    "status": "PENDENTE",
    "finalidade": "Levantamento planialtimétrico cadastral...",
    "podeCancelar": true,
    "podeCheckin": false
  }
]
```

#### `PATCH /api/v1/reservas/{id}/cancelar` 🔒
Cancela a reserva solicitada (libera o horário para outros profissionais).

**Request Body:**
```json
{
  "motivo": "Adiado pelo cliente final."
}
```

#### `POST /api/v1/reservas/{id}/checkin` 🔒
Realiza o check-in presencial em salas ou mesas de coworking.

---

### 4.5 Módulo Administrativo (`/api/v1/admin/**`) — Apenas perfil `ADMIN`

#### `GET /api/v1/admin/metricas` 🔒
Retorna os KPIs do topo do painel administrativo.

**Response Body (200 OK):**
```json
{
  "solicitacoesPendentes": 3,
  "equipamentosEmCampo": 1,
  "taxaOcupacaoSalas": "82%",
  "totalReservasMes": 47,
  "profissionaisAtivos": 312
}
```

#### `GET /api/v1/admin/pendencias` 🔒
Retorna a fila de solicitações que exigem despacho manual da diretoria (ex: Auditório e Drones).

#### `POST /api/v1/admin/pendencias/{id}/aprovar` 🔒
Aprova a solicitação, mudando o status para `CONFIRMADA`.

#### `POST /api/v1/admin/pendencias/{id}/recusar` 🔒
Rejeita a solicitação informando o parecer formal.
**Request Body:**
```json
{
  "motivo": "Incompatibilidade de horário com solenidade oficial da Mútua-PI."
}
```

#### `GET /api/v1/admin/movimentacoes` 🔒
Lista as movimentações ativas de balcão do Crea Tec HUB (equipamentos aguardando retirada e equipamentos em campo).

#### `POST /api/v1/admin/movimentacoes/{id}/retirar` 🔒
Registra a retirada no balcão físico, emitindo o termo e marcando como `EM_USO`.

#### `POST /api/v1/admin/movimentacoes/{id}/devolver` 🔒
Registra a devolução do equipamento e sua conferência física.
**Request Body:**
```json
{
  "condicao": "otimo",
  "observacao": "Equipamento devolvido limpo, testado e com baterias recarregadas.",
  "itensConferidos": ["Aeronave", "Controle", "3 Baterias", "Estação D-RTK 2"]
}
```

#### `GET /api/v1/admin/historico` 🔒
Consulta com filtros de auditoria para fiscalização.
**Query Parameters Suportados:**
- `busca`: termo textual (nome do associado, CREA, patrimônio ou protocolo)
- `tipo`: `todos`, `ambiente` ou `equipamento`
- `status`: `todos`, `concluida`, `em_uso`, `cancelada`, `recusada`
- `dataInicio`: `YYYY-MM-DD`
- `dataFim`: `YYYY-MM-DD`

**Response Body (200 OK):**
Lista paginada de objetos com a linha do tempo cronológica (`linhaDoTempo`), dados de vistoria e mascaramento de CPF em conformidade com a LGPD.

---

## 5. Dica de Ouro para o Back-end: Prevenção de Conflitos no PostgreSQL! 💡

No PostgreSQL, para impedir 100% que duas reservas sobrepostas ocorram mesmo em caso de duas pessoas clicando exatamente no mesmo milissegundo, configure a extensão `btree_gist` e crie uma **Exclusion Constraint**:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reserva
ADD CONSTRAINT reserva_sem_sobreposicao
EXCLUDE USING gist (
  recurso_id WITH =,
  tsrange(data_inicio, data_fim) WITH &&
)
WHERE (status IN ('CONFIRMADA', 'EM_USO'));
```

Isso garante que reservas `CANCELADA` ou `RECUSADA` liberem o horário automaticamente, enquanto reservas ativas são protegidas pelo próprio motor do banco de dados!

---

*Em caso de dúvidas na modelagem ou na integração dos endpoints, converse com Nicolas (Front-end).*
