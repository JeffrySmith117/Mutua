package br.icev.mutua;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import br.icev.mutua.common.Relogio;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/** Regras apontadas pelo relatório de QA: janela de check-in, dias do balcão, atraso e limites de tamanho. */
class ReservaRegrasQaTest extends IntegracaoBase {

    @Test
    void checkinSoAbreQuinzeMinutosAntesEFechaAposATolerancia() throws Exception {
        String token = token(novoProfissional());
        String sala = idPorNome(token, "/ambientes", "Sala de Reuniões Executiva A");
        LocalDate dia = diaUtil(40);
        String id = criarSala(token, sala, dia, "13:00", "14:00");

        checkin(token, id).andExpect(status().isConflict()); // horas antes (CT05)

        Relogio.fixar(dia.atTime(12, 40));
        checkin(token, id).andExpect(status().isConflict()); // 20 min antes: ainda fechado

        Relogio.fixar(dia.atTime(12, 50));
        checkin(token, id).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("EM_USO"));

        String tardia = criarSala(token, sala, diaUtil(41), "16:00", "17:00");
        Relogio.fixar(diaUtil(41).atTime(16, 31));
        checkin(token, tardia).andExpect(status().isConflict()); // passou da tolerância de 30 min
    }

    @Test
    void equipamentoNaoPodeSerRetiradoNemDevolvidoEmDiaSemExpediente() throws Exception {
        String token = token(novoProfissional());
        String drone = idPorNome(token, "/equipamentos", "Drone DJI Phantom 4 RTK");
        LocalDate domingo = LocalDate.now(Relogio.FUSO).plusWeeks(6).with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        solicitar(token, drone, domingo, domingo.plusDays(1), "x".repeat(10), "ART: 1")
                .andExpect(status().isBadRequest()); // retirada num domingo (CT06)
        solicitar(token, drone, domingo.plusDays(1), domingo.plusDays(6), "x".repeat(10), "ART: 1")
                .andExpect(status().isBadRequest()); // devolução num sábado
    }

    @Test
    void camposComTamanhoExcessivoRetornam400ComOCampo() throws Exception {
        String token = token(novoProfissional());
        String sala = idPorNome(token, "/ambientes", "Sala de Reuniões Executiva A");
        LocalDate dia = diaUtil(42);
        String corpo = "{\"recursoId\":\"" + sala + "\",\"dataInicio\":\"" + dia + "T13:00:00\",\"dataFim\":\"" + dia
                + "T14:00:00\",\"finalidade\":\"" + "a".repeat(1001) + "\"}";
        mvc.perform(post("/reservas").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("finalidade")); // CT08

        String drone = idPorNome(token, "/equipamentos", "Drone DJI Phantom 4 RTK");
        LocalDate retirada = diaUtil(43);
        solicitar(token, drone, retirada, retirada.plusDays(1), "Levantamento", "1".repeat(250))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("numeroArt"));
    }

    @Test
    void retiradaSoNoPeriodoReservadoEDevolucaoPendenteApareceEmAtraso() throws Exception {
        String token = token(novoProfissional());
        String admin = tokenAdmin();
        String drone = idPorNome(token, "/equipamentos", "Drone DJI Phantom 4 RTK");
        LocalDate retirada = diaUtil(50);
        String id = json.readTree(solicitar(token, drone, retirada, retirada.plusDays(2), "Levantamento", "ART: 99")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();
        mvc.perform(post("/admin/pendencias/" + id + "/aprovar").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isOk());

        retirar(admin, id).andExpect(status().isConflict()); // dias antes do período reservado

        Relogio.fixar(retirada.atTime(9, 0));
        retirar(admin, id).andExpect(status().isOk());
        assertThat(movimentacao(admin, id).get("emAtraso").asBoolean()).isFalse();

        Relogio.fixar(retirada.plusDays(3).atTime(9, 0)); // passou da devolução prevista (D09)
        JsonNode atrasada = movimentacao(admin, id);
        assertThat(atrasada.get("emAtraso").asBoolean()).isTrue();
        assertThat(atrasada.get("statusMovimentacao").asText()).isEqualTo("em_campo");
        mvc.perform(get("/admin/metricas").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipamentosEmAtraso").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    // ---------- helpers ----------

    private org.springframework.test.web.servlet.ResultActions checkin(String token, String id) throws Exception {
        return mvc.perform(post("/reservas/" + id + "/checkin").header("Authorization", "Bearer " + token));
    }

    private org.springframework.test.web.servlet.ResultActions retirar(String admin, String id) throws Exception {
        return mvc.perform(post("/admin/movimentacoes/" + id + "/retirar").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"condicao\":\"otimo\"}"));
    }

    /** Linha da fila do balcão correspondente à reserva. */
    private JsonNode movimentacao(String admin, String id) throws Exception {
        String corpo = mvc.perform(get("/admin/movimentacoes").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        for (JsonNode no : json.readTree(corpo)) {
            if (id.equals(no.get("id").asText())) {
                return no;
            }
        }
        throw new AssertionError("Movimentação não encontrada na fila do balcão: " + id);
    }

    private String criarSala(String token, String sala, LocalDate dia, String inicio, String fim) throws Exception {
        String corpo = "{\"recursoId\":\"" + sala + "\",\"dataInicio\":\"" + dia + "T" + inicio + ":00\","
                + "\"dataFim\":\"" + dia + "T" + fim + ":00\",\"finalidade\":\"Reunião de teste\"}";
        String resposta = mvc.perform(post("/reservas").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(resposta).get("id").asText();
    }

    private org.springframework.test.web.servlet.ResultActions solicitar(String token, String equipamento,
            LocalDate retirada, LocalDate devolucao, String finalidade, String art) throws Exception {
        String corpo = "{\"recursoId\":\"" + equipamento + "\",\"tipo\":\"equipamento\",\"dataInicio\":\"" + retirada
                + "T08:30:00\",\"dataFim\":\"" + devolucao + "T17:00:00\",\"finalidade\":\"" + finalidade
                + "\",\"numeroArt\":\"" + art + "\",\"termoAceito\":true}";
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
