package br.icev.mutua.emprestimo;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, UUID> {

    Optional<Emprestimo> findByReservaId(UUID reservaId);

    List<Emprestimo> findByReservaIdIn(Collection<UUID> reservaIds);
}
