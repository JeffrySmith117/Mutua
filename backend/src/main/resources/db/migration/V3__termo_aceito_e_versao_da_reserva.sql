-- Aceite eletrônico do Termo de Guarda e Responsabilidade: momento em que o profissional aceitou, na solicitação
-- do equipamento. Fica nulo para ambientes e para empréstimos anteriores a esta migração.
ALTER TABLE reserva ADD COLUMN termo_aceito_em TIMESTAMP;

-- Controle de concorrência otimista: duas operações simultâneas sobre a mesma reserva (aprovar e recusar, por
-- exemplo) não podem se sobrescrever; a segunda a gravar é recusada.
ALTER TABLE reserva ADD COLUMN versao BIGINT NOT NULL DEFAULT 0;
