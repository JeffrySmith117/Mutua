package br.icev.mutua;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.UUID;

import br.icev.mutua.common.Relogio;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/** Cadastro de ambientes e equipamentos pelo administrador. */
class AdminRecursoTest extends IntegracaoBase {

    @Test
    void profissionalNaoCadastraRecurso() throws Exception {
        String profissional = token(novoProfissional());
        mvc.perform(post("/admin/recursos").header("Authorization", "Bearer " + profissional)
                        .contentType(MediaType.APPLICATION_JSON).content(salaJson("Sala Proibida " + sufixo())))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCadastraAmbienteQueApareceNaListagemEPodeSerReservado() throws Exception {
        String admin = tokenAdmin();
        String profissional = token(novoProfissional());
        String nome = "Sala de Estudo " + sufixo();

        String id = criar(admin, "{\"nome\":\"" + nome + "\",\"tipo\":\"SALA\",\"localizacao\":\"1º Andar\","
                + "\"capacidade\":6,\"recursosDisponiveis\":[\"Wi-Fi\",\"  \"]}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.capacidade").value(6))
                .andExpect(jsonPath("$.horarioFuncionamento").value("Segunda a Sexta, das 08h às 18h"))
                .andExpect(jsonPath("$.recursosDisponiveis", hasSize(1)))
                .andExpect(jsonPath("$.ativo").value(true))
                .andReturn().getResponse().getContentAsString();
        String recursoId = json.readTree(id).get("id").asText();

        mvc.perform(get("/ambientes").param("termoBusca", nome).header("Authorization", "Bearer " + profissional))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        reservar(profissional, recursoId, proximoDiaUtil(30)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMADA"));
    }

    @Test
    void equipamentoExigePatrimonioUnicoEAmbienteNaoPodeTer() throws Exception {
        String admin = tokenAdmin();
        String nome = "Nível a Laser " + sufixo();
        String patrimonio = "HUB-T" + sufixo();

        criar(admin, "{\"nome\":\"" + nome + "\",\"tipo\":\"EQUIPAMENTO\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("patrimonio"));

        String corpo = "{\"nome\":\"" + nome + "\",\"tipo\":\"EQUIPAMENTO\",\"patrimonio\":\"" + patrimonio
                + "\",\"categoria\":\"Topografia\",\"prazoMaxDias\":2,\"exigeAprovacao\":true,"
                + "\"exigeArtSisant\":true}";
        String criado = criar(admin, corpo).andExpect(status().isCreated())
                .andExpect(jsonPath("$.exigeArtSisant").value(true))
                .andReturn().getResponse().getContentAsString();

        criar(admin, corpo).andExpect(status().isConflict())
                .andExpect(jsonPath("$.validationErrors[0].field").value("patrimonio"));

        mvc.perform(get("/equipamentos/" + json.readTree(criado).get("id").asText())
                        .header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DISPONIVEL"))
                .andExpect(jsonPath("$.prazoMaximoDias").value(2));

        criar(admin, "{\"nome\":\"Sala " + sufixo() + "\",\"tipo\":\"SALA\",\"patrimonio\":\"HUB-X" + sufixo() + "\"}")
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejeitaDadosInvalidos() throws Exception {
        String admin = tokenAdmin();
        criar(admin, "{\"nome\":\"Sala " + sufixo() + "\",\"tipo\":\"SALA\","
                + "\"horarioAbertura\":\"18:00\",\"horarioFechamento\":\"08:00\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("horarioFechamento"));
        criar(admin, "{\"nome\":\"Sala " + sufixo() + "\",\"tipo\":\"SALA\",\"diasSemana\":[0,8]}")
                .andExpect(status().isBadRequest());
        criar(admin, "{\"nome\":\"Sala " + sufixo() + "\",\"tipo\":\"SALA\",\"capacidade\":0}")
                .andExpect(status().isBadRequest());
        criar(admin, "{\"nome\":\"Sala " + sufixo() + "\"}").andExpect(status().isBadRequest());
        criar(admin, "{\"tipo\":\"SALA\"}").andExpect(status().isBadRequest());
    }

    @Test
    void atualizaOsDadosMasNaoMudaOTipo() throws Exception {
        String admin = tokenAdmin();
        String id = idDe(criar(admin, salaJson("Sala Reforma " + sufixo()))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());

        mvc.perform(put("/admin/recursos/" + id).header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Sala Reformada\",\"tipo\":\"SALA\",\"capacidade\":10,"
                                + "\"horarioFechamento\":\"20:00\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Sala Reformada"))
                .andExpect(jsonPath("$.capacidade").value(10))
                .andExpect(jsonPath("$.horarioFuncionamento").value("Segunda a Sexta, das 08h às 20h"));

        mvc.perform(put("/admin/recursos/" + id).header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Sala Reformada\",\"tipo\":\"AUDITORIO\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("tipo"));

        mvc.perform(put("/admin/recursos/" + UUID.randomUUID()).header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content(salaJson("Qualquer " + sufixo())))
                .andExpect(status().isNotFound());
    }

    @Test
    void desativarExigeSemReservasAtivasEEscondeDaListagemPublica() throws Exception {
        String admin = tokenAdmin();
        String profissional = token(novoProfissional());
        String nome = "Sala Temporária " + sufixo();
        String id = idDe(criar(admin, salaJson(nome)).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());

        String reserva = reservar(profissional, id, proximoDiaUtil(35)).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ativo(admin, id, false).andExpect(status().isConflict());

        mvc.perform(delete("/reservas/" + idDe(reserva)).header("Authorization", "Bearer " + profissional))
                .andExpect(status().isOk());

        ativo(admin, id, false).andExpect(status().isOk()).andExpect(jsonPath("$.ativo").value(false));

        mvc.perform(get("/ambientes").param("termoBusca", nome).header("Authorization", "Bearer " + profissional))
                .andExpect(jsonPath("$", hasSize(0)));
        reservar(profissional, id, proximoDiaUtil(36)).andExpect(status().isNotFound());
        mvc.perform(get("/admin/recursos").header("Authorization", "Bearer " + admin))
                .andExpect(jsonPath("$[?(@.id == '" + id + "')].ativo").value(false));

        ativo(admin, id, true).andExpect(status().isOk()).andExpect(jsonPath("$.ativo").value(true));
        reservar(profissional, id, proximoDiaUtil(36)).andExpect(status().isCreated());
    }

    // ---------- helpers ----------

    private org.springframework.test.web.servlet.ResultActions criar(String token, String corpo) throws Exception {
        return mvc.perform(post("/admin/recursos").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private org.springframework.test.web.servlet.ResultActions ativo(String token, String id, boolean valor)
            throws Exception {
        return mvc.perform(patch("/admin/recursos/" + id + "/ativo").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"ativo\":" + valor + "}"));
    }

    private org.springframework.test.web.servlet.ResultActions reservar(String token, String recursoId, LocalDate dia)
            throws Exception {
        return mvc.perform(post("/reservas").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"recursoId\":\"" + recursoId + "\",\"dataInicio\":\"" + dia + "T10:00:00\","
                        + "\"dataFim\":\"" + dia + "T11:00:00\",\"finalidade\":\"Estudo\"}"));
    }

    private String idDe(String corpo) throws Exception {
        return json.readTree(corpo).get("id").asText();
    }

    private String salaJson(String nome) {
        return "{\"nome\":\"" + nome + "\",\"tipo\":\"SALA\"}";
    }

    private String sufixo() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private LocalDate proximoDiaUtil(int deslocamentoDias) {
        LocalDate dia = LocalDate.now(Relogio.FUSO).plusDays(deslocamentoDias);
        while (dia.getDayOfWeek() == DayOfWeek.SATURDAY || dia.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dia = dia.plusDays(1);
        }
        return dia;
    }
}
