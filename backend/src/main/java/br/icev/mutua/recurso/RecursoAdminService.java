package br.icev.mutua.recurso;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import br.icev.mutua.common.ApiException;
import br.icev.mutua.common.Relogio;
import br.icev.mutua.recurso.RecursoAdminDtos.RecursoAdminResponse;
import br.icev.mutua.recurso.RecursoAdminDtos.RecursoRequest;
import br.icev.mutua.reserva.Reserva;
import br.icev.mutua.reserva.ReservaRepository;
import br.icev.mutua.reserva.StatusReserva;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Cadastro de ambientes e equipamentos: um novo recurso é só um registro, sem mudança de código. */
@Service
public class RecursoAdminService {

    private final RecursoRepository recursos;
    private final ReservaRepository reservas;

    public RecursoAdminService(RecursoRepository recursos, ReservaRepository reservas) {
        this.recursos = recursos;
        this.reservas = reservas;
    }

    /** Lista todos, inclusive os inativos (a listagem pública mostra só os ativos). */
    @Transactional(readOnly = true)
    public List<RecursoAdminResponse> listar() {
        return recursos.findAll(Sort.by("tipo", "nome")).stream().map(RecursoAdminResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public RecursoAdminResponse buscar(UUID id) {
        return RecursoAdminResponse.de(obter(id));
    }

    @Transactional
    public RecursoAdminResponse criar(RecursoRequest req) {
        Recurso recurso = new Recurso();
        recurso.setTipo(req.tipo());
        recurso.setCriadoEm(Relogio.agora());
        aplicar(recurso, req);
        if (recurso.getPatrimonio() != null && recursos.existsByPatrimonio(recurso.getPatrimonio())) {
            throw patrimonioDuplicado(recurso.getPatrimonio());
        }
        return RecursoAdminResponse.de(recursos.saveAndFlush(recurso));
    }

    @Transactional
    public RecursoAdminResponse atualizar(UUID id, RecursoRequest req) {
        // Trava o recurso: reservas sendo criadas ao mesmo tempo não escapam da conferência abaixo.
        Recurso recurso = recursos.buscarParaReserva(id)
                .orElseThrow(() -> ApiException.naoEncontrada("Recurso não encontrado."));
        // O tipo define se o recurso é exclusivo ou de capacidade compartilhada; mudá-lo com reservas
        // existentes deixaria a regra de conflito inconsistente.
        if (req.tipo() != recurso.getTipo()) {
            throw ApiException.campoInvalido("tipo", "O tipo de um recurso não pode ser alterado.");
        }
        Funcionamento antes = Funcionamento.de(recurso);
        aplicar(recurso, req);
        if (recurso.getPatrimonio() != null
                && recursos.existsByPatrimonioAndIdNot(recurso.getPatrimonio(), id)) {
            throw patrimonioDuplicado(recurso.getPatrimonio());
        }
        if (!antes.equals(Funcionamento.de(recurso))) {
            verificarReservasAtivas(recurso);
        }
        return RecursoAdminResponse.de(recursos.saveAndFlush(recurso));
    }

    @Transactional
    public RecursoAdminResponse definirAtivo(UUID id, boolean ativo) {
        Recurso recurso = obter(id);
        if (!ativo && reservas.existsByRecursoIdAndStatusInAndDataFimAfter(id, StatusReserva.ATIVAS,
                Relogio.agora())) {
            throw ApiException.conflito("Não é possível desativar: o recurso tem reservas pendentes, "
                    + "confirmadas ou em uso. Cancele ou conclua essas reservas antes.");
        }
        recurso.setAtivo(ativo);
        return RecursoAdminResponse.de(recursos.saveAndFlush(recurso));
    }

    /** Horário, dias, capacidade e prazo: o que decide se uma reserva existente ainda cabe no recurso. */
    private record Funcionamento(LocalTime abertura, LocalTime fechamento, List<Integer> dias, int capacidade,
                                 int prazoMaxDias) {
        static Funcionamento de(Recurso r) {
            return new Funcionamento(r.getHorarioAbertura(), r.getHorarioFechamento(), List.copyOf(r.getDiasSemana()),
                    r.getCapacidade(), r.getPrazoMaxDias());
        }
    }

    /**
     * Ao mudar horário, dias, capacidade ou prazo, nenhuma reserva pendente ou confirmada pode ficar fora do
     * novo funcionamento: a edição é recusada (409) com os protocolos afetados, para a gestão cancelar ou
     * remarcar antes. Reservas já em uso ficam de fora (o uso em andamento não é interrompido).
     */
    private void verificarReservasAtivas(Recurso recurso) {
        List<Reserva> futuras = reservas.findByRecursoIdAndStatusInAndDataFimAfter(recurso.getId(),
                StatusReserva.ATIVAS, Relogio.agora());
        List<Reserva> aReavaliar = futuras.stream().filter(r -> r.getStatus() != StatusReserva.EM_USO).toList();

        List<String> foraDoFuncionamento = aReavaliar.stream().filter(r -> !cabe(recurso, r))
                .map(Reserva::getProtocolo).toList();
        if (!foraDoFuncionamento.isEmpty()) {
            throw ApiException.conflito("Não é possível salvar: " + foraDoFuncionamento.size()
                    + " reserva(s) ativa(s) ficariam fora do novo funcionamento ("
                    + listar(foraDoFuncionamento) + "). Cancele ou remarque essas reservas antes.");
        }
        if (!recurso.isExclusivo() && maximoSimultaneas(aReavaliar) > recurso.getCapacidade()) {
            throw ApiException.conflito("Não é possível reduzir a capacidade para " + recurso.getCapacidade()
                    + ": há horários com mais reservas ativas do que isso. Cancele ou remarque algumas antes.");
        }
    }

    private boolean cabe(Recurso recurso, Reserva r) {
        if (recurso.isEquipamento()) {
            return noExpediente(recurso, r.getDataInicio()) && noExpediente(recurso, r.getDataFim())
                    && Duration.between(r.getDataInicio(), r.getDataFim())
                    .compareTo(Duration.ofDays(recurso.getPrazoMaxDias())) <= 0;
        }
        return recurso.getDiasSemana().contains(r.getDataInicio().getDayOfWeek().getValue())
                && !r.getDataInicio().toLocalTime().isBefore(recurso.getHorarioAbertura())
                && !r.getDataFim().toLocalTime().isAfter(recurso.getHorarioFechamento());
    }

    private boolean noExpediente(Recurso recurso, LocalDateTime momento) {
        return recurso.getDiasSemana().contains(momento.getDayOfWeek().getValue())
                && !momento.toLocalTime().isBefore(recurso.getHorarioAbertura())
                && !momento.toLocalTime().isAfter(recurso.getHorarioFechamento());
    }

    /** Maior número de reservas ao mesmo tempo, avaliado no início de cada uma. */
    private int maximoSimultaneas(List<Reserva> lista) {
        int maximo = 0;
        for (Reserva ponto : lista) {
            LocalDateTime instante = ponto.getDataInicio();
            int simultaneas = (int) lista.stream()
                    .filter(r -> !r.getDataInicio().isAfter(instante) && r.getDataFim().isAfter(instante)).count();
            maximo = Math.max(maximo, simultaneas);
        }
        return maximo;
    }

    private String listar(List<String> protocolos) {
        String primeiros = String.join(", ", protocolos.subList(0, Math.min(5, protocolos.size())));
        return protocolos.size() > 5 ? primeiros + " e mais " + (protocolos.size() - 5) : primeiros;
    }

    private Recurso obter(UUID id) {
        return recursos.findById(id).orElseThrow(() -> ApiException.naoEncontrada("Recurso não encontrado."));
    }

    /** Copia os dados da requisição aplicando os padrões e as regras de cada tipo. */
    private void aplicar(Recurso recurso, RecursoRequest req) {
        boolean equipamento = req.tipo() == TipoRecurso.EQUIPAMENTO;
        String patrimonio = textoOuNulo(req.patrimonio());
        if (equipamento && patrimonio == null) {
            throw ApiException.campoInvalido("patrimonio", "Informe o número de patrimônio do equipamento.");
        }
        if (!equipamento && patrimonio != null) {
            throw ApiException.campoInvalido("patrimonio", "Apenas equipamentos têm número de patrimônio.");
        }

        LocalTime abertura = req.horarioAbertura() != null ? req.horarioAbertura() : LocalTime.of(8, 0);
        LocalTime fechamento = req.horarioFechamento() != null ? req.horarioFechamento() : LocalTime.of(18, 0);
        if (!fechamento.isAfter(abertura)) {
            throw ApiException.campoInvalido("horarioFechamento",
                    "O horário de fechamento deve ser posterior ao de abertura.");
        }

        recurso.setNome(req.nome().trim());
        recurso.setPatrimonio(patrimonio);
        recurso.setLocalizacao(textoOuNulo(req.localizacao()));
        recurso.setDescricao(textoOuNulo(req.descricao()));
        recurso.setCategoria(textoOuNulo(req.categoria()));
        recurso.setCapacidade(req.capacidade() != null ? req.capacidade() : 1);
        recurso.setPrazoMaxDias(req.prazoMaxDias() != null ? req.prazoMaxDias() : 1);
        recurso.setExigeAprovacao(Boolean.TRUE.equals(req.exigeAprovacao()));
        recurso.setExigeArtSisant(equipamento && Boolean.TRUE.equals(req.exigeArtSisant()));
        recurso.setHorarioAbertura(abertura);
        recurso.setHorarioFechamento(fechamento);
        recurso.setDiasSemana(dias(req.diasSemana()));
        recurso.setRecursosDisponiveis(limpar(req.recursosDisponiveis()));
        recurso.setEspecificacoes(limpar(req.especificacoes()));
    }

    private List<Integer> dias(List<Integer> informados) {
        if (informados == null || informados.isEmpty()) {
            return List.of(1, 2, 3, 4, 5);
        }
        if (informados.stream().anyMatch(d -> d == null || d < 1 || d > 7)) {
            throw ApiException.campoInvalido("diasSemana", "Use números de 1 (segunda) a 7 (domingo).");
        }
        return informados.stream().distinct().sorted().toList();
    }

    private List<String> limpar(List<String> itens) {
        return itens == null ? List.of()
                : itens.stream().filter(i -> i != null && !i.isBlank()).map(String::trim).toList();
    }

    private String textoOuNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private ApiException patrimonioDuplicado(String patrimonio) {
        return ApiException.conflito("patrimonio", "Já existe um recurso com o patrimônio " + patrimonio + ".");
    }
}
