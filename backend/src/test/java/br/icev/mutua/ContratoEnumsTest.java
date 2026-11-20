package br.icev.mutua;

import static org.assertj.core.api.Assertions.assertThat;

import br.icev.mutua.reserva.StatusReserva;
import br.icev.mutua.usuario.Perfil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class ContratoEnumsTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void statusReservaSerializaEmMinusculasEDesserializaCaseInsensitive() throws Exception {
        assertThat(mapper.writeValueAsString(StatusReserva.CONFIRMADA)).isEqualTo("\"confirmada\"");
        assertThat(mapper.writeValueAsString(StatusReserva.PENDENTE)).isEqualTo("\"pendente\"");
        assertThat(mapper.writeValueAsString(StatusReserva.EM_USO)).isEqualTo("\"em_uso\"");
        assertThat(mapper.writeValueAsString(StatusReserva.CONCLUIDA)).isEqualTo("\"concluida\"");
        assertThat(mapper.writeValueAsString(StatusReserva.CANCELADA)).isEqualTo("\"cancelada\"");
        assertThat(mapper.writeValueAsString(StatusReserva.RECUSADA)).isEqualTo("\"recusada\"");
        assertThat(mapper.writeValueAsString(StatusReserva.NAO_COMPARECEU)).isEqualTo("\"nao_compareceu\"");

        assertThat(mapper.readValue("\"confirmada\"", StatusReserva.class)).isEqualTo(StatusReserva.CONFIRMADA);
        assertThat(mapper.readValue("\"CONFIRMADA\"", StatusReserva.class)).isEqualTo(StatusReserva.CONFIRMADA);
        assertThat(mapper.readValue("\"em_uso\"", StatusReserva.class)).isEqualTo(StatusReserva.EM_USO);
        assertThat(mapper.readValue("\"EM_USO\"", StatusReserva.class)).isEqualTo(StatusReserva.EM_USO);
    }

    @Test
    void perfilSerializaEmMinusculasEDesserializaCaseInsensitive() throws Exception {
        assertThat(mapper.writeValueAsString(Perfil.ADMIN)).isEqualTo("\"admin\"");
        assertThat(mapper.writeValueAsString(Perfil.PROFISSIONAL)).isEqualTo("\"profissional\"");

        assertThat(mapper.readValue("\"admin\"", Perfil.class)).isEqualTo(Perfil.ADMIN);
        assertThat(mapper.readValue("\"ADMIN\"", Perfil.class)).isEqualTo(Perfil.ADMIN);
        assertThat(mapper.readValue("\"profissional\"", Perfil.class)).isEqualTo(Perfil.PROFISSIONAL);
        assertThat(mapper.readValue("\"PROFISSIONAL\"", Perfil.class)).isEqualTo(Perfil.PROFISSIONAL);
    }
}

