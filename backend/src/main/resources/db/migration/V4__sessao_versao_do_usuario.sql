-- Versão da sessão do usuário: o JWT carrega a versão vigente na emissão e deixa de valer quando ela muda.
-- Trocar a senha e sair (/auth/sair) incrementam a versão e encerram os tokens já emitidos.
ALTER TABLE usuario ADD COLUMN sessao_versao BIGINT NOT NULL DEFAULT 0;
