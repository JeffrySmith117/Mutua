package br.icev.mutua.relatorio;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import br.icev.mutua.common.ApiException;
import br.icev.mutua.common.Relogio;
import br.icev.mutua.emprestimo.Emprestimo;
import br.icev.mutua.emprestimo.EmprestimoRepository;
import br.icev.mutua.recurso.Recurso;
import br.icev.mutua.recurso.RecursoRepository;
import br.icev.mutua.recurso.TipoRecurso;
import br.icev.mutua.relatorio.RelatorioDtos.MetricasAdmin;
import br.icev.mutua.relatorio.RelatorioDtos.RegistroHistoricoResponse;
import br.icev.mutua.relatorio.RelatorioDtos.SolicitacaoPendenteResponse;
import br.icev.mutua.reserva.AuditoriaEvento;
import br.icev.mutua.reserva.AuditoriaRepository;
import br.icev.mutua.reserva.Reserva;
import br.icev.mutua.reserva.ReservaRepository;
import br.icev.mutua.reserva.StatusReserva;
import br.icev.mutua.usuario.Perfil;
import br.icev.mutua.usuario.UsuarioRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RelatorioService {

    private static final int LIMITE_HISTORICO = 200;

    private static final Map<String, Set<StatusReserva>> GRUPOS_HISTORICO = Map.of(
            "concluida", EnumSet.of(StatusReserva.CONCLUIDA),
            "cancelada", EnumSet.of(StatusReserva.CANCELADA, StatusReserva.NAO_COMPARECEU),
            "recusada", EnumSet.of(StatusReserva.RECUSADA),
            "em_uso", EnumSet.of(StatusReserva.EM_USO));

    private final ReservaRepository reservas;
    private final RecursoRepository recursos;
    private final UsuarioRepository usuarios;
    private final EmprestimoRepository emprestimos;
    private final AuditoriaRepository auditoria;

    public RelatorioService(ReservaRepository reservas, RecursoRepository recursos, UsuarioRepository usuarios,
                            EmprestimoRepository emprestimos, AuditoriaRepository auditoria) {
        this.reservas = reservas;
        this.recursos = recursos;
        this.usuarios = usuarios;
        this.emprestimos = emprestimos;
        this.auditoria = auditoria;
    }

    public MetricasAdmin metricas() {
        YearMonth mes = YearMonth.from(Relogio.agora());
        LocalDateTime inicio = mes.atDay(1).atStartOfDay();
        LocalDateTime fim = mes.plusMonths(1).atDay(1).atStartOfDay();

        long totalMes = reservas.contarNoPeriodo(inicio, fim,
                EnumSet.of(StatusReserva.CANCELADA, StatusReserva.RECUSADA));
        return new MetricasAdmin(
                reservas.countByStatus(StatusReserva.PENDENTE),
                reservas.countByStatusAndRecursoTipo(StatusReserva.EM_USO, TipoRecurso.EQUIPAMENTO),
                taxaOcupacaoSalas(mes, inicio, fim),
                totalMes,
                usuarios.countByPerfilAndAtivoTrue(Perfil.PROFISSIONAL));
    }

    public List<SolicitacaoPendenteResponse> pendencias() {
        return reservas.findByStatusOrderByCriadoEmAsc(StatusReserva.PENDENTE).stream()
                .map(SolicitacaoPendenteResponse::de).toList();
    }

    public List<RegistroHistoricoResponse> historico(String busca, String tipo, String status,
                                                     LocalDate dataInicio, LocalDate dataFim) {
        Set<StatusReserva> statusAlvo = interpretarStatus(status);
        TipoRecurso tipoAlvo = interpretarTipo(tipo);

        Specification<Reserva> filtro = (reserva, consulta, cb) -> {
            Join<Reserva, Recurso> recurso = reserva.join("recurso");
            Join<Reserva, ?> usuario = reserva.join("usuario");
            List<Predicate> condicoes = new ArrayList<>();
            condicoes.add(reserva.get("status").in(statusAlvo));
            if (tipoAlvo != null) {
                condicoes.add(tipoAlvo == TipoRecurso.EQUIPAMENTO
                        ? cb.equal(recurso.get("tipo"), TipoRecurso.EQUIPAMENTO)
                        : cb.notEqual(recurso.get("tipo"), TipoRecurso.EQUIPAMENTO));
            }
            if (dataInicio != null) {
                condicoes.add(cb.greaterThanOrEqualTo(reserva.get("dataInicio"), dataInicio.atStartOfDay()));
            }
            if (dataFim != null) {
                condicoes.add(cb.lessThan(reserva.get("dataInicio"), dataFim.plusDays(1).atStartOfDay()));
            }
            if (busca != null && !busca.isBlank()) {
                String termo = "%" + busca.trim().toLowerCase(Locale.ROOT) + "%";
                condicoes.add(cb.or(
                        cb.like(cb.lower(usuario.get("nome")), termo),
                        cb.like(cb.lower(cb.coalesce(usuario.<String>get("registroCrea"), "")), termo),
                        cb.like(cb.lower(reserva.get("protocolo")), termo),
                        cb.like(cb.lower(recurso.get("nome")), termo),
                        cb.like(cb.lower(cb.coalesce(recurso.<String>get("patrimonio"), "")), termo)));
            }
            return cb.and(condicoes.toArray(new Predicate[0]));
        };

        List<Reserva> encontradas = reservas.findAll(filtro,
                PageRequest.of(0, LIMITE_HISTORICO, Sort.by(Sort.Direction.DESC, "dataInicio"))).getContent();
        return montarRegistros(encontradas);
    }

    public RegistroHistoricoResponse historicoPorId(UUID id) {
        Reserva reserva = reservas.findById(id)
                .orElseThrow(() -> ApiException.naoEncontrada("Registro de histórico não encontrado."));
        return montarRegistros(List.of(reserva)).get(0);
    }

    private List<RegistroHistoricoResponse> montarRegistros(List<Reserva> lista) {
        if (lista.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = lista.stream().map(Reserva::getId).toList();
        Map<UUID, Emprestimo> balcao = emprestimos.findByReservaIdIn(ids).stream()
                .collect(Collectors.toMap(e -> e.getReserva().getId(), Function.identity()));
        Map<UUID, List<AuditoriaEvento>> eventos = auditoria.buscarDasReservas(ids).stream()
                .collect(Collectors.groupingBy(e -> e.getReserva().getId()));
        return lista.stream()
                .map(r -> RegistroHistoricoResponse.de(r, balcao.get(r.getId()),
                        eventos.getOrDefault(r.getId(), List.of())))
                .toList();
    }

    /**
     * Ocupação do mês das salas e do auditório: horas reservadas (confirmadas, em uso ou concluídas)
     * sobre as horas de funcionamento do mês. O coworking fica de fora por ter capacidade compartilhada.
     */
    private String taxaOcupacaoSalas(YearMonth mes, LocalDateTime inicio, LocalDateTime fim) {
        List<TipoRecurso> tipos = List.of(TipoRecurso.SALA, TipoRecurso.AUDITORIO);
        long reservados = reservas.buscarDeTiposNoPeriodo(tipos, inicio, fim,
                        EnumSet.of(StatusReserva.CONFIRMADA, StatusReserva.EM_USO, StatusReserva.CONCLUIDA))
                .stream().mapToLong(r -> Duration.between(r.getDataInicio(), r.getDataFim()).toMinutes()).sum();

        long disponiveis = 0;
        for (Recurso recurso : recursos.findByTipoInAndAtivoTrue(tipos)) {
            long dias = mes.atDay(1).datesUntil(mes.plusMonths(1).atDay(1))
                    .filter(d -> recurso.getDiasSemana().contains(d.getDayOfWeek().getValue())).count();
            disponiveis += dias * Duration.between(recurso.getHorarioAbertura(), recurso.getHorarioFechamento())
                    .toMinutes();
        }
        return disponiveis == 0 ? "0%" : Math.round(100.0 * reservados / disponiveis) + "%";
    }

    private Set<StatusReserva> interpretarStatus(String status) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("todos")) {
            return GRUPOS_HISTORICO.values().stream().flatMap(Set::stream)
                    .collect(Collectors.toCollection(() -> EnumSet.noneOf(StatusReserva.class)));
        }
        Set<StatusReserva> grupo = GRUPOS_HISTORICO.get(status.trim().toLowerCase(Locale.ROOT));
        if (grupo == null) {
            throw ApiException.campoInvalido("status", "Status inválido: " + status);
        }
        return grupo;
    }

    private TipoRecurso interpretarTipo(String tipo) {
        if (tipo == null || tipo.isBlank() || tipo.equalsIgnoreCase("todos")) {
            return null;
        }
        return switch (tipo.trim().toLowerCase(Locale.ROOT)) {
            case "equipamento" -> TipoRecurso.EQUIPAMENTO;
            case "ambiente" -> TipoRecurso.SALA; // qualquer valor diferente de EQUIPAMENTO; ver o filtro
            default -> throw ApiException.campoInvalido("tipo", "Tipo inválido: " + tipo);
        };
    }
}
