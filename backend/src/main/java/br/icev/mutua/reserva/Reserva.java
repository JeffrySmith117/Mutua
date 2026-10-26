package br.icev.mutua.reserva;

import java.time.LocalDateTime;
import java.util.UUID;

import br.icev.mutua.common.ApiException;
import br.icev.mutua.recurso.Recurso;
import br.icev.mutua.usuario.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "reserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String protocolo;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "recurso_id")
    private Recurso recurso;

    @Column(name = "data_inicio")
    private LocalDateTime dataInicio;

    @Column(name = "data_fim")
    private LocalDateTime dataFim;

    @Enumerated(EnumType.STRING)
    private StatusReserva status = StatusReserva.PENDENTE;

    private String finalidade;

    @Column(name = "documento_vinculado")
    private String documentoVinculado;

    @Column(name = "motivo_recusa_cancelamento")
    private String motivoRecusaCancelamento;

    private boolean exclusivo = true;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    public UUID getId() { return id; }

    public String getProtocolo() { return protocolo; }
    public void setProtocolo(String protocolo) { this.protocolo = protocolo; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Recurso getRecurso() { return recurso; }
    public void setRecurso(Recurso recurso) { this.recurso = recurso; }

    public LocalDateTime getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDateTime dataInicio) { this.dataInicio = dataInicio; }

    public LocalDateTime getDataFim() { return dataFim; }
    public void setDataFim(LocalDateTime dataFim) { this.dataFim = dataFim; }

    public StatusReserva getStatus() { return status; }

    public String getFinalidade() { return finalidade; }
    public void setFinalidade(String finalidade) { this.finalidade = finalidade; }

    public String getDocumentoVinculado() { return documentoVinculado; }
    public void setDocumentoVinculado(String documentoVinculado) { this.documentoVinculado = documentoVinculado; }

    public String getMotivoRecusaCancelamento() { return motivoRecusaCancelamento; }
    public void setMotivoRecusaCancelamento(String motivo) { this.motivoRecusaCancelamento = motivo; }

    public boolean isExclusivo() { return exclusivo; }
    public void setExclusivo(boolean exclusivo) { this.exclusivo = exclusivo; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    /** Único ponto de mudança de estado: recusa transições fora do ciclo de vida com 409. */
    public void mudarPara(StatusReserva novo) {
        if (!status.podeIrPara(novo)) {
            throw ApiException.conflito("A reserva " + protocolo + " está " + status
                    + " e não pode passar para " + novo + ".");
        }
        status = novo;
    }
}
