package br.icev.mutua.reserva;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditoriaRepository extends JpaRepository<AuditoriaEvento, UUID> {

    @Query("select e from AuditoriaEvento e where e.reserva.id in :ids order by e.dataHora, e.id")
    List<AuditoriaEvento> buscarDasReservas(@Param("ids") Collection<UUID> ids);
}
