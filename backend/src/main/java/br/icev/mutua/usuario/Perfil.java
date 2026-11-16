package br.icev.mutua.usuario;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Perfil {
    PROFISSIONAL,
    ADMIN;

    @JsonValue
    public String getValor() {
        return name().toLowerCase(Locale.ROOT);
    }

    @JsonCreator
    public static Perfil doValor(String v) {
        if (v == null || v.isBlank()) {
            return null;
        }
        return Perfil.valueOf(v.trim().toUpperCase(Locale.ROOT));
    }
}
