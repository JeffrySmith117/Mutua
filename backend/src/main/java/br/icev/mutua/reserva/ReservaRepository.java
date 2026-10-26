package br.icev.mutua.reserva;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import br.icev.mutua.recurso.TipoRecurso;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservaRepository extends JpaRepository<Reserva, UUID>, JpaSpecificationExecutor<Reserva> {

    /** Reservas que ocupam o recurso no intervalo [inicio, fim). */
    @Query("select r from Reserva r where r.recurso.id = :recursoId and r.status in :status "
            + "and r.dataInicio < :fim and r.dataFim > :inicio order by r.dataInicio")
    List<Reserva> buscarAtivasNoPeriodo(@Param("recursoId") UUID recursoId,
                                        @Param("status") Collection<StatusReserva> status,
                                        @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    List<Reserva> findByUsuarioIdOrderByDataInicioDesc(UUID usuarioId);

    List<Reserva> findByStatusOrderByCriadoEmAsc(StatusReserva status);

    List<Reserva> findByStatusAndDataInicioBefore(StatusReserva status, LocalDateTime limite);

    List<Reserva> findByStatusAndDataFimBefore(StatusReserva status, LocalDateTime limite);

    long countByStatus(StatusReserva status);

    long countByStatusAndRecursoTipo(StatusReserva status, TipoRecurso tipo);

    @Query("select distinct r.recurso.id from Reserva r where r.status = :status")
    List<UUID> idsDeRecursosComStatus(@Param("status") StatusReserva status);

    @Query("select r from Reserva r where r.recurso.tipo = :tipo and r.status in :status order by r.dataInicio desc")
    List<Reserva> buscarPorTipoEStatus(@Param("tipo") TipoRecurso tipo,
                                       @Param("status") Collection<StatusReserva> status, Pageable pagina);

    @Query("select count(r) from Reserva r where r.dataInicio >= :inicio and r.dataInicio < :fim "
            + "and r.status not in :excluidos")
    long contarNoPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim,
                         @Param("excluidos") Collection<StatusReserva> excluidos);

    @Query("select r from Reserva r where r.recurso.tipo in :tipos and r.dataInicio >= :inicio "
            + "and r.dataInicio < :fim and r.status in :status")
    List<Reserva> buscarDeTiposNoPeriodo(@Param("tipos") Collection<TipoRecurso> tipos,
                                         @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim,
                                         @Param("status") Collection<StatusReserva> status);

    @Query(value = "select nextval('protocolo_seq')", nativeQuery = true)
    long proximoNumeroProtocolo();
}
