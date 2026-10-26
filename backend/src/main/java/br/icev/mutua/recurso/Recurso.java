package br.icev.mutua.recurso;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Ambiente ou equipamento. Um novo espaço ou equipamento é só um cadastro, sem mudança de código. */
@Entity
@Table(name = "recurso")
public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nome;

    @Enumerated(EnumType.STRING)
    private TipoRecurso tipo;

    private String patrimonio;

    private String localizacao;

    private String descricao;

    private String categoria;

    private int capacidade = 1;

    @Column(name = "prazo_max_dias")
    private int prazoMaxDias = 1;

    @Column(name = "exige_aprovacao")
    private boolean exigeAprovacao;

    @Column(name = "exige_art_sisant")
    private boolean exigeArtSisant;

    @Column(name = "horario_abertura")
    private LocalTime horarioAbertura;

    @Column(name = "horario_fechamento")
    private LocalTime horarioFechamento;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "dias_semana", columnDefinition = "int[]")
    private List<Integer> diasSemana = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "recursos_disponiveis", columnDefinition = "text[]")
    private List<String> recursosDisponiveis = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> especificacoes = new ArrayList<>();

    private boolean ativo = true;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    public UUID getId() { return id; }
    public String getNome() { return nome; }
    public TipoRecurso getTipo() { return tipo; }
    public String getPatrimonio() { return patrimonio; }
    public String getLocalizacao() { return localizacao; }
    public String getDescricao() { return descricao; }
    public String getCategoria() { return categoria; }
    public int getCapacidade() { return capacidade; }
    public int getPrazoMaxDias() { return prazoMaxDias; }
    public boolean isExigeAprovacao() { return exigeAprovacao; }
    public boolean isExigeArtSisant() { return exigeArtSisant; }
    public LocalTime getHorarioAbertura() { return horarioAbertura; }
    public LocalTime getHorarioFechamento() { return horarioFechamento; }
    public List<Integer> getDiasSemana() { return diasSemana; }
    public List<String> getRecursosDisponiveis() { return recursosDisponiveis; }
    public List<String> getEspecificacoes() { return especificacoes; }
    public boolean isAtivo() { return ativo; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public boolean isEquipamento() {
        return tipo == TipoRecurso.EQUIPAMENTO;
    }

    /**
     * Recursos exclusivos aceitam uma reserva por vez (protegidos pela exclusion constraint do banco).
     * O coworking tem capacidade compartilhada, controlada por lotação no service.
     */
    public boolean isExclusivo() {
        return tipo != TipoRecurso.COWORKING;
    }
}
