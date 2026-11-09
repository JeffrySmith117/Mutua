package br.icev.mutua.admin;

import br.icev.mutua.admin.AdminDtos.NovoUsuarioRequest;
import br.icev.mutua.auth.AuthDtos.UsuarioResponse;
import br.icev.mutua.usuario.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Criação de contas pelo administrador (regra em SecurityConfig: /admin/**). */
@RestController
@RequestMapping("/admin/usuarios")
public class AdminUsuarioController {

    private final UsuarioService usuarios;

    public AdminUsuarioController(UsuarioService usuarios) {
        this.usuarios = usuarios;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse criar(@Valid @RequestBody NovoUsuarioRequest req) {
        return UsuarioResponse.de(usuarios.criar(req.nome(), req.email(), req.senha(), req.cpf(),
                req.registroCrea(), req.telefone(), req.perfil()));
    }
}
