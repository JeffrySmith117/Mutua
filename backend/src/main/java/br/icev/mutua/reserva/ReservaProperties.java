package br.icev.mutua.reserva;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mutua.reserva")
public record ReservaProperties(int antecedenciaMinimaCancelamentoHoras, int toleranciaCheckinMinutos,
                                int antecedenciaCheckinMinutos, long intervaloVencimentosMs,
                                int antecedenciaMaximaDias, int duracaoMinimaMinutos,
                                int duracaoMaximaAmbienteHoras, int maxReservasAtivasPorUsuario) {
}
