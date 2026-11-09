package br.icev.mutua.emprestimo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import br.icev.mutua.reserva.Reserva;
import br.icev.mutua.reserva.StatusReserva;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public final class EmprestimoDtos {

    private static final String CONDICOES = "otimo|bom|regular|danificado";
    private static final String MENSAGEM_CONDICAO = "A condição deve ser: otimo, bom, regular ou danificado.";

    private EmprestimoDtos() {
    }

    public record RetiradaRequest(@Pattern(regexp = CONDICOES, message = MENSAGEM_CONDICAO) String condicao,
                                  String observacao) {
    }

    public record DevolucaoRequest(
            @NotBlank(message = "Informe a condição do equipamento.")
            @Pattern(regexp = CONDICOES, message = MENSAGEM_CONDICAO) String condicao,
            String observacao, List<String> itensConferidos) {
    }

    /** Forma consumida pelo balcão do painel admin (o id é o da reserva). */
    public record MovimentacaoBalcaoResponse(UUID id, String protocolo, String equipamentoNome, String patrimonio,
                                             String profissionalNome, String registroCrea,
                                             LocalDateTime dataRetirada, LocalDateTime dataDevolucaoPrevista,
                                             LocalDateTime dataDevolucaoEfetiva, String condicaoRetirada,
                                             String condicaoDevolucao, String statusMovimentacao,
                                             String observacoes) {
        public static MovimentacaoBalcaoResponse de(Reserva r, Emprestimo e) {
            String condicaoDevolucao = e == null ? null : e.getCondicaoDevolucao();
            String observacoes = null;
            if (e != null) {
                observacoes = e.getObservacoesDevolucao() != null ? e.getObservacoesDevolucao()
                        : e.getObservacoesRetirada();
            }
            return new MovimentacaoBalcaoResponse(r.getId(), r.getProtocolo(), r.getRecurso().getNome(),
                    r.getRecurso().getPatrimonio(), r.getUsuario().getNome(), r.getUsuario().getRegistroCrea(),
                    e == null ? null : e.getDataRetirada(), r.getDataFim(),
                    e == null ? null : e.getDataDevolucaoEfetiva(),
                    e == null || e.getCondicaoRetirada() == null ? "otimo" : e.getCondicaoRetirada(),
                    condicaoDevolucao, status(r.getStatus(), condicaoDevolucao), observacoes);
        }

        private static String status(StatusReserva status, String condicaoDevolucao) {
            return switch (status) {
                case CONFIRMADA -> "aguardando_retirada";
                case EM_USO -> "em_campo";
                default -> "danificado".equals(condicaoDevolucao) ? "avaria_registrada" : "devolvido";
            };
        }
    }
}
