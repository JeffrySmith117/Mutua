package br.icev.mutua.emprestimo;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import br.icev.mutua.common.ApiException;
import br.icev.mutua.common.Relogio;
import br.icev.mutua.emprestimo.EmprestimoDtos.DevolucaoRequest;
import br.icev.mutua.emprestimo.EmprestimoDtos.MovimentacaoBalcaoResponse;
import br.icev.mutua.emprestimo.EmprestimoDtos.RetiradaRequest;
import br.icev.mutua.recurso.TipoRecurso;
import br.icev.mutua.reserva.AuditoriaService;
import br.icev.mutua.reserva.Reserva;
import br.icev.mutua.reserva.ReservaRepository;
import br.icev.mutua.reserva.StatusReserva;
import br.icev.mutua.usuario.Usuario;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmprestimoService {

    private static final Set<StatusReserva> EM_ABERTO = Set.of(StatusReserva.CONFIRMADA, StatusReserva.EM_USO);
    private static final int LIMITE_ENCERRADAS = 100;

    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ReservaRepository reservas;
    private final EmprestimoRepository emprestimos;
    private final AuditoriaService auditoria;

    public EmprestimoService(ReservaRepository reservas, EmprestimoRepository emprestimos,
                             AuditoriaService auditoria) {
        this.reservas = reservas;
        this.emprestimos = emprestimos;
        this.auditoria = auditoria;
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoBalcaoResponse> listar() {
        // Pendências do balcão (aguardando retirada e em campo, inclusive em atraso) nunca ficam de fora do corte.
        List<Reserva> lista = new ArrayList<>(reservas.buscarPorTipoEStatus(TipoRecurso.EQUIPAMENTO, EM_ABERTO,
                Pageable.unpaged()));
        lista.addAll(reservas.buscarPorTipoEStatus(TipoRecurso.EQUIPAMENTO, Set.of(StatusReserva.CONCLUIDA),
                PageRequest.of(0, LIMITE_ENCERRADAS)));
        Map<UUID, Emprestimo> porReserva = lista.isEmpty() ? Map.of()
                : emprestimos.findByReservaIdIn(lista.stream().map(Reserva::getId).toList()).stream()
                .collect(Collectors.toMap(e -> e.getReserva().getId(), Function.identity()));
        return lista.stream().map(r -> MovimentacaoBalcaoResponse.de(r, porReserva.get(r.getId()))).toList();
    }

    @Transactional
    public MovimentacaoBalcaoResponse retirar(Usuario admin, UUID reservaId, RetiradaRequest req) {
        Reserva reserva = equipamento(reservaId);
        LocalDateTime agora = Relogio.agora();
        if (agora.isBefore(reserva.getDataInicio())) {
            throw ApiException.conflito("A retirada só é permitida a partir do início do período reservado ("
                    + reserva.getDataInicio().format(FORMATO) + ").");
        }
        if (agora.isAfter(reserva.getDataFim())) {
            throw ApiException.conflito("O período reservado terminou em " + reserva.getDataFim().format(FORMATO)
                    + "; a retirada não pode mais ser registrada.");
        }
        reserva.mudarPara(StatusReserva.EM_USO);

        String condicao = req == null || req.condicao() == null ? "otimo" : req.condicao();
        String observacao = req == null ? null : req.observacao();

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setReserva(reserva);
        emprestimo.setDataRetirada(agora);
        emprestimo.setCondicaoRetirada(condicao);
        emprestimo.setObservacoesRetirada(observacao);
        emprestimo.setAtendenteBalcao(admin.getNome());
        emprestimos.save(emprestimo);

        auditoria.registrar(reserva, "retirada", "Retirada no balcão", admin.getNome(),
                "Equipamento retirado em condição \"" + condicao + "\" mediante Termo de Guarda."
                        + (observacao == null || observacao.isBlank() ? "" : " " + observacao.trim()));
        return MovimentacaoBalcaoResponse.de(reserva, emprestimo);
    }

    @Transactional
    public MovimentacaoBalcaoResponse devolver(Usuario admin, UUID reservaId, DevolucaoRequest req) {
        Reserva reserva = equipamento(reservaId);
        Emprestimo emprestimo = emprestimos.findByReservaId(reservaId)
                .orElseThrow(() -> ApiException.conflito("A retirada deste equipamento ainda não foi registrada."));
        reserva.mudarPara(StatusReserva.CONCLUIDA);

        emprestimo.setDataDevolucaoEfetiva(Relogio.agora());
        emprestimo.setCondicaoDevolucao(req.condicao());
        emprestimo.setObservacoesDevolucao(req.observacao());
        emprestimo.setItensConferidos(req.itensConferidos() == null ? List.of() : req.itensConferidos());
        emprestimo.setAtendenteBalcao(admin.getNome());

        auditoria.registrar(reserva, "devolucao", "Devolução e vistoria", admin.getNome(),
                "Equipamento devolvido em condição \"" + req.condicao() + "\"."
                        + (req.observacao() == null || req.observacao().isBlank() ? "" : " " + req.observacao().trim()));
        return MovimentacaoBalcaoResponse.de(reserva, emprestimo);
    }

    private Reserva equipamento(UUID reservaId) {
        return reservas.findById(reservaId)
                .filter(r -> r.getRecurso().isEquipamento())
                .orElseThrow(() -> ApiException.naoEncontrada("Movimentação de equipamento não encontrada."));
    }
}
