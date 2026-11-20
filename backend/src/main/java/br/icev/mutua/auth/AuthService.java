package br.icev.mutua.auth;

import java.time.Clock;
import java.time.Duration;
import java.util.Optional;

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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final UsuarioService usuarioService;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LimitadorDeTentativas falhasPorConta;
    private final LimitadorDeTentativas falhasPorIp;
    /** Hash usado quando a conta não existe, para o login levar o mesmo tempo nos dois casos. */
    private final String hashFicticio;

    public AuthService(UsuarioRepository usuarios, UsuarioService usuarioService, PasswordEncoder encoder,
                       JwtService jwt,
                       @Value("${mutua.login.max-tentativas-conta}") int maxPorConta,
                       @Value("${mutua.login.max-tentativas-ip}") int maxPorIp,
                       @Value("${mutua.login.janela-minutos}") long janelaMinutos) {
        this.usuarios = usuarios;
        this.usuarioService = usuarioService;
        this.encoder = encoder;
        this.jwt = jwt;
        this.hashFicticio = encoder.encode("senha-ficticia-" + java.util.UUID.randomUUID());
        Duration janela = Duration.ofMinutes(janelaMinutos);
        this.falhasPorConta = new LimitadorDeTentativas(maxPorConta, janela, Clock.systemUTC());
        this.falhasPorIp = new LimitadorDeTentativas(maxPorIp, janela, Clock.systemUTC());
    }

    /**
     * Só as falhas contam para o bloqueio. O limite por e-mail+IP segura tentativas de adivinhar a senha de uma
     * conta sem deixar um atacante trancar a conta alheia de outros IPs; o limite por IP segura quem testa
     * muitos e-mails.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req, String ip) {
        String email = req.email().trim().toLowerCase();
        String chaveConta = ip + "|" + email;
        if (falhasPorIp.bloqueada(ip) || falhasPorConta.bloqueada(chaveConta)) {
            throw ApiException.muitasTentativas("Muitas tentativas de login. Aguarde alguns minutos e tente de novo.");
        }

        // O BCrypt roda sempre, exista a conta ou não: sem isso o tempo de resposta revelaria quem é cadastrado.
        Optional<Usuario> conta = usuarios.findByEmailIgnoreCase(email).filter(Usuario::isAtivo);
        boolean senhaConfere = encoder.matches(req.senha(), conta.map(Usuario::getSenhaHash).orElse(hashFicticio));
        Optional<Usuario> usuario = conta.filter(u -> senhaConfere);
        if (usuario.isEmpty()) {
            falhasPorIp.registrarFalha(ip);
            falhasPorConta.registrarFalha(chaveConta);
            throw ApiException.naoAutorizada("E-mail ou senha inválidos.");
        }
        falhasPorConta.limpar(chaveConta);
        return new LoginResponse(jwt.gerar(usuario.get()), UsuarioResponse.de(usuario.get()));
    }

    /** Todo cadastro público nasce PROFISSIONAL; contas ADMIN são criadas por outro administrador. */
    @Transactional
    public CadastroResponse cadastrar(CadastroRequest req) {
        if (req.confirmarSenha() != null && !req.confirmarSenha().equals(req.senha())) {
            throw ApiException.campoInvalido("confirmarSenha", "A confirmação de senha não confere.");
        }
        Usuario usuario;
        try {
            usuario = usuarioService.criar(req.nome(), req.email(), req.senha(), req.cpf(),
                    req.registroCrea(), req.telefone(), Perfil.PROFISSIONAL);
        } catch (ApiException e) {
            if (e.getStatus() != HttpStatus.CONFLICT) {
                throw e;
            }
            // Rota pública: não diz se foi o e-mail ou o CPF que já existe (LGPD: revelaria quem é cadastrado).
            throw ApiException.conflito("Não foi possível concluir o cadastro com os dados informados. "
                    + "Se você já tem uma conta, entre com seu e-mail e senha.");
        }

        return new CadastroResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.getRegistroCrea(), usuario.getPerfil(), "Cadastro realizado com sucesso.",
                jwt.gerar(usuario), UsuarioResponse.de(usuario));
    }
}
