package br.icev.mutua.recurso;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public final class RecursoDtos {

    private RecursoDtos() {
    }

    public record AmbienteResponse(UUID id, String nome, TipoRecurso tipo, int capacidade, String localizacao,
                                   String descricao, List<String> recursosDisponiveis,
                                   String horarioFuncionamento, LocalTime horarioAbertura,
                                   LocalTime horarioFechamento, boolean exigeAprovacao, boolean ativo) {
        public static AmbienteResponse de(Recurso r) {
            return new AmbienteResponse(r.getId(), r.getNome(), r.getTipo(), r.getCapacidade(),
                    r.getLocalizacao(), r.getDescricao(), r.getRecursosDisponiveis(), Horarios.descrever(r),
                    r.getHorarioAbertura(), r.getHorarioFechamento(), r.isExigeAprovacao(), r.isAtivo());
        }
    }

    /** O nome exigeArtSisAnt é o do contrato (com a grafia original). */
    public record EquipamentoResponse(UUID id, String nome, String patrimonio, String categoria,
                                      String descricao, int prazoMaximoDias, boolean exigeArtSisAnt,
                                      String status, List<String> especificacoes, boolean exigeAprovacao,
                                      boolean ativo) {
        public static EquipamentoResponse de(Recurso r, boolean emCampo) {
            return new EquipamentoResponse(r.getId(), r.getNome(), r.getPatrimonio(), r.getCategoria(),
                    r.getDescricao(), r.getPrazoMaxDias(), r.isExigeArtSisant(),
                    emCampo ? "EM_CAMPO" : "DISPONIVEL", r.getEspecificacoes(), r.isExigeAprovacao(),
                    r.isAtivo());
        }
    }

    public record Intervalo(LocalTime inicio, LocalTime fim, String protocolo, String motivo) {
    }

    public record DisponibilidadeResponse(UUID ambienteId, LocalDate data, List<Intervalo> intervalosOcupados,
                                          LocalTime horarioAbertura, LocalTime horarioFechamento) {
    }
}
