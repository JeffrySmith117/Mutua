import React from 'react'
import type { RegistroHistorico } from '../../services/adminService'

interface Props {
  registro: RegistroHistorico
  aoFechar: () => void
}

export const HistoricoModalAuditoria: React.FC<Props> = ({ registro, aoFechar }) => {
  const formatarDataHora = (iso: string) => {
    try {
      const d = new Date(iso)
      return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } catch {
      return iso
    }
  }

  const renderBadgeStatus = (status: RegistroHistorico['status']) => {
    switch (status) {
      case 'concluida':
        return <span className="badge-auditoria status-concluida">✓ Concluída & Homologada</span>
      case 'em_uso':
        return <span className="badge-auditoria status-em-uso">● Em Uso / Em Campo</span>
      case 'cancelada':
        return <span className="badge-auditoria status-cancelada">✕ Cancelada pelo Associado</span>
      case 'recusada':
        return <span className="badge-auditoria status-recusada">✕ Recusada pela Gestão</span>
      default:
        return <span className="badge-auditoria">{status}</span>
    }
  }

  const renderBadgeCondicao = (condicao?: string) => {
    switch (condicao) {
      case 'otimo':
        return <span className="badge-condicao-mini cond-otimo">✓ Ótimo</span>
      case 'bom':
        return <span className="badge-condicao-mini cond-bom">✓ Bom</span>
      case 'regular':
        return <span className="badge-condicao-mini cond-regular">⚠️ Regular</span>
      case 'danificado':
        return <span className="badge-condicao-mini cond-danificado">✕ Danificado</span>
      default:
        return <span>{condicao || 'Não avaliado'}</span>
    }
  }

  return (
    <div className="modal-admin-overlay" onClick={aoFechar}>
      <div
        className="modal-admin-container modal-auditoria-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-auditoria"
      >
        {/* Cabeçalho Oficial Timbrado */}
        <div className="auditoria-cabecalho-timbrado">
          <div className="auditoria-timbre-esquerda">
            <div className="timbre-logo-area">
              <span className="timbre-sigla">MÚTUA-PI</span>
              <span className="timbre-orgao">CREA-PI • CONFEA</span>
            </div>
            <div>
              <span className="timbre-doc-tipo">RELATÓRIO DE FISCALIZAÇÃO & AUDITORIA OPERACIONAL</span>
              <h2 id="titulo-auditoria" className="auditoria-doc-titulo">
                Protocolo {registro.protocolo}
              </h2>
            </div>
          </div>

          <div className="auditoria-timbre-direita">
            {renderBadgeStatus(registro.status)}
            <button
              type="button"
              className="btn-fechar-admin btn-nao-imprimir"
              onClick={aoFechar}
              title="Fechar janela"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="modal-admin-corpo modal-auditoria-corpo">
          {/* Card Resumo de Partes e Objeto */}
          <section className="auditoria-secao-dados">
            <div className="auditoria-coluna">
              <h4 className="auditoria-subtitulo-secao">👤 Associado Solicitante</h4>
              <div className="linha-dado-auditoria">
                <span className="rotulo-aud">Nome Completo:</span>
                <strong className="valor-aud">{registro.profissionalNome}</strong>
              </div>
              <div className="linha-dado-auditoria">
                <span className="rotulo-aud">Registro CREA-PI:</span>
                <span className="valor-aud">{registro.registroCrea}</span>
              </div>
              <div className="linha-dado-auditoria">
                <span className="rotulo-aud">CPF (Protegido LGPD):</span>
                <span className="valor-aud tag-lgpd-cpf">{registro.cpfMascarado}</span>
              </div>
            </div>

            <div className="auditoria-coluna">
              <h4 className="auditoria-subtitulo-secao">📦 Recurso Vinculado</h4>
              <div className="linha-dado-auditoria">
                <span className="rotulo-aud">Identificação:</span>
                <strong className="valor-aud">{registro.recursoNome}</strong>
              </div>
              <div className="linha-dado-auditoria">
                <span className="rotulo-aud">Patrimônio / Local:</span>
                <span className="valor-aud">{registro.patrimonioOuLocal}</span>
              </div>
              <div className="linha-dado-auditoria">
                <span className="rotulo-aud">Período Contratado:</span>
                <span className="valor-aud">
                  {formatarDataHora(registro.dataInicio)} até {formatarDataHora(registro.dataFim)}
                </span>
              </div>
            </div>
          </section>

          {/* Finalidade Técnica */}
          <div className="auditoria-box-finalidade">
            <span className="rotulo-aud">Finalidade Cadastrada pelo Profissional:</span>
            <p className="texto-finalidade-aud">{registro.finalidade}</p>
          </div>

          {/* Alerta de Cancelamento ou Recusa se aplicável */}
          {registro.motivoCancelamentoOuRecusa && (
            <div className="auditoria-box-alerta-motivo">
              <span className="alerta-icone">⚠️</span>
              <div>
                <strong>Justificativa Formal Registrada:</strong>
                <p>{registro.motivoCancelamentoOuRecusa}</p>
              </div>
            </div>
          )}

          {/* Vistoria e Checklist de Balcão (se equipamento) */}
          {registro.dadosBalcao && (
            <section className="auditoria-secao-balcao">
              <h4 className="auditoria-subtitulo-secao">
                📋 Vistoria Presencial de Balcão • Crea Tec HUB
              </h4>

              <div className="grid-vistoria-balcao">
                <div className="card-vistoria-item">
                  <span className="rotulo-aud">Retirada em:</span>
                  <strong>
                    {registro.dadosBalcao.retiradoEm
                      ? formatarDataHora(registro.dadosBalcao.retiradoEm)
                      : 'Não retirado'}
                  </strong>
                  <div className="linha-condicao-vistoria">
                    <span>Estado Inicial:</span>
                    {renderBadgeCondicao(registro.dadosBalcao.condicaoRetirada)}
                  </div>
                </div>

                <div className="card-vistoria-item">
                  <span className="rotulo-aud">Devolução em:</span>
                  <strong>
                    {registro.dadosBalcao.devolvidoEm
                      ? formatarDataHora(registro.dadosBalcao.devolvidoEm)
                      : 'Pendente de devolução'}
                  </strong>
                  <div className="linha-condicao-vistoria">
                    <span>Estado Final:</span>
                    {renderBadgeCondicao(registro.dadosBalcao.condicaoDevolucao)}
                  </div>
                </div>

                <div className="card-vistoria-item full-width">
                  <span className="rotulo-aud">Atendente de Balcão Responsável:</span>
                  <strong>{registro.dadosBalcao.atendenteBalcao}</strong>
                  {registro.dadosBalcao.observacoes && (
                    <p className="obs-balcao-auditoria">"{registro.dadosBalcao.observacoes}"</p>
                  )}
                </div>
              </div>

              {registro.dadosBalcao.itensConferidos &&
                registro.dadosBalcao.itensConferidos.length > 0 && (
                  <div className="checklist-itens-auditoria">
                    <span className="rotulo-aud">Itens da Maleta Conferidos na Entrega:</span>
                    <ul className="lista-itens-conferidos">
                      {registro.dadosBalcao.itensConferidos.map((item, idx) => (
                        <li key={idx}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </section>
          )}

          {/* Linha do Tempo Cronológica de Auditoria */}
          <section className="auditoria-secao-timeline">
            <h4 className="auditoria-subtitulo-secao">
              ⏱️ Linha do Tempo e Rastreabilidade do Processo
            </h4>
            <div className="auditoria-timeline-vertical">
              {registro.linhaDoTempo.map((evento, idx) => (
                <div key={idx} className={`timeline-passo passo-tipo-${evento.tipo}`}>
                  <div className="timeline-marcador">
                    <span className="marcador-circulo" />
                    {idx < registro.linhaDoTempo.length - 1 && <span className="marcador-linha" />}
                  </div>

                  <div className="timeline-conteudo-evento">
                    <div className="evento-cabecalho">
                      <span className="evento-titulo">{evento.titulo}</span>
                      <time className="evento-data">{formatarDataHora(evento.dataHora)}</time>
                    </div>
                    <div className="evento-responsavel">
                      <span className="rotulo-resp">Autor:</span> {evento.responsavel}
                    </div>
                    <p className="evento-descricao">{evento.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rodapé Administrativo / Timbre de Validação */}
          <div className="auditoria-chancela-rodape">
            <div className="chancela-bloco">
              <div className="linha-assinatura" />
              <span>Secretaria Administrativa Mútua-PI</span>
            </div>
            <div className="chancela-bloco">
              <div className="linha-assinatura" />
              <span>Responsável Técnico Crea Tec HUB</span>
            </div>
          </div>
        </div>

        {/* Barra de Ações do Modal */}
        <div className="modal-admin-acoes btn-nao-imprimir">
          <button type="button" className="btn btn-secundario" onClick={aoFechar}>
            Fechar
          </button>
          <button
            type="button"
            className="btn btn-primario btn-imprimir-auditoria"
            onClick={() => window.print()}
          >
            🖨️ Imprimir Ficha de Auditoria
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoricoModalAuditoria
