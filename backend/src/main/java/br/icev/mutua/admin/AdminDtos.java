package br.icev.mutua.admin;

import br.icev.mutua.usuario.Perfil;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record AprovarRequest(String observacao) {
    }

    /** Criação de usuário pelo admin, com o perfil escolhido (inclusive outro ADMIN). */
    public record NovoUsuarioRequest(
            @NotBlank(message = "Informe o nome.") @Size(max = 150) String nome,
            @NotBlank(message = "Informe o e-mail.") @Email(message = "E-mail inválido.") @Size(max = 150) String email,
            @NotBlank(message = "Informe a senha.")
            @Size(min = 8, max = 72, message = "A senha deve ter de 8 a 72 caracteres.") String senha,
            @NotBlank(message = "Informe o CPF.") String cpf,
            @Size(max = 30) String registroCrea,
            @Size(max = 20) String telefone,
            @NotNull(message = "Informe o perfil.") Perfil perfil) {
    }

    public record RecusarRequest(@NotBlank(message = "Informe o parecer da recusa.") String motivo) {
    }
}
