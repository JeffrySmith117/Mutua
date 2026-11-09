package br.icev.mutua.relatorio;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import br.icev.mutua.common.Lgpd;
import br.icev.mutua.emprestimo.Emprestimo;
import br.icev.mutua.reserva.AuditoriaEvento;
import br.icev.mutua.reserva.Reserva;
import br.icev.mutua.reserva.StatusReserva;

/** Formatos do painel administrativo, conforme os tipos de adminService.ts do front. */
public final class RelatorioDtos {

    private RelatorioDtos() {
    }

    public record MetricasAdmin(long solicitacoesPendentes, long equipamentosEmCampo, String taxaOcupacaoSalas,
                                long totalReservasMes, long profissionaisAtivos) {
    }

    public record SolicitacaoPendenteResponse(UUID id, String protocolo, String tipo, String itemNome,
                                              String patrimonioOuLocal, String profissionalNome,
                                              String registroCrea, String cpf, LocalDateTime dataInicio,
                                              LocalDateTime dataFim, String finalidade,
                                              String documentoVinculado, String status,
                                              LocalDateTime criadoEm) {
        public static SolicitacaoPendenteResponse de(Reserva r) {
            boolean equipamento = r.getRecurso().isEquipamento();
            return new SolicitacaoPendenteResponse(r.getId(), r.getProtocolo(),
                    equipamento ? "equipamento" : "ambiente", r.getRecurso().getNome(),
                    equipamento ? r.getRecurso().getPatrimonio() : r.getRecurso().getLocalizacao(),
                    r.getUsuario().getNome(), r.getUsuario().getRegistroCrea(),
                    Lgpd.mascararCpf(r.getUsuario().getCpf()), r.getDataInicio(), r.getDataFim(),
                    r.getFinalidade(), r.getDocumentoVinculado(), status(r.getStatus()), r.getCriadoEm());
        }

        private static String status(StatusReserva status) {
            return switch (status) {
                case PENDENTE -> "pendente";
                case CONFIRMADA -> "aprovada";
                case RECUSADA -> "recusada";
                case EM_USO -> "em_campo";
                default -> "concluida";
            };
        }
    }

    public record EventoLinhaTempo(String titulo, LocalDateTime dataHora, String responsavel, String descricao,
                                   String tipo) {
        /** O front só conhece seis tipos de evento; os extras do back-end são mapeados para o mais próximo. */
        public static EventoLinhaTempo de(AuditoriaEvento e) {
            String tipo = switch (e.getTipoEvento()) {
                case "checkin" -> "retirada";
                case "nao_comparecimento" -> "cancelamento";
                default -> e.getTipoEvento();
            };
            return new EventoLinhaTempo(e.getTitulo(), e.getDataHora(), e.getResponsavelNome(), e.getDescricao(),
                    tipo);
        }
    }

    public record DadosBalcao(LocalDateTime retiradoEm, LocalDateTime devolvidoEm, String condicaoRetirada,
                              String condicaoDevolucao, String atendenteBalcao, String observacoes,
                              List<String> itensConferidos) {
        public static DadosBalcao de(Emprestimo e) {
            String observacoes = e.getObservacoesDevolucao() != null ? e.getObservacoesDevolucao()
                    : e.getObservacoesRetirada();
            return new DadosBalcao(e.getDataRetirada(), e.getDataDevolucaoEfetiva(), e.getCondicaoRetirada(),
                    e.getCondicaoDevolucao(), e.getAtendenteBalcao(), observacoes, e.getItensConferidos());
        }
    }

    public record RegistroHistoricoResponse(UUID id, String protocolo, String tipo, String recursoNome,
                                            String patrimonioOuLocal, String profissionalNome,
                                            String registroCrea, String cpfMascarado, LocalDateTime dataInicio,
                                            LocalDateTime dataFim, String status,
                                            String motivoCancelamentoOuRecusa, DadosBalcao dadosBalcao,
                                            String finalidade, List<EventoLinhaTempo> linhaDoTempo) {
        public static RegistroHistoricoResponse de(Reserva r, Emprestimo e, List<AuditoriaEvento> eventos) {
            boolean equipamento = r.getRecurso().isEquipamento();
            String motivo = r.getMotivoRecusaCancelamento();
            if (motivo == null && r.getStatus() == StatusReserva.NAO_COMPARECEU) {
                motivo = "Não compareceu dentro da tolerância.";
            }
            return new RegistroHistoricoResponse(r.getId(), r.getProtocolo(),
                    equipamento ? "equipamento" : "ambiente", r.getRecurso().getNome(),
                    equipamento ? r.getRecurso().getPatrimonio() : r.getRecurso().getLocalizacao(),
                    r.getUsuario().getNome(), r.getUsuario().getRegistroCrea(),
                    Lgpd.mascararCpf(r.getUsuario().getCpf()), r.getDataInicio(), r.getDataFim(),
                    status(r.getStatus()), motivo, e == null ? null : DadosBalcao.de(e), r.getFinalidade(),
                    eventos.stream().map(EventoLinhaTempo::de).toList());
        }

        private static String status(StatusReserva status) {
            return switch (status) {
                case CONCLUIDA -> "concluida";
                case CANCELADA, NAO_COMPARECEU -> "cancelada";
                case RECUSADA -> "recusada";
                default -> "em_uso";
            };
        }
    }
}
