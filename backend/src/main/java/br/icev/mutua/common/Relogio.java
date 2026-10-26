package br.icev.mutua.common;

import java.time.LocalDateTime;
import java.time.ZoneId;

/** Horário operacional da Mútua-PI: todos os instantes do sistema são hora local de Fortaleza/Teresina. */
public final class Relogio {

    public static final ZoneId FUSO = ZoneId.of("America/Fortaleza");

    private Relogio() {
    }

    public static LocalDateTime agora() {
        return LocalDateTime.now(FUSO);
    }
}
