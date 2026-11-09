package br.icev.mutua.auth;

import java.time.LocalDateTime;
import java.util.UUID;

import br.icev.mutua.usuario.Perfil;
import br.icev.mutua.usuario.Usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank(message = "Informe o e-mail.") @Email(message = "E-mail inválido.") String email,
            @NotBlank(message = "Informe a senha.") String senha) {
    }

    public record CadastroRequest(
            @NotBlank(message = "Informe o nome.") @Size(max = 150) String nome,
            @NotBlank(message = "Informe o e-mail.") @Email(message = "E-mail inválido.") @Size(max = 150) String email,
            @NotBlank(message = "Informe a senha.") @Size(min = 8, max = 72, message = "A senha deve ter de 8 a 72 caracteres.") String senha,
            /** O front envia a confirmação; quando presente, precisa ser igual à senha. */
            String confirmarSenha,
            @NotBlank(message = "Informe o CPF.") String cpf,
            @Size(max = 30) String registroCrea,
            @Size(max = 20) String telefone) {
    }

    public record AlterarSenhaRequest(
            @NotBlank(message = "Informe a senha atual.") String senhaAtual,
            @NotBlank(message = "Informe a nova senha.")
            @Size(min = 8, max = 72, message = "A senha deve ter de 8 a 72 caracteres.") String novaSenha) {
    }

    public record UsuarioResponse(UUID id, String nome, String email, String registroCrea, String cpf,
                                  Perfil perfil, boolean ativo, LocalDateTime criadoEm) {
        public static UsuarioResponse de(Usuario u) {
            return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getRegistroCrea(), u.getCpf(),
                    u.getPerfil(), u.isAtivo(), u.getCriadoEm());
        }
    }

    public record LoginResponse(String token, UsuarioResponse usuario) {
    }

    /**
     * Contrato: id, nome, email, registroCrea, perfil e mensagem. O front espera ainda token e usuario
     * no cadastro (reaproveita a resposta de login), então devolvemos os dois formatos juntos.
     */
    public record CadastroResponse(UUID id, String nome, String email, String registroCrea, Perfil perfil,
                                   String mensagem, String token, UsuarioResponse usuario) {
    }
}
