package br.icev.mutua.recurso;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecursoRepository extends JpaRepository<Recurso, UUID> {

    List<Recurso> findByTipoAndAtivoTrueOrderByNome(TipoRecurso tipo);

    List<Recurso> findByTipoNotAndAtivoTrueOrderByNome(TipoRecurso tipo);

    List<Recurso> findByTipoInAndAtivoTrue(List<TipoRecurso> tipos);

    Optional<Recurso> findByIdAndAtivoTrue(UUID id);

    boolean existsByPatrimonio(String patrimonio);

    boolean existsByPatrimonioAndIdNot(String patrimonio, UUID id);

    /** Trava a linha do recurso até o fim da transação, serializando as reservas concorrentes dele. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Recurso r where r.id = :id")
    Optional<Recurso> buscarParaReserva(@Param("id") UUID id);
}
