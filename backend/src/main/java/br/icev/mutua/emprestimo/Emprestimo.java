package br.icev.mutua.emprestimo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.icev.mutua.reserva.Reserva;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Movimentação de balcão de um equipamento: retirada, devolução e conferência. */
@Entity
@Table(name = "emprestimo")
public class Emprestimo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    @Column(name = "data_retirada")
    private LocalDateTime dataRetirada;

    @Column(name = "condicao_retirada")
    private String condicaoRetirada;

    @Column(name = "observacoes_retirada")
    private String observacoesRetirada;

    @Column(name = "data_devolucao_efetiva")
    private LocalDateTime dataDevolucaoEfetiva;

    @Column(name = "condicao_devolucao")
    private String condicaoDevolucao;

    @Column(name = "observacoes_devolucao")
    private String observacoesDevolucao;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "itens_conferidos", columnDefinition = "text[]")
    private List<String> itensConferidos = new ArrayList<>();

    @Column(name = "atendente_balcao")
    private String atendenteBalcao;

    public UUID getId() { return id; }

    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }

    public LocalDateTime getDataRetirada() { return dataRetirada; }
    public void setDataRetirada(LocalDateTime dataRetirada) { this.dataRetirada = dataRetirada; }

    public String getCondicaoRetirada() { return condicaoRetirada; }
    public void setCondicaoRetirada(String condicaoRetirada) { this.condicaoRetirada = condicaoRetirada; }

    public String getObservacoesRetirada() { return observacoesRetirada; }
    public void setObservacoesRetirada(String observacoesRetirada) { this.observacoesRetirada = observacoesRetirada; }

    public LocalDateTime getDataDevolucaoEfetiva() { return dataDevolucaoEfetiva; }
    public void setDataDevolucaoEfetiva(LocalDateTime dataDevolucaoEfetiva) { this.dataDevolucaoEfetiva = dataDevolucaoEfetiva; }

    public String getCondicaoDevolucao() { return condicaoDevolucao; }
    public void setCondicaoDevolucao(String condicaoDevolucao) { this.condicaoDevolucao = condicaoDevolucao; }

    public String getObservacoesDevolucao() { return observacoesDevolucao; }
    public void setObservacoesDevolucao(String observacoesDevolucao) { this.observacoesDevolucao = observacoesDevolucao; }

    public List<String> getItensConferidos() { return itensConferidos; }
    public void setItensConferidos(List<String> itensConferidos) { this.itensConferidos = itensConferidos; }

    public String getAtendenteBalcao() { return atendenteBalcao; }
    public void setAtendenteBalcao(String atendenteBalcao) { this.atendenteBalcao = atendenteBalcao; }
}
