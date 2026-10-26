package br.icev.mutua.recurso;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import br.icev.mutua.recurso.RecursoDtos.DisponibilidadeResponse;
import br.icev.mutua.recurso.RecursoDtos.EquipamentoResponse;
import br.icev.mutua.usuario.Usuario;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/equipamentos")
public class EquipamentoController {

    private final RecursoService recursos;

    public EquipamentoController(RecursoService recursos) {
        this.recursos = recursos;
    }

    @GetMapping
    public List<EquipamentoResponse> listar(@RequestParam(required = false) String categoria,
                                            @RequestParam(required = false) String status,
                                            @RequestParam(required = false) String termoBusca) {
        return recursos.listarEquipamentos(categoria, status, termoBusca);
    }

    @GetMapping("/{id}")
    public EquipamentoResponse buscar(@PathVariable UUID id) {
        return recursos.equipamento(id);
    }

    @GetMapping("/{id}/disponibilidade")
    public DisponibilidadeResponse disponibilidade(@PathVariable UUID id,
                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
                                                   @AuthenticationPrincipal Usuario usuario) {
        return recursos.disponibilidade(id, data, usuario);
    }
}
