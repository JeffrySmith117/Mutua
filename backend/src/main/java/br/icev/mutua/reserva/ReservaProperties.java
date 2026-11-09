package br.icev.mutua.reserva;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mutua.reserva")
public record ReservaProperties(int antecedenciaMinimaCancelamentoHoras, int toleranciaCheckinMinutos,
                                long intervaloVencimentosMs) {
}
