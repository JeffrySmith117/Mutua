package br.icev.mutua.reserva;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.icev.mutua.common.ApiException;
import br.icev.mutua.common.Relogio;
import br.icev.mutua.recurso.Horarios;
import br.icev.mutua.recurso.Recurso;
import br.icev.mutua.recurso.RecursoRepository;
import br.icev.mutua.reserva.ReservaDtos.CriarReservaRequest;
import br.icev.mutua.reserva.ReservaDtos.Periodo;
import br.icev.mutua.reserva.ReservaDtos.ReservaCriadaResponse;
import br.icev.mutua.reserva.ReservaDtos.ReservaResumo;
import br.icev.mutua.usuario.Usuario;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservaService {

    private static final Logger log = LoggerFactory.getLogger(ReservaService.class);

    private final ReservaRepository reservas;
    private final RecursoRepository recursos;
    private final AuditoriaService auditoria;
    private final ReservaProperties props;

    public ReservaService(ReservaRepository reservas, RecursoRepository recursos, AuditoriaService auditoria,
                          ReservaProperties props) {
        this.reservas = reservas;
        this.recursos = recursos;
        this.auditoria = auditoria;
        this.props = props;
    }

    /**
     * Cria a reserva. A linha do recurso é travada durante a transação, então pedidos simultâneos para o
     * mesmo recurso são serializados; a exclusion constraint do banco continua como rede de segurança.
     */
    @Transactional
    public ReservaCriadaResponse criar(Usuario usuario, CriarReservaRequest req) {
        Recurso recurso = recursos.buscarParaReserva(req.recursoId())
                .filter(Recurso::isAtivo)
                .orElseThrow(() -> ApiException.naoEncontrada("Recurso não encontrado ou inativo."));
        Periodo periodo = req.periodo();
        if (periodo == null) {
            throw ApiException.campoInvalido("dataInicio", "Informe o período da reserva (dataInicio e dataFim).");
        }
        LocalDateTime agora = Relogio.agora();
        validarJanela(recurso, periodo, agora);
        validarRequisitosDoEquipamento(recurso, req);
        verificarConflito(recurso, periodo);

        Reserva reserva = new Reserva();
        reserva.setProtocolo(gerarProtocolo(recurso));
        reserva.setUsuario(usuario);
        reserva.setRecurso(recurso);
        reserva.setDataInicio(periodo.inicio());
        reserva.setDataFim(periodo.fim());
        reserva.setFinalidade(req.finalidade().trim());
        reserva.setDocumentoVinculado(req.documento());
        reserva.setExclusivo(recurso.isExclusivo());
        reserva.setCriadoEm(agora);
        if (!recurso.isExigeAprovacao()) {
            reserva.mudarPara(StatusReserva.CONFIRMADA);
        }
        reservas.saveAndFlush(reserva);

        auditoria.registrar(reserva, "solicitacao", "Solicitação registrada", usuario.getNome(),
                "Solicitação de " + recurso.getNome() + " registrada sob o protocolo " + reserva.getProtocolo() + ".");
        String mensagem;
        if (reserva.getStatus() == StatusReserva.CONFIRMADA) {
            auditoria.registrar(reserva, "aprovacao", "Reserva confirmada", AuditoriaService.SISTEMA,
                    "Recurso de livre ocupação: confirmação automática.");
            mensagem = "Reserva confirmada com sucesso!";
        } else {
            mensagem = "Solicitação registrada com sucesso! Aguardando despacho da gestão.";
        }
        return ReservaCriadaResponse.de(reserva, mensagem);
    }

    @Transactional(readOnly = true)
    public List<ReservaResumo> minhas(Usuario usuario) {
        LocalDateTime agora = Relogio.agora();
        return reservas.findByUsuarioIdOrderByDataInicioDesc(usuario.getId()).stream()
                .map(r -> ReservaResumo.de(r, podeCancelar(r, agora), podeCheckin(r, agora)))
                .toList();
    }

    @Transactional
    public ReservaResumo cancelar(Usuario usuario, UUID id, String motivo) {
        Reserva reserva = buscar(id);
        verificarDono(usuario, reserva);
        LocalDateTime agora = Relogio.agora();
        if (reserva.getStatus() == StatusReserva.CONFIRMADA && !podeCancelar(reserva, agora)) {
            throw ApiException.conflito("O cancelamento exige antecedência mínima de "
                    + props.antecedenciaMinimaCancelamentoHoras() + " hora(s) do início.");
        }
        String texto = motivo == null || motivo.isBlank() ? "Cancelada pelo solicitante." : motivo.trim();
        reserva.mudarPara(StatusReserva.CANCELADA);
        reserva.setMotivoRecusaCancelamento(texto);
        auditoria.registrar(reserva, "cancelamento", "Reserva cancelada", usuario.getNome(), texto);
        return ReservaResumo.de(reserva, false, false);
    }

    /** Check-in presencial de ambientes. Equipamentos são retirados no balcão (EmprestimoService). */
    @Transactional
    public ReservaResumo checkin(Usuario usuario, UUID id) {
        Reserva reserva = buscar(id);
        verificarDono(usuario, reserva);
        if (reserva.getRecurso().isEquipamento()) {
            throw ApiException.conflito("Equipamentos são retirados no balcão do Crea Tec HUB, não por check-in.");
        }
        LocalDateTime agora = Relogio.agora();
        if (!reserva.getDataInicio().toLocalDate().equals(agora.toLocalDate())) {
            throw ApiException.conflito("O check-in só é permitido no dia do agendamento.");
        }
        if (!agora.isBefore(reserva.getDataFim())) {
            throw ApiException.conflito("O horário desta reserva já foi encerrado.");
        }
        reserva.mudarPara(StatusReserva.EM_USO);
        auditoria.registrar(reserva, "checkin", "Check-in realizado", usuario.getNome(),
                "Check-in presencial em " + reserva.getRecurso().getNome() + ".");
        return ReservaResumo.de(reserva, false, false);
    }

    @Transactional
    public Reserva aprovar(Usuario admin, UUID id, String observacao) {
        Reserva reserva = buscar(id);
        if (reserva.getDataInicio().isBefore(Relogio.agora())) {
            throw ApiException.conflito("A solicitação já passou do horário de início e não pode mais ser aprovada.");
        }
        reserva.mudarPara(StatusReserva.CONFIRMADA);
        auditoria.registrar(reserva, "aprovacao", "Solicitação aprovada", admin.getNome(),
                observacao == null || observacao.isBlank() ? "Despacho favorável da gestão." : observacao.trim());
        return reserva;
    }

    @Transactional
    public Reserva recusar(Usuario admin, UUID id, String motivo) {
        Reserva reserva = buscar(id);
        reserva.mudarPara(StatusReserva.RECUSADA);
        reserva.setMotivoRecusaCancelamento(motivo.trim());
        auditoria.registrar(reserva, "recusa", "Solicitação recusada", admin.getNome(), motivo.trim());
        return reserva;
    }

    /**
     * Rotina periódica: expira pendências sem despacho, marca não comparecimentos e conclui o uso de
     * ambientes cujo horário acabou.
     */
    @Transactional
    public int processarVencimentos() {
        LocalDateTime agora = Relogio.agora();
        int alteradas = 0;

        for (Reserva r : reservas.findByStatusAndDataInicioBefore(StatusReserva.PENDENTE, agora)) {
            r.mudarPara(StatusReserva.CANCELADA);
            r.setMotivoRecusaCancelamento("Solicitação expirada sem despacho da gestão.");
            auditoria.registrar(r, "cancelamento", "Solicitação expirada", AuditoriaService.SISTEMA,
                    r.getMotivoRecusaCancelamento());
            alteradas++;
        }

        LocalDateTime limiteCheckin = agora.minusMinutes(props.toleranciaCheckinMinutos());
        for (Reserva r : reservas.findByStatusAndDataInicioBefore(StatusReserva.CONFIRMADA, limiteCheckin)) {
            if (!r.getRecurso().isEquipamento()) {
                naoCompareceu(r, "Sem check-in dentro da tolerância de " + props.toleranciaCheckinMinutos()
                        + " minutos.");
                alteradas++;
            }
        }
        for (Reserva r : reservas.findByStatusAndDataFimBefore(StatusReserva.CONFIRMADA, agora)) {
            if (r.getRecurso().isEquipamento()) {
                naoCompareceu(r, "Equipamento não retirado dentro do período reservado.");
                alteradas++;
            }
        }

        for (Reserva r : reservas.findByStatusAndDataFimBefore(StatusReserva.EM_USO, agora)) {
            if (!r.getRecurso().isEquipamento()) {
                r.mudarPara(StatusReserva.CONCLUIDA);
                auditoria.registrar(r, "devolucao", "Uso concluído", AuditoriaService.SISTEMA,
                        "Horário da reserva encerrado.");
                alteradas++;
            }
        }
        if (alteradas > 0) {
            log.info("Vencimentos processados: {} reserva(s) atualizada(s).", alteradas);
        }
        return alteradas;
    }

    public Reserva buscar(UUID id) {
        return reservas.findById(id).orElseThrow(() -> ApiException.naoEncontrada("Reserva não encontrada."));
    }

    public boolean podeCancelar(Reserva r, LocalDateTime agora) {
        return switch (r.getStatus()) {
            case PENDENTE -> true;
            case CONFIRMADA -> !agora.isAfter(r.getDataInicio().minusHours(props.antecedenciaMinimaCancelamentoHoras()));
            default -> false;
        };
    }

    public boolean podeCheckin(Reserva r, LocalDateTime agora) {
        return r.getStatus() == StatusReserva.CONFIRMADA
                && !r.getRecurso().isEquipamento()
                && r.getDataInicio().toLocalDate().equals(agora.toLocalDate())
                && agora.isBefore(r.getDataFim());
    }

    private void naoCompareceu(Reserva r, String descricao) {
        r.mudarPara(StatusReserva.NAO_COMPARECEU);
        auditoria.registrar(r, "nao_comparecimento", "Não comparecimento", AuditoriaService.SISTEMA, descricao);
    }

    private void verificarDono(Usuario usuario, Reserva reserva) {
        if (!usuario.isAdmin() && !reserva.getUsuario().getId().equals(usuario.getId())) {
            throw ApiException.proibida("Você só pode operar as suas próprias reservas.");
        }
    }

    private void validarJanela(Recurso recurso, Periodo p, LocalDateTime agora) {
        if (!p.fim().isAfter(p.inicio())) {
            throw ApiException.campoInvalido("dataFim", "A data final deve ser posterior à inicial.");
        }
        if (p.inicio().isBefore(agora.minusMinutes(1))) {
            throw ApiException.campoInvalido("dataInicio", "Não é possível reservar um horário no passado.");
        }
        if (recurso.isEquipamento()) {
            if (Duration.between(p.inicio(), p.fim()).compareTo(Duration.ofDays(recurso.getPrazoMaxDias())) > 0) {
                throw ApiException.campoInvalido("dataFim", "O prazo máximo de empréstimo deste equipamento é de "
                        + recurso.getPrazoMaxDias() + " dia(s).");
            }
            // Retirada e devolução acontecem no balcão, dentro do horário de atendimento.
            if (foraDoExpediente(recurso, p.inicio()) || foraDoExpediente(recurso, p.fim())) {
                throw ApiException.campoInvalido("dataInicio", "Retirada e devolução devem ocorrer no horário do "
                        + "balcão (" + Horarios.descrever(recurso) + ").");
            }
            return;
        }
        if (!p.inicio().toLocalDate().equals(p.fim().toLocalDate())) {
            throw ApiException.campoInvalido("dataFim", "A reserva de ambiente deve começar e terminar no mesmo dia.");
        }
        if (!recurso.getDiasSemana().contains(p.inicio().getDayOfWeek().getValue())) {
            throw ApiException.campoInvalido("dataInicio", "O ambiente não funciona neste dia da semana ("
                    + Horarios.descrever(recurso) + ").");
        }
        if (p.inicio().toLocalTime().isBefore(recurso.getHorarioAbertura())
                || p.fim().toLocalTime().isAfter(recurso.getHorarioFechamento())) {
            throw ApiException.campoInvalido("dataInicio", "Horário fora do funcionamento do ambiente ("
                    + Horarios.descrever(recurso) + ").");
        }
    }

    private boolean foraDoExpediente(Recurso recurso, LocalDateTime momento) {
        return momento.toLocalTime().isBefore(recurso.getHorarioAbertura())
                || momento.toLocalTime().isAfter(recurso.getHorarioFechamento());
    }

    private void validarRequisitosDoEquipamento(Recurso recurso, CriarReservaRequest req) {
        if (!recurso.isEquipamento()) {
            return;
        }
        if (!Boolean.TRUE.equals(req.termoAceito())) {
            throw ApiException.campoInvalido("termoAceito", "É necessário aceitar o Termo de Guarda e Responsabilidade.");
        }
        if (recurso.isExigeArtSisant() && req.documento() == null) {
            throw ApiException.campoInvalido("documentoVinculado",
                    "Este equipamento exige a ART (e o cadastro SISANT, quando aplicável).");
        }
    }

    private void verificarConflito(Recurso recurso, Periodo p) {
        List<Reserva> ativas = reservas.buscarAtivasNoPeriodo(recurso.getId(), StatusReserva.ATIVAS,
                p.inicio(), p.fim());
        if (recurso.isExclusivo()) {
            if (!ativas.isEmpty()) {
                throw ApiException.conflito("dataInicio", String.format(
                        "O recurso '%s' já possui uma reserva ativa para o horário selecionado (Protocolo %s).",
                        recurso.getNome(), ativas.get(0).getProtocolo()));
            }
        } else if (maximoSimultaneas(ativas, p) >= recurso.getCapacidade()) {
            throw ApiException.conflito("dataInicio", String.format(
                    "O recurso '%s' está com a lotação esgotada no horário selecionado.", recurso.getNome()));
        }
    }

    /** Maior número de reservas ao mesmo tempo dentro do período pedido. */
    private int maximoSimultaneas(List<Reserva> ativas, Periodo p) {
        List<LocalDateTime> pontos = new ArrayList<>();
        pontos.add(p.inicio());
        for (Reserva r : ativas) {
            if (r.getDataInicio().isAfter(p.inicio()) && r.getDataInicio().isBefore(p.fim())) {
                pontos.add(r.getDataInicio());
            }
        }
        int maximo = 0;
        for (LocalDateTime ponto : pontos) {
            int simultaneas = (int) ativas.stream()
                    .filter(r -> !r.getDataInicio().isAfter(ponto) && r.getDataFim().isAfter(ponto))
                    .count();
            maximo = Math.max(maximo, simultaneas);
        }
        return maximo;
    }

    private String gerarProtocolo(Recurso recurso) {
        return String.format("%s-%d-%04d", recurso.isEquipamento() ? "HUB" : "MUT",
                Year.now(Relogio.FUSO).getValue(), reservas.proximoNumeroProtocolo());
    }
}
