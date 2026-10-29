package br.icev.mutua.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Conta falhas por chave numa janela fixa a partir da primeira falha e bloqueia ao atingir o máximo.
 * Fica em memória: vale para uma instância da API (se houver várias, o limite é por instância).
 */
public class LimitadorDeTentativas {

    private static final int LIMITE_PARA_LIMPEZA = 10_000;

    private record Registro(int falhas, Instant inicioDaJanela) {
    }

    private final int maximo;
    private final Duration janela;
    private final Clock relogio;
    private final ConcurrentHashMap<String, Registro> registros = new ConcurrentHashMap<>();

    public LimitadorDeTentativas(int maximo, Duration janela, Clock relogio) {
        this.maximo = maximo;
        this.janela = janela;
        this.relogio = relogio;
    }

    public boolean bloqueada(String chave) {
        Registro registro = registros.get(chave);
        if (registro == null) {
            return false;
        }
        if (expirou(registro)) {
            registros.remove(chave, registro);
            return false;
        }
        return registro.falhas() >= maximo;
    }

    public void registrarFalha(String chave) {
        Instant agora = relogio.instant();
        registros.compute(chave, (k, atual) -> atual == null || expirou(atual)
                ? new Registro(1, agora)
                : new Registro(atual.falhas() + 1, atual.inicioDaJanela()));
        if (registros.size() > LIMITE_PARA_LIMPEZA) {
            registros.values().removeIf(this::expirou);
        }
    }

    public void limpar(String chave) {
        registros.remove(chave);
    }

    private boolean expirou(Registro registro) {
        return !relogio.instant().isBefore(registro.inicioDaJanela().plus(janela));
    }
}
