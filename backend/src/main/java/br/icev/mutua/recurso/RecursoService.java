package br.icev.mutua.recurso;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.function.Predicate;

import br.icev.mutua.common.ApiException;
import br.icev.mutua.recurso.RecursoDtos.AmbienteResponse;
import br.icev.mutua.recurso.RecursoDtos.DisponibilidadeResponse;
import br.icev.mutua.recurso.RecursoDtos.EquipamentoResponse;
import br.icev.mutua.recurso.RecursoDtos.Intervalo;
import br.icev.mutua.reserva.Reserva;
import br.icev.mutua.reserva.ReservaRepository;
import br.icev.mutua.reserva.StatusReserva;
import br.icev.mutua.usuario.Usuario;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecursoService {

    private static final LocalTime FIM_DO_DIA = LocalTime.of(23, 59, 59);

    private final RecursoRepository recursos;
    private final ReservaRepository reservas;

    public RecursoService(RecursoRepository recursos, ReservaRepository reservas) {
        this.recursos = recursos;
        this.reservas = reservas;
    }

    public List<AmbienteResponse> listarAmbientes(String tipo, Integer capacidadeMinima, String termoBusca) {
        Predicate<Recurso> filtro = r -> true;
        TipoRecurso tipoFiltro = interpretarTipo(tipo);
        if (tipoFiltro != null) {
            filtro = filtro.and(r -> r.getTipo() == tipoFiltro);
        }
        if (capacidadeMinima != null) {
            filtro = filtro.and(r -> r.getCapacidade() >= capacidadeMinima);
        }
        if (temTexto(termoBusca)) {
            String termo = termoBusca.toLowerCase(Locale.ROOT);
            filtro = filtro.and(r -> contem(termo, r.getNome(), r.getDescricao(), r.getLocalizacao())
                    || r.getRecursosDisponiveis().stream().anyMatch(i -> contem(termo, i)));
        }
        return recursos.findByTipoNotAndAtivoTrueOrderByNome(TipoRecurso.EQUIPAMENTO).stream()
                .filter(filtro).map(AmbienteResponse::de).toList();
    }

    public AmbienteResponse ambiente(UUID id) {
        return AmbienteResponse.de(buscar(id, false));
    }

    public List<EquipamentoResponse> listarEquipamentos(String categoria, String status, String termoBusca) {
        Set<UUID> emCampo = Set.copyOf(reservas.idsDeRecursosComStatus(StatusReserva.EM_USO));
        Predicate<Recurso> filtro = r -> true;
        if (temTexto(categoria) && !categoria.equalsIgnoreCase("todas")) {
            filtro = filtro.and(r -> categoria.equalsIgnoreCase(r.getCategoria()));
        }
        if (temTexto(termoBusca)) {
            String termo = termoBusca.toLowerCase(Locale.ROOT);
            filtro = filtro.and(r -> contem(termo, r.getNome(), r.getPatrimonio(), r.getCategoria(), r.getDescricao())
                    || r.getEspecificacoes().stream().anyMatch(i -> contem(termo, i)));
        }
        List<EquipamentoResponse> lista = recursos.findByTipoAndAtivoTrueOrderByNome(TipoRecurso.EQUIPAMENTO)
                .stream().filter(filtro)
                .map(r -> EquipamentoResponse.de(r, emCampo.contains(r.getId()))).toList();
        if (temTexto(status) && !status.equalsIgnoreCase("todos")) {
            lista = lista.stream().filter(e -> e.status().equalsIgnoreCase(status)).toList();
        }
        return lista;
    }

    public EquipamentoResponse equipamento(UUID id) {
        Recurso recurso = buscar(id, true);
        boolean emCampo = reservas.idsDeRecursosComStatus(StatusReserva.EM_USO).contains(id);
        return EquipamentoResponse.de(recurso, emCampo);
    }

    /**
     * Intervalos ocupados do dia. Em recursos exclusivos, cada reserva ativa é um intervalo; no coworking,
     * só os trechos em que a lotação está esgotada. O motivo de reservas alheias não é exposto (LGPD).
     */
    public DisponibilidadeResponse disponibilidade(UUID id, LocalDate data, Usuario usuario) {
        Recurso recurso = recursos.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> ApiException.naoEncontrada("Recurso não encontrado."));
        LocalDateTime inicioDia = data.atStartOfDay();
        LocalDateTime fimDia = data.plusDays(1).atStartOfDay();
        List<Reserva> ativas = reservas.buscarAtivasNoPeriodo(id, StatusReserva.ATIVAS, inicioDia, fimDia);

        List<Intervalo> ocupados = recurso.isExclusivo()
                ? ativas.stream().map(r -> intervaloDe(r, inicioDia, fimDia, usuario)).toList()
                : intervalosLotados(recurso, ativas, inicioDia, fimDia);
        return new DisponibilidadeResponse(id, data, ocupados, recurso.getHorarioAbertura(),
                recurso.getHorarioFechamento());
    }

    private Intervalo intervaloDe(Reserva r, LocalDateTime inicioDia, LocalDateTime fimDia, Usuario usuario) {
        boolean pode = usuario.isAdmin() || r.getUsuario().getId().equals(usuario.getId());
        return new Intervalo(hora(maior(r.getDataInicio(), inicioDia), fimDia),
                hora(menor(r.getDataFim(), fimDia), fimDia), r.getProtocolo(),
                pode ? r.getFinalidade() : "Reservado");
    }

    private List<Intervalo> intervalosLotados(Recurso recurso, List<Reserva> ativas, LocalDateTime inicioDia,
                                              LocalDateTime fimDia) {
        TreeSet<LocalDateTime> pontos = new TreeSet<>();
        for (Reserva r : ativas) {
            pontos.add(maior(r.getDataInicio(), inicioDia));
            pontos.add(menor(r.getDataFim(), fimDia));
        }
        List<LocalDateTime> lista = new ArrayList<>(pontos);
        List<Intervalo> lotados = new ArrayList<>();
        LocalDateTime comeco = null;
        LocalDateTime fim = null;
        for (int i = 0; i + 1 < lista.size(); i++) {
            LocalDateTime a = lista.get(i);
            LocalDateTime b = lista.get(i + 1);
            long simultaneas = ativas.stream()
                    .filter(r -> r.getDataInicio().isBefore(b) && r.getDataFim().isAfter(a)).count();
            if (simultaneas >= recurso.getCapacidade()) {
                if (comeco == null) {
                    comeco = a;
                }
                fim = b;
            } else if (comeco != null) {
                lotados.add(new Intervalo(hora(comeco, fimDia), hora(fim, fimDia), null, "Lotação esgotada"));
                comeco = null;
            }
        }
        if (comeco != null) {
            lotados.add(new Intervalo(hora(comeco, fimDia), hora(fim, fimDia), null, "Lotação esgotada"));
        }
        return lotados;
    }

    private Recurso buscar(UUID id, boolean equipamento) {
        return recursos.findByIdAndAtivoTrue(id)
                .filter(r -> r.isEquipamento() == equipamento)
                .orElseThrow(() -> ApiException.naoEncontrada(
                        equipamento ? "Equipamento não encontrado." : "Ambiente não encontrado."));
    }

    /** Aceita os nomes do contrato (SALA) e os que o front usa (sala_reuniao, sala_estudo...). */
    private TipoRecurso interpretarTipo(String tipo) {
        if (!temTexto(tipo) || tipo.equalsIgnoreCase("todos")) {
            return null;
        }
        String normalizado = tipo.trim().toUpperCase(Locale.ROOT);
        if (normalizado.startsWith("SALA")) {
            return TipoRecurso.SALA;
        }
        try {
            return TipoRecurso.valueOf(normalizado);
        } catch (IllegalArgumentException e) {
            throw ApiException.campoInvalido("tipo", "Tipo de ambiente desconhecido: " + tipo);
        }
    }

    private static boolean temTexto(String s) {
        return s != null && !s.isBlank();
    }

    private static boolean contem(String termo, String... campos) {
        for (String campo : campos) {
            if (campo != null && campo.toLowerCase(Locale.ROOT).contains(termo)) {
                return true;
            }
        }
        return false;
    }

    private static LocalDateTime maior(LocalDateTime a, LocalDateTime b) {
        return a.isAfter(b) ? a : b;
    }

    private static LocalDateTime menor(LocalDateTime a, LocalDateTime b) {
        return a.isBefore(b) ? a : b;
    }

    private static LocalTime hora(LocalDateTime momento, LocalDateTime fimDia) {
        return momento.equals(fimDia) ? FIM_DO_DIA : momento.toLocalTime();
    }
}
