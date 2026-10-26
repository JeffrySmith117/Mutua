package br.icev.mutua.auth;

import br.icev.mutua.auth.AuthDtos.CadastroRequest;
import br.icev.mutua.auth.AuthDtos.CadastroResponse;
import br.icev.mutua.auth.AuthDtos.LoginRequest;
import br.icev.mutua.auth.AuthDtos.LoginResponse;
import br.icev.mutua.auth.AuthDtos.UsuarioResponse;
import br.icev.mutua.usuario.Usuario;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Os segundos caminhos de cada rota (/entrar, /cadastrar, /perfil, /sair) são os usados pelo front hoje. */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping({"/login", "/entrar"})
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @PostMapping({"/cadastro", "/cadastrar"})
    @ResponseStatus(HttpStatus.CREATED)
    public CadastroResponse cadastro(@Valid @RequestBody CadastroRequest req) {
        return auth.cadastrar(req);
    }

    @GetMapping({"/me", "/perfil"})
    public UsuarioResponse me(@AuthenticationPrincipal Usuario usuario) {
        return UsuarioResponse.de(usuario);
    }

    /** O JWT é stateless: o logout acontece no cliente descartando o token. */
    @PostMapping("/sair")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sair() {
    }
}
