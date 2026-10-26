package br.icev.mutua.auth;

import java.util.List;

import br.icev.mutua.auth.AuthDtos.CadastroRequest;
import br.icev.mutua.auth.AuthDtos.CadastroResponse;
import br.icev.mutua.auth.AuthDtos.LoginRequest;
import br.icev.mutua.auth.AuthDtos.LoginResponse;
import br.icev.mutua.auth.AuthDtos.UsuarioResponse;
import br.icev.mutua.common.ApiException;
import br.icev.mutua.common.ErroResposta.CampoInvalido;
import br.icev.mutua.common.Relogio;
import br.icev.mutua.usuario.Perfil;
import br.icev.mutua.usuario.Usuario;
import br.icev.mutua.usuario.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder encoder, JwtService jwt) {
        this.usuarios = usuarios;
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

    /** Todo cadastro público nasce PROFISSIONAL; contas ADMIN vêm do seed ou de outro administrador. */
    @Transactional
    public CadastroResponse cadastrar(CadastroRequest req) {
        if (req.confirmarSenha() != null && !req.confirmarSenha().equals(req.senha())) {
            throw ApiException.campoInvalido("confirmarSenha", "A confirmação de senha não confere.");
        }
        String cpf = formatarCpf(req.cpf());
        String email = req.email().trim().toLowerCase();

        if (usuarios.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflito("email", "Já existe um cadastro com este e-mail.");
        }
        if (usuarios.existsByCpf(cpf)) {
            throw ApiException.conflito("cpf", "Já existe um cadastro com este CPF.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(req.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(encoder.encode(req.senha()));
        usuario.setCpf(cpf);
        usuario.setRegistroCrea(req.registroCrea());
        usuario.setTelefone(req.telefone());
        usuario.setPerfil(Perfil.PROFISSIONAL);
        usuario.setCriadoEm(Relogio.agora());
        usuarios.save(usuario);

        return new CadastroResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.getRegistroCrea(), usuario.getPerfil(), "Cadastro realizado com sucesso.",
                jwt.gerar(usuario), UsuarioResponse.de(usuario));
    }

    /** Normaliza para 000.000.000-00. Valida só o formato (11 dígitos), não os dígitos verificadores. */
    static String formatarCpf(String bruto) {
        String digitos = bruto == null ? "" : bruto.replaceAll("\\D", "");
        if (digitos.length() != 11) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CPF inválido.",
                    List.of(new CampoInvalido("cpf", "O CPF deve ter 11 dígitos.")));
        }
        return digitos.substring(0, 3) + "." + digitos.substring(3, 6) + "." + digitos.substring(6, 9)
                + "-" + digitos.substring(9);
    }
}
