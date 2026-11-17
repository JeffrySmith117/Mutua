package br.icev.mutua;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import br.icev.mutua.common.Relogio;
import br.icev.mutua.reserva.Reserva;
import br.icev.mutua.reserva.ReservaRepository;
import br.icev.mutua.reserva.StatusReserva;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.MediaType;

/** Despachos simultâneos sobre a mesma solicitação e registro do aceite do Termo de Guarda. */
class ReservaConcorrenciaTermoTest extends IntegracaoBase {

    private static final int DESPACHOS_SIMULTANEOS = 8;

    @Autowired
    private ReservaRepository reservas;

    @Test
    void aprovarERecusarAoMesmoTempoSoUmDespachoVale() throws Exception {
        String token = token(novoProfissional());
        String admin = tokenAdmin();
        LocalDate retirada = diaUtil(60);
        String id = solicitarDrone(token, retirada, true).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String reservaId = json.readTree(id).get("id").asText();

        ExecutorService executor = Executors.newFixedThreadPool(DESPACHOS_SIMULTANEOS);
        CountDownLatch largada = new CountDownLatch(1);
        List<Future<Integer>> respostas = new ArrayList<>();
        try {
            for (int i = 0; i < DESPACHOS_SIMULTANEOS; i++) {
                boolean aprovar = i % 2 == 0;
                respostas.add(executor.submit(() -> {
                    largada.await();
                    return mvc.perform(post("/admin/pendencias/" + reservaId + (aprovar ? "/aprovar" : "/recusar"))
                                    .header("Authorization", "Bearer " + admin)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(aprovar ? "{}" : "{\"motivo\":\"Equipamento em manutenção\"}"))
                            .andReturn().getResponse().getStatus();
                }));
            }
            largada.countDown();

            List<Integer> codigos = new ArrayList<>();
            for (Future<Integer> resposta : respostas) {
                codigos.add(resposta.get(30, TimeUnit.SECONDS));
            }
            assertThat(codigos).filteredOn(codigo -> codigo == 200).hasSize(1);
            assertThat(codigos).filteredOn(codigo -> codigo == 409).hasSize(DESPACHOS_SIMULTANEOS - 1);
        } finally {
            executor.shutdownNow();
        }

        // O histórico registra um único despacho, coerente com o status final.
        JsonNode registro = json.readTree(mvc.perform(get("/admin/historico/" + reservaId)
                        .header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        long despachos = 0;
        for (JsonNode evento : registro.get("linhaDoTempo")) {
            String tipo = evento.toString();
            if (tipo.contains("aprovada") || tipo.contains("recusada")) {
                despachos++;
            }
        }
        assertThat(despachos).isEqualTo(1);
    }

    /**
     * Versão determinística da disputa: duas operações carregam a mesma versão da reserva antes de qualquer
     * gravação; a primeira grava e a segunda, que partiu de um estado já ultrapassado, é recusada.
     */
    @Test
    void gravacaoAPartirDeVersaoUltrapassadaERecusada() throws Exception {
        String token = token(novoProfissional());
        UUID reservaId = UUID.fromString(json.readTree(solicitarDrone(token, diaUtil(64), true)
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText());

        Reserva aprovacao = reservas.findById(reservaId).orElseThrow();
        Reserva recusa = reservas.findById(reservaId).orElseThrow();
        aprovacao.mudarPara(StatusReserva.CONFIRMADA);
        recusa.mudarPara(StatusReserva.RECUSADA);

        reservas.saveAndFlush(aprovacao);
        assertThatThrownBy(() -> reservas.saveAndFlush(recusa))
                .isInstanceOf(OptimisticLockingFailureException.class);
        assertThat(reservas.findById(reservaId).orElseThrow().getStatus()).isEqualTo(StatusReserva.CONFIRMADA);
    }

    @Test
    void aceiteDoTermoFicaRegistradoNaReservaDeEquipamento() throws Exception {
        String token = token(novoProfissional());
        String admin = tokenAdmin();
        LocalDate retirada = diaUtil(70);

        solicitarDrone(token, retirada, false).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("termoAceito"));

        String reservaId = json.readTree(solicitarDrone(token, retirada, true).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString()).get("id").asText();

        JsonNode minha = null;
        for (JsonNode no : json.readTree(mvc.perform(get("/reservas/minhas")
                .header("Authorization", "Bearer " + token)).andReturn().getResponse().getContentAsString())) {
            if (reservaId.equals(no.get("id").asText())) {
                minha = no;
            }
        }
        assertThat(minha).isNotNull();
        assertThat(minha.hasNonNull("termoAceitoEm")).isTrue();

        mvc.perform(get("/admin/historico/" + reservaId).header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.termoAceitoEm").isNotEmpty())
                .andExpect(jsonPath("$.linhaDoTempo[0].descricao")
                        .value(org.hamcrest.Matchers.containsString("Termo de Guarda")));

        // Ambientes não têm termo.
        String sala = idPorNome(token, "/ambientes", "Sala de Reuniões Executiva A");
        LocalDate dia = diaUtil(71);
        String corpo = "{\"recursoId\":\"" + sala + "\",\"dataInicio\":\"" + dia + "T09:00:00\",\"dataFim\":\"" + dia
                + "T10:00:00\",\"finalidade\":\"Reunião de teste\"}";
        mvc.perform(post("/reservas").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(corpo)).andExpect(status().isCreated());
        for (JsonNode no : json.readTree(mvc.perform(get("/reservas/minhas")
                .header("Authorization", "Bearer " + token)).andReturn().getResponse().getContentAsString())) {
            if ("ambiente".equals(no.get("tipo").asText())) {
                assertThat(no.hasNonNull("termoAceitoEm")).isFalse();
            }
        }
    }

    // ---------- helpers ----------

    private org.springframework.test.web.servlet.ResultActions solicitarDrone(String token, LocalDate retirada,
            boolean termoAceito) throws Exception {
        String drone = idPorNome(token, "/equipamentos", "Drone DJI Phantom 4 RTK");
        String corpo = "{\"recursoId\":\"" + drone + "\",\"tipo\":\"equipamento\",\"dataInicio\":\"" + retirada
                + "T08:30:00\",\"dataFim\":\"" + retirada + "T17:00:00\",\"finalidade\":\"Levantamento\","
                + "\"numeroArt\":\"ART: 7\",\"termoAceito\":" + termoAceito + "}";
        return mvc.perform(post("/reservas").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private String idPorNome(String token, String rota, String nome) throws Exception {
        String corpo = mvc.perform(get(rota).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        for (JsonNode no : json.readTree(corpo)) {
            if (nome.equals(no.get("nome").asText())) {
                return no.get("id").asText();
            }
        }
        throw new AssertionError("Recurso não encontrado: " + nome);
    }

    private LocalDate diaUtil(int deslocamentoDias) {
        LocalDate dia = LocalDate.now(Relogio.FUSO).plusDays(deslocamentoDias);
        while (dia.getDayOfWeek() == DayOfWeek.SATURDAY || dia.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dia = dia.plusDays(1);
        }
        return dia;
    }
}
