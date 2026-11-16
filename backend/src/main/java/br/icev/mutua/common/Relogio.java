package br.icev.mutua.common;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;

/** Horário operacional da Mútua-PI: todos os instantes do sistema são hora local de Fortaleza/Teresina. */
public final class Relogio {

    public static final ZoneId FUSO = ZoneId.of("America/Fortaleza");

    private static volatile Clock relogio = Clock.system(FUSO);

    private Relogio() {
    }

    public static LocalDateTime agora() {
        return LocalDateTime.now(relogio);
    }

    /** Uso em testes: fixa o "agora" do sistema. Chame {@link #restaurar()} ao terminar. */
    public static void fixar(LocalDateTime instante) {
        relogio = Clock.fixed(instante.atZone(FUSO).toInstant(), FUSO);
    }

    public static void restaurar() {
        relogio = Clock.system(FUSO);
    }
}
