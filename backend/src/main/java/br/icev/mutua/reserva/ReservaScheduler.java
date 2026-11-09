package br.icev.mutua.reserva;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReservaScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReservaScheduler.class);

    private final ReservaService reservas;

    public ReservaScheduler(ReservaService reservas) {
        this.reservas = reservas;
    }

    @Scheduled(fixedDelayString = "${mutua.reserva.intervalo-vencimentos-ms}")
    public void processarVencimentos() {
        try {
            reservas.processarVencimentos();
        } catch (RuntimeException e) {
            log.error("Falha ao processar vencimentos de reservas", e);
        }
    }
}
