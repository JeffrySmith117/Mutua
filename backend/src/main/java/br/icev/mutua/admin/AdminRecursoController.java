package br.icev.mutua.admin;

import java.util.List;
import java.util.UUID;

import br.icev.mutua.recurso.RecursoAdminDtos.AtivoRequest;
import br.icev.mutua.recurso.RecursoAdminDtos.RecursoAdminResponse;
import br.icev.mutua.recurso.RecursoAdminDtos.RecursoRequest;
import br.icev.mutua.recurso.RecursoAdminService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Cadastro de ambientes e equipamentos (perfil ADMIN, regra em SecurityConfig: /admin/**). */
@RestController
@RequestMapping("/admin/recursos")
public class AdminRecursoController {

    private final RecursoAdminService recursos;

    public AdminRecursoController(RecursoAdminService recursos) {
        this.recursos = recursos;
    }

    @GetMapping
    public List<RecursoAdminResponse> listar() {
        return recursos.listar();
    }

    @GetMapping("/{id}")
    public RecursoAdminResponse buscar(@PathVariable UUID id) {
        return recursos.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecursoAdminResponse criar(@Valid @RequestBody RecursoRequest req) {
        return recursos.criar(req);
    }

    @PutMapping("/{id}")
    public RecursoAdminResponse atualizar(@PathVariable UUID id, @Valid @RequestBody RecursoRequest req) {
        return recursos.atualizar(id, req);
    }

    @PatchMapping("/{id}/ativo")
    public RecursoAdminResponse definirAtivo(@PathVariable UUID id, @Valid @RequestBody AtivoRequest req) {
        return recursos.definirAtivo(id, req.ativo());
    }
}
