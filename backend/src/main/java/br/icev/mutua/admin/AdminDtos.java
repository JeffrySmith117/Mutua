package br.icev.mutua.admin;

import jakarta.validation.constraints.NotBlank;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record AprovarRequest(String observacao) {
    }

    public record RecusarRequest(@NotBlank(message = "Informe o parecer da recusa.") String motivo) {
    }
}
