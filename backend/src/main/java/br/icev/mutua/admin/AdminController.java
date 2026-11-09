package br.icev.mutua.admin;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import br.icev.mutua.admin.AdminDtos.AprovarRequest;
import br.icev.mutua.admin.AdminDtos.RecusarRequest;
import br.icev.mutua.emprestimo.EmprestimoDtos.DevolucaoRequest;
import br.icev.mutua.emprestimo.EmprestimoDtos.MovimentacaoBalcaoResponse;
import br.icev.mutua.emprestimo.EmprestimoDtos.RetiradaRequest;
import br.icev.mutua.emprestimo.EmprestimoService;
import br.icev.mutua.relatorio.RelatorioDtos.MetricasAdmin;
import br.icev.mutua.relatorio.RelatorioDtos.RegistroHistoricoResponse;
import br.icev.mutua.relatorio.RelatorioDtos.SolicitacaoPendenteResponse;
import br.icev.mutua.relatorio.RelatorioService;
import br.icev.mutua.reserva.ReservaService;
import br.icev.mutua.usuario.Usuario;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Rotas restritas ao perfil ADMIN (a regra está em SecurityConfig: /admin/**). */
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ReservaService reservas;
    private final EmprestimoService emprestimos;
    private final RelatorioService relatorios;

    public AdminController(ReservaService reservas, EmprestimoService emprestimos, RelatorioService relatorios) {
        this.reservas = reservas;
        this.emprestimos = emprestimos;
        this.relatorios = relatorios;
    }

    @GetMapping("/metricas")
    public MetricasAdmin metricas() {
        return relatorios.metricas();
    }

    @GetMapping("/pendencias")
    public List<SolicitacaoPendenteResponse> pendencias() {
        return relatorios.pendencias();
    }

    @PostMapping("/pendencias/{id}/aprovar")
    public SolicitacaoPendenteResponse aprovar(@AuthenticationPrincipal Usuario admin, @PathVariable UUID id,
                                               @RequestBody(required = false) AprovarRequest req) {
        return SolicitacaoPendenteResponse.de(
                reservas.aprovar(admin, id, req == null ? null : req.observacao()));
    }

    @PostMapping("/pendencias/{id}/recusar")
    public SolicitacaoPendenteResponse recusar(@AuthenticationPrincipal Usuario admin, @PathVariable UUID id,
                                               @Valid @RequestBody RecusarRequest req) {
        return SolicitacaoPendenteResponse.de(reservas.recusar(admin, id, req.motivo()));
    }

    @GetMapping("/movimentacoes")
    public List<MovimentacaoBalcaoResponse> movimentacoes() {
        return emprestimos.listar();
    }

    @PostMapping("/movimentacoes/{id}/retirar")
    public MovimentacaoBalcaoResponse retirar(@AuthenticationPrincipal Usuario admin, @PathVariable UUID id,
                                              @Valid @RequestBody(required = false) RetiradaRequest req) {
        return emprestimos.retirar(admin, id, req);
    }

    @PostMapping("/movimentacoes/{id}/devolver")
    public MovimentacaoBalcaoResponse devolver(@AuthenticationPrincipal Usuario admin, @PathVariable UUID id,
                                               @Valid @RequestBody DevolucaoRequest req) {
        return emprestimos.devolver(admin, id, req);
    }

    @GetMapping("/historico")
    public List<RegistroHistoricoResponse> historico(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return relatorios.historico(busca, tipo, status, dataInicio, dataFim);
    }

    @GetMapping("/historico/{id}")
    public RegistroHistoricoResponse historicoPorId(@PathVariable UUID id) {
        return relatorios.historicoPorId(id);
    }
}
