package br.icev.mutua.recurso;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class RecursoAdminDtos {

    private RecursoAdminDtos() {
    }

    /**
     * Cadastro de ambiente ou equipamento. O que não for informado recebe o padrão: capacidade 1, prazo de
     * 1 dia, funcionamento de segunda a sexta das 08h às 18h e sem exigência de aprovação.
     */
    public record RecursoRequest(
            @NotBlank(message = "Informe o nome.") @Size(max = 150) String nome,
            @NotNull(message = "Informe o tipo.") TipoRecurso tipo,
            @Size(max = 50) String patrimonio,
            @Size(max = 150) String localizacao,
            String descricao,
            @Size(max = 100) String categoria,
            @Min(value = 1, message = "A capacidade deve ser de pelo menos 1.") Integer capacidade,
            @Min(value = 1, message = "O prazo máximo deve ser de pelo menos 1 dia.") Integer prazoMaxDias,
            Boolean exigeAprovacao,
            Boolean exigeArtSisant,
            LocalTime horarioAbertura,
            LocalTime horarioFechamento,
            List<Integer> diasSemana,
            List<String> recursosDisponiveis,
            List<String> especificacoes) {
    }

    public record AtivoRequest(@NotNull(message = "Informe se o recurso está ativo.") Boolean ativo) {
    }

    public record RecursoAdminResponse(UUID id, String nome, TipoRecurso tipo, String patrimonio,
                                       String localizacao, String descricao, String categoria, int capacidade,
                                       int prazoMaxDias, boolean exigeAprovacao, boolean exigeArtSisant,
                                       LocalTime horarioAbertura, LocalTime horarioFechamento,
                                       String horarioFuncionamento, List<Integer> diasSemana,
                                       List<String> recursosDisponiveis, List<String> especificacoes,
                                       boolean ativo, LocalDateTime criadoEm) {
        public static RecursoAdminResponse de(Recurso r) {
            return new RecursoAdminResponse(r.getId(), r.getNome(), r.getTipo(), r.getPatrimonio(),
                    r.getLocalizacao(), r.getDescricao(), r.getCategoria(), r.getCapacidade(),
                    r.getPrazoMaxDias(), r.isExigeAprovacao(), r.isExigeArtSisant(), r.getHorarioAbertura(),
                    r.getHorarioFechamento(), Horarios.descrever(r), r.getDiasSemana(),
                    r.getRecursosDisponiveis(), r.getEspecificacoes(), r.isAtivo(), r.getCriadoEm());
        }
    }
}
