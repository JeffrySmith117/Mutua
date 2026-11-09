-- Schema inicial do Sistema de Reservas Mútua-PI.
-- Horários são guardados como hora local de Fortaleza (timestamp sem fuso), conforme o contrato da API.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE usuario (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    senha_hash    VARCHAR(255) NOT NULL,
    cpf           VARCHAR(14)  NOT NULL UNIQUE,
    registro_crea VARCHAR(30),
    telefone      VARCHAR(20),
    perfil        VARCHAR(20)  NOT NULL DEFAULT 'PROFISSIONAL',
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP    NOT NULL DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
    CONSTRAINT chk_usuario_perfil CHECK (perfil IN ('PROFISSIONAL', 'ADMIN'))
);

-- Ambientes e equipamentos na mesma tabela, diferenciados por tipo.
CREATE TABLE recurso (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                 VARCHAR(150) NOT NULL,
    tipo                 VARCHAR(30)  NOT NULL,
    patrimonio           VARCHAR(50),
    localizacao          VARCHAR(150),
    descricao            TEXT,
    categoria            VARCHAR(100),
    capacidade           INT          NOT NULL DEFAULT 1,
    prazo_max_dias       INT          NOT NULL DEFAULT 1,
    exige_aprovacao      BOOLEAN      NOT NULL DEFAULT FALSE,
    exige_art_sisant     BOOLEAN      NOT NULL DEFAULT FALSE,
    horario_abertura     TIME         NOT NULL DEFAULT '08:00',
    horario_fechamento   TIME         NOT NULL DEFAULT '18:00',
    dias_semana          INT[]        NOT NULL DEFAULT '{1,2,3,4,5}', -- ISO: 1 = segunda ... 7 = domingo
    recursos_disponiveis TEXT[]       NOT NULL DEFAULT '{}',
    especificacoes       TEXT[]       NOT NULL DEFAULT '{}',
    ativo                BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em            TIMESTAMP    NOT NULL DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
    CONSTRAINT chk_recurso_tipo CHECK (tipo IN ('COWORKING', 'SALA', 'AUDITORIO', 'EQUIPAMENTO')),
    CONSTRAINT chk_recurso_horario CHECK (horario_fechamento > horario_abertura)
);

CREATE INDEX idx_recurso_tipo ON recurso (tipo);
CREATE UNIQUE INDEX uq_recurso_patrimonio ON recurso (patrimonio) WHERE patrimonio IS NOT NULL;

CREATE SEQUENCE protocolo_seq START 1;

CREATE TABLE reserva (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocolo                  VARCHAR(30) NOT NULL UNIQUE,
    usuario_id                 UUID        NOT NULL REFERENCES usuario (id),
    recurso_id                 UUID        NOT NULL REFERENCES recurso (id),
    data_inicio                TIMESTAMP   NOT NULL,
    data_fim                   TIMESTAMP   NOT NULL,
    status                     VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    finalidade                 TEXT        NOT NULL,
    documento_vinculado        VARCHAR(200),
    motivo_recusa_cancelamento TEXT,
    -- false para recursos de capacidade compartilhada (coworking): ficam fora da exclusion constraint
    -- e têm a lotação controlada no service.
    exclusivo                  BOOLEAN     NOT NULL DEFAULT TRUE,
    criado_em                  TIMESTAMP   NOT NULL DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
    CONSTRAINT chk_reserva_datas CHECK (data_fim > data_inicio),
    CONSTRAINT chk_reserva_status CHECK (status IN
        ('PENDENTE', 'CONFIRMADA', 'EM_USO', 'CONCLUIDA', 'CANCELADA', 'RECUSADA', 'NAO_COMPARECEU'))
);

CREATE INDEX idx_reserva_usuario ON reserva (usuario_id);
CREATE INDEX idx_reserva_recurso ON reserva (recurso_id, data_inicio);
CREATE INDEX idx_reserva_status ON reserva (status);

-- Segunda camada de proteção contra conflito: o banco recusa reservas sobrepostas do mesmo recurso,
-- mesmo com requisições simultâneas. tsrange usa limites [inicio, fim), então 10h-11h e 11h-12h não colidem.
-- PENDENTE bloqueia o horário; CANCELADA, RECUSADA, CONCLUIDA e NAO_COMPARECEU liberam.
ALTER TABLE reserva
    ADD CONSTRAINT reserva_sem_sobreposicao
    EXCLUDE USING gist (
        recurso_id WITH =,
        tsrange(data_inicio, data_fim) WITH &&
    )
    WHERE (exclusivo AND status IN ('PENDENTE', 'CONFIRMADA', 'EM_USO'));

CREATE TABLE emprestimo (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id             UUID NOT NULL UNIQUE REFERENCES reserva (id),
    data_retirada          TIMESTAMP,
    condicao_retirada      VARCHAR(20),
    observacoes_retirada   TEXT,
    data_devolucao_efetiva TIMESTAMP,
    condicao_devolucao     VARCHAR(20),
    observacoes_devolucao  TEXT,
    itens_conferidos       TEXT[] NOT NULL DEFAULT '{}',
    atendente_balcao       VARCHAR(150),
    CONSTRAINT chk_emprestimo_cond_ret CHECK (condicao_retirada IS NULL OR condicao_retirada IN ('otimo', 'bom', 'regular', 'danificado')),
    CONSTRAINT chk_emprestimo_cond_dev CHECK (condicao_devolucao IS NULL OR condicao_devolucao IN ('otimo', 'bom', 'regular', 'danificado'))
);

-- Linha do tempo imutável de cada reserva (trilha de auditoria; sem exclusão).
CREATE TABLE auditoria_evento (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id       UUID         NOT NULL REFERENCES reserva (id),
    titulo           VARCHAR(150) NOT NULL,
    tipo_evento      VARCHAR(30)  NOT NULL,
    responsavel_nome VARCHAR(150) NOT NULL,
    descricao        TEXT         NOT NULL,
    data_hora        TIMESTAMP    NOT NULL DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
    CONSTRAINT chk_auditoria_tipo CHECK (tipo_evento IN
        ('solicitacao', 'aprovacao', 'retirada', 'devolucao', 'cancelamento', 'recusa', 'checkin', 'nao_comparecimento'))
);

CREATE INDEX idx_auditoria_reserva ON auditoria_evento (reserva_id, data_hora);
