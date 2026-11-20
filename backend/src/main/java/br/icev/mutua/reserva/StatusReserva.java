package br.icev.mutua.reserva;

import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Ciclo de vida da reserva (docs/ciclo-de-vida-reservas.md).
 * PENDENTE -> CONFIRMADA | RECUSADA | CANCELADA; CONFIRMADA -> EM_USO | CANCELADA | NAO_COMPARECEU;
 * EM_USO -> CONCLUIDA. Os demais são estados finais.
 */
public enum StatusReserva {
    PENDENTE,
    CONFIRMADA,
    EM_USO,
    CONCLUIDA,
    CANCELADA,
    RECUSADA,
    NAO_COMPARECEU;

    /** Estados que ocupam o horário do recurso. */
    public static final Set<StatusReserva> ATIVAS = EnumSet.of(PENDENTE, CONFIRMADA, EM_USO);

    @JsonValue
    public String getValor() {
        return name().toLowerCase(Locale.ROOT);
    }

    @JsonCreator
    public static StatusReserva doValor(String v) {
        if (v == null || v.isBlank()) {
            return null;
        }
        return StatusReserva.valueOf(v.trim().toUpperCase(Locale.ROOT));
    }

    public boolean podeIrPara(StatusReserva destino) {
        return switch (this) {
            case PENDENTE -> destino == CONFIRMADA || destino == RECUSADA || destino == CANCELADA;
            case CONFIRMADA -> destino == EM_USO || destino == CANCELADA || destino == NAO_COMPARECEU;
            case EM_USO -> destino == CONCLUIDA;
            default -> false;
        };
    }
}
