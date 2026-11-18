package br.icev.mutua.usuario;

import java.util.List;
import java.util.UUID;

import br.icev.mutua.common.ApiException;
import br.icev.mutua.common.ErroResposta.CampoInvalido;
import br.icev.mutua.common.Relogio;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository usuarios, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.encoder = encoder;
    }

    @Transactional
    public Usuario criar(String nome, String email, String senha, String cpf, String registroCrea,
                         String telefone, Perfil perfil) {
        String cpfFormatado = formatarCpf(cpf);
        String emailNormalizado = email.trim().toLowerCase();

        if (usuarios.existsByEmailIgnoreCase(emailNormalizado)) {
            throw ApiException.conflito("email", "Já existe um cadastro com este e-mail.");
        }
        if (usuarios.existsByCpf(cpfFormatado)) {
            throw ApiException.conflito("cpf", "Já existe um cadastro com este CPF.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome.trim());
        usuario.setEmail(emailNormalizado);
        usuario.setSenhaHash(encoder.encode(senha));
        usuario.setCpf(cpfFormatado);
        usuario.setRegistroCrea(registroCrea);
        usuario.setTelefone(telefone);
        usuario.setPerfil(perfil);
        usuario.setCriadoEm(Relogio.agora());
        return usuarios.save(usuario);
    }

    /**
     * Troca a senha do próprio usuário. A senha atual errada é 400 (e não 401) de propósito: o front trata
     * qualquer 401 como sessão expirada e desloga. Ao trocar a senha, os tokens já emitidos deixam de valer
     * (o usuário entra de novo com a senha nova).
     */
    @Transactional
    public void alterarSenha(UUID usuarioId, String senhaAtual, String novaSenha) {
        Usuario usuario = usuarios.findById(usuarioId)
                .orElseThrow(() -> ApiException.naoEncontrada("Usuário não encontrado."));
        if (!encoder.matches(senhaAtual, usuario.getSenhaHash())) {
            throw ApiException.campoInvalido("senhaAtual", "A senha atual está incorreta.");
        }
        if (senhaAtual.equals(novaSenha)) {
            throw ApiException.campoInvalido("novaSenha", "A nova senha deve ser diferente da atual.");
        }
        usuario.setSenhaHash(encoder.encode(novaSenha));
        usuario.encerrarSessoes(); // tokens emitidos com a senha antiga deixam de valer
    }

    /** Encerra as sessões do usuário: os tokens emitidos até agora, em qualquer dispositivo, deixam de valer. */
    @Transactional
    public void encerrarSessoes(UUID usuarioId) {
        usuarios.findById(usuarioId).ifPresent(Usuario::encerrarSessoes);
    }

    /** Normaliza para 000.000.000-00, validando o tamanho e os dígitos verificadores. */
    public static String formatarCpf(String bruto) {
        String digitos = bruto == null ? "" : bruto.replaceAll("\\D", "");
        if (digitos.length() != 11) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CPF inválido.",
                    List.of(new CampoInvalido("cpf", "O CPF deve ter 11 dígitos.")));
        }
        if (!cpfValido(digitos)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CPF inválido.",
                    List.of(new CampoInvalido("cpf", "CPF inválido: confira os números digitados.")));
        }
        return digitos.substring(0, 3) + "." + digitos.substring(3, 6) + "." + digitos.substring(6, 9)
                + "-" + digitos.substring(9);
    }

    /** Confere os dois dígitos verificadores; sequências de um único dígito (111.111.111-11) são inválidas. */
    static boolean cpfValido(String digitos) {
        if (digitos.chars().distinct().count() == 1) {
            return false;
        }
        return digitoVerificador(digitos, 9) == digitos.charAt(9) - '0'
                && digitoVerificador(digitos, 10) == digitos.charAt(10) - '0';
    }

    private static int digitoVerificador(String digitos, int quantidade) {
        int soma = 0;
        for (int i = 0; i < quantidade; i++) {
            soma += (digitos.charAt(i) - '0') * (quantidade + 1 - i);
        }
        int resto = (soma * 10) % 11;
        return resto == 10 ? 0 : resto;
    }
}
