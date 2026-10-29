package br.icev.mutua;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import br.icev.mutua.auth.LimitadorDeTentativas;

import org.junit.jupiter.api.Test;

class LimitadorDeTentativasTest {

    /** Relógio controlável pelo teste. */
    private static final class RelogioFalso extends Clock {
        private Instant agora = Instant.parse("2026-01-01T00:00:00Z");

        void avancar(Duration tempo) {
            agora = agora.plus(tempo);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return agora;
        }
    }

    private final RelogioFalso relogio = new RelogioFalso();
    private final LimitadorDeTentativas limitador = new LimitadorDeTentativas(3, Duration.ofMinutes(15), relogio);

    @Test
    void bloqueiaAoAtingirOMaximoDeFalhas() {
        limitador.registrarFalha("a");
        limitador.registrarFalha("a");
        assertThat(limitador.bloqueada("a")).isFalse();

        limitador.registrarFalha("a");
        assertThat(limitador.bloqueada("a")).isTrue();
    }

    @Test
    void chavesDiferentesNaoSeAfetam() {
        for (int i = 0; i < 3; i++) {
            limitador.registrarFalha("a");
        }
        assertThat(limitador.bloqueada("a")).isTrue();
        assertThat(limitador.bloqueada("b")).isFalse();
    }

    @Test
    void liberaDepoisQueAJanelaPassa() {
        for (int i = 0; i < 3; i++) {
            limitador.registrarFalha("a");
        }
        relogio.avancar(Duration.ofMinutes(14));
        assertThat(limitador.bloqueada("a")).isTrue();

        relogio.avancar(Duration.ofMinutes(1));
        assertThat(limitador.bloqueada("a")).isFalse();
    }

    @Test
    void falhaDepoisDaJanelaComecaUmaContagemNova() {
        limitador.registrarFalha("a");
        limitador.registrarFalha("a");
        relogio.avancar(Duration.ofMinutes(16));

        limitador.registrarFalha("a");
        assertThat(limitador.bloqueada("a")).isFalse();
    }

    @Test
    void limparZeraAContagem() {
        for (int i = 0; i < 3; i++) {
            limitador.registrarFalha("a");
        }
        limitador.limpar("a");
        assertThat(limitador.bloqueada("a")).isFalse();
    }
}
