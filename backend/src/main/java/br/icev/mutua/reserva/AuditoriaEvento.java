package br.icev.mutua.reserva;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Evento imutável da linha do tempo de uma reserva. */
@Entity
@Table(name = "auditoria_evento")
public class AuditoriaEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    private String titulo;

    @Column(name = "tipo_evento")
    private String tipoEvento;

    @Column(name = "responsavel_nome")
    private String responsavelNome;

    private String descricao;

    @Column(name = "data_hora")
    private LocalDateTime dataHora;

    protected AuditoriaEvento() {
    }

    public AuditoriaEvento(Reserva reserva, String tipoEvento, String titulo, String responsavelNome,
                           String descricao, LocalDateTime dataHora) {
        this.reserva = reserva;
        this.tipoEvento = tipoEvento;
        this.titulo = titulo;
        this.responsavelNome = responsavelNome;
        this.descricao = descricao;
        this.dataHora = dataHora;
    }

    public UUID getId() { return id; }
    public Reserva getReserva() { return reserva; }
    public String getTitulo() { return titulo; }
    public String getTipoEvento() { return tipoEvento; }
    public String getResponsavelNome() { return responsavelNome; }
    public String getDescricao() { return descricao; }
    public LocalDateTime getDataHora() { return dataHora; }
}
