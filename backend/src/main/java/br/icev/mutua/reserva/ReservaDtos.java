package br.icev.mutua.reserva;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import br.icev.mutua.recurso.Recurso;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class ReservaDtos {

    private ReservaDtos() {
    }

    public record Periodo(LocalDateTime inicio, LocalDateTime fim) {
    }

    /**
     * Aceita o formato do contrato (dataInicio/dataFim em ISO) e também o que o front envia hoje:
     * data + horarioInicio/horarioFim (ambientes) e dataRetirada/horarioRetirada/dataDevolucao/horarioDevolucao
     * (equipamentos), com ambienteId/equipamentoId no lugar de recursoId.
     */
    public record CriarReservaRequest(
            @NotNull(message = "Informe o recurso.") @JsonAlias({"ambienteId", "equipamentoId"}) UUID recursoId,
            String tipo,
            LocalDateTime dataInicio, LocalDateTime dataFim,
            LocalDate data, LocalTime horarioInicio, LocalTime horarioFim,
            LocalDate dataRetirada, LocalTime horarioRetirada, LocalDate dataDevolucao, LocalTime horarioDevolucao,
            @NotBlank(message = "Informe a finalidade.") String finalidade,
            String documentoVinculado, String numeroArt, Boolean termoAceito) {

        public Periodo periodo() {
            if (dataInicio != null && dataFim != null) {
                return new Periodo(dataInicio, dataFim);
            }
            if (data != null && horarioInicio != null && horarioFim != null) {
                return new Periodo(data.atTime(horarioInicio), data.atTime(horarioFim));
            }
            if (dataRetirada != null && horarioRetirada != null && dataDevolucao != null
                    && horarioDevolucao != null) {
                return new Periodo(dataRetirada.atTime(horarioRetirada), dataDevolucao.atTime(horarioDevolucao));
            }
            return null;
        }

        public String documento() {
            if (documentoVinculado != null && !documentoVinculado.isBlank()) {
                return documentoVinculado.trim();
            }
            if (numeroArt != null && !numeroArt.isBlank()) {
                return "ART: " + numeroArt.trim();
            }
            return null;
        }
    }

    public record CancelarRequest(String motivo) {
    }

    public record ReservaCriadaResponse(UUID id, String protocolo, UUID recursoId, String recursoNome,
                                        UUID usuarioId, StatusReserva status, LocalDateTime dataInicio,
                                        LocalDateTime dataFim, LocalDateTime criadoEm, String mensagem) {
        public static ReservaCriadaResponse de(Reserva r, String mensagem) {
            return new ReservaCriadaResponse(r.getId(), r.getProtocolo(), r.getRecurso().getId(),
                    r.getRecurso().getNome(), r.getUsuario().getId(), r.getStatus(), r.getDataInicio(),
                    r.getDataFim(), r.getCriadoEm(), mensagem);
        }
    }

    /**
     * Campos do contrato (recursoNome, patrimonioOuLocal, podeCancelar, podeCheckin) mais os nomes que as
     * telas do front já leem (titulo, subtitulo, localOuPatrimonio, permitirCancelamento, permitirCheckin,
     * detalhesTecnicos), para a integração não depender de renomear campos.
     */
    public record ReservaResumo(UUID id, String protocolo, String recursoNome, String tipo,
                                String patrimonioOuLocal, LocalDateTime dataInicio, LocalDateTime dataFim,
                                StatusReserva status, String finalidade, LocalDateTime criadoEm,
                                boolean podeCancelar, boolean podeCheckin,
                                String titulo, String subtitulo, String localOuPatrimonio,
                                boolean permitirCancelamento, boolean permitirCheckin,
                                List<String> detalhesTecnicos) {
        public static ReservaResumo de(Reserva r, boolean podeCancelar, boolean podeCheckin) {
            Recurso rec = r.getRecurso();
            String local = rec.isEquipamento()
                    ? "Patrimônio: " + rec.getPatrimonio() + " • " + rec.getLocalizacao()
                    : rec.getLocalizacao();
            List<String> detalhes = rec.isEquipamento() ? rec.getEspecificacoes() : rec.getRecursosDisponiveis();
            return new ReservaResumo(r.getId(), r.getProtocolo(), rec.getNome(),
                    rec.isEquipamento() ? "equipamento" : "ambiente",
                    rec.isEquipamento() ? rec.getPatrimonio() : rec.getLocalizacao(), r.getDataInicio(),
                    r.getDataFim(), r.getStatus(), r.getFinalidade(), r.getCriadoEm(), podeCancelar,
                    podeCheckin, rec.getNome(), rec.getDescricao(), local, podeCancelar, podeCheckin, detalhes);
        }
    }
}
