package br.icev.mutua.reserva;

import br.icev.mutua.common.Relogio;

import org.springframework.stereotype.Service;

@Service
public class AuditoriaService {

    public static final String SISTEMA = "Sistema";

    private final AuditoriaRepository eventos;

    public AuditoriaService(AuditoriaRepository eventos) {
        this.eventos = eventos;
    }

    public void registrar(Reserva reserva, String tipo, String titulo, String responsavel, String descricao) {
        eventos.save(new AuditoriaEvento(reserva, tipo, titulo, responsavel, descricao, Relogio.agora()));
    }
}
