package br.icev.mutua.auth;

import br.icev.mutua.auth.AuthDtos.CadastroRequest;
import br.icev.mutua.auth.AuthDtos.CadastroResponse;
import br.icev.mutua.auth.AuthDtos.LoginRequest;
import br.icev.mutua.auth.AuthDtos.LoginResponse;
import br.icev.mutua.auth.AuthDtos.UsuarioResponse;
import br.icev.mutua.common.ApiException;
import br.icev.mutua.usuario.Perfil;
import br.icev.mutua.usuario.Usuario;
import br.icev.mutua.usuario.UsuarioRepository;
import br.icev.mutua.usuario.UsuarioService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final UsuarioService usuarioService;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UsuarioRepository usuarios, UsuarioService usuarioService, PasswordEncoder encoder,
                       JwtService jwt) {
        this.usuarios = usuarios;
        this.usuarioService = usuarioService;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        Usuario usuario = usuarios.findByEmailIgnoreCase(req.email().trim())
                .filter(Usuario::isAtivo)
                .filter(u -> encoder.matches(req.senha(), u.getSenhaHash()))
                .orElseThrow(() -> ApiException.naoAutorizada("E-mail ou senha inválidos."));
        return new LoginResponse(jwt.gerar(usuario), UsuarioResponse.de(usuario));
    }

    /** Todo cadastro público nasce PROFISSIONAL; contas ADMIN são criadas por outro administrador. */
    @Transactional
    public CadastroResponse cadastrar(CadastroRequest req) {
        if (req.confirmarSenha() != null && !req.confirmarSenha().equals(req.senha())) {
            throw ApiException.campoInvalido("confirmarSenha", "A confirmação de senha não confere.");
        }
        Usuario usuario = usuarioService.criar(req.nome(), req.email(), req.senha(), req.cpf(),
                req.registroCrea(), req.telefone(), Perfil.PROFISSIONAL);

        return new CadastroResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.getRegistroCrea(), usuario.getPerfil(), "Cadastro realizado com sucesso.",
                jwt.gerar(usuario), UsuarioResponse.de(usuario));
    }
}
