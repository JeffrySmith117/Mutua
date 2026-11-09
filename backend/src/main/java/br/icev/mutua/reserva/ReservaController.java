package br.icev.mutua.reserva;

import java.util.List;
import java.util.UUID;

import br.icev.mutua.reserva.ReservaDtos.CancelarRequest;
import br.icev.mutua.reserva.ReservaDtos.CriarReservaRequest;
import br.icev.mutua.reserva.ReservaDtos.ReservaCriadaResponse;
import br.icev.mutua.reserva.ReservaDtos.ReservaResumo;
import br.icev.mutua.usuario.Usuario;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** GET /reservas e DELETE /reservas/{id} são os caminhos que o front usa hoje; o contrato define /minhas e PATCH. */
@RestController
@RequestMapping("/reservas")
public class ReservaController {

    private final ReservaService reservas;

    public ReservaController(ReservaService reservas) {
        this.reservas = reservas;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaCriadaResponse criar(@AuthenticationPrincipal Usuario usuario,
                                       @Valid @RequestBody CriarReservaRequest req) {
        return reservas.criar(usuario, req);
    }

    @GetMapping({"", "/minhas"})
    public List<ReservaResumo> minhas(@AuthenticationPrincipal Usuario usuario) {
        return reservas.minhas(usuario);
    }

    @PatchMapping("/{id}/cancelar")
    public ReservaResumo cancelar(@AuthenticationPrincipal Usuario usuario, @PathVariable UUID id,
                                  @RequestBody(required = false) CancelarRequest req) {
        return reservas.cancelar(usuario, id, req == null ? null : req.motivo());
    }

    @DeleteMapping("/{id}")
    public ReservaResumo cancelarPorDelete(@AuthenticationPrincipal Usuario usuario, @PathVariable UUID id) {
        return reservas.cancelar(usuario, id, null);
    }

    @PostMapping("/{id}/checkin")
    public ReservaResumo checkin(@AuthenticationPrincipal Usuario usuario, @PathVariable UUID id) {
        return reservas.checkin(usuario, id);
    }
}
