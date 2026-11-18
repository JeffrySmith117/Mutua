package br.icev.mutua;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import br.icev.mutua.common.Relogio;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

/** D14 (tokens deixam de valer ao trocar a senha e ao sair) e D16 (editar recurso não deixa reservas órfãs). */
class SessaoERecursoQaTest extends IntegracaoBase {

    // ---------- D14 ----------

    @Test
    void trocarASenhaInvalidaOTokenAntigoEOLoginNovoFunciona() throws Exception {
        String[] credenciais = novoProfissional();
        String antigo = token(credenciais);
        String outroDispositivo = token(credenciais);
        perfil(antigo).andExpect(status().isOk());

        mvc.perform(patch("/auth/senha").header("Authorization", "Bearer " + antigo)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"senhaAtual\":\"senhaSegura123\",\"novaSenha\":\"novaSenha456\"}"))
                .andExpect(status().isNoContent());

        perfil(antigo).andExpect(status().isUnauthorized()); // CT10
        perfil(outroDispositivo).andExpect(status().isUnauthorized());
        perfil(login(credenciais[0], "novaSenha456")).andExpect(status().isOk());
    }

    @Test
    void sairEncerraAsSessoesEPermiteEntrarDeNovo() throws Exception {
        String[] credenciais = novoProfissional();
        String token = token(credenciais);

        mvc.perform(post("/auth/sair").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        perfil(token).andExpect(status().isUnauthorized());
        perfil(token(credenciais)).andExpect(status().isOk());
    }

    // ---------- D16 ----------

    @Test
    void editarDiasOuHorarioQueDeixariaReservaForaDoFuncionamentoERecusado() throws Exception {
        String admin = tokenAdmin();
        String profissional = token(novoProfissional());
        String recurso = idDe(criar(admin, "{\"nome\":\"Sala Edição " + sufixo() + "\",\"tipo\":\"SALA\"}")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        LocalDate dia = proximoDiaUtil(45);
        String protocolo = json.readTree(reservarSala(profissional, recurso, dia, "10:00", "11:00")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString())
                .get("protocolo").asText();

        // Tira da lista de dias o dia da reserva: recusado, com o protocolo na mensagem.
        String diasSemSeuDia = IntStream.rangeClosed(1, 5).filter(d -> d != dia.getDayOfWeek().getValue())
                .mapToObj(String::valueOf).collect(Collectors.joining(","));
        atualizar(admin, recurso, "{\"nome\":\"Sala Edição\",\"tipo\":\"SALA\",\"diasSemana\":[" + diasSemSeuDia + "]}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(containsString(protocolo)));

        // Abrir só às 11h deixaria a reserva das 10h de fora.
        atualizar(admin, recurso, "{\"nome\":\"Sala Edição\",\"tipo\":\"SALA\",\"horarioAbertura\":\"11:00\"}")
                .andExpect(status().isConflict());

        // Mudanças que ainda comportam a reserva, ou que não mexem no funcionamento, passam.
        atualizar(admin, recurso, "{\"nome\":\"Sala Edição\",\"tipo\":\"SALA\",\"horarioFechamento\":\"20:00\"}")
                .andExpect(status().isOk());
        atualizar(admin, recurso, "{\"nome\":\"Sala Renomeada\",\"tipo\":\"SALA\",\"horarioFechamento\":\"20:00\","
                + "\"descricao\":\"Nova descrição\"}").andExpect(status().isOk());
    }

    @Test
    void reduzirCapacidadeDoCoworkingAbaixoDasReservasSimultaneasERecusado() throws Exception {
        String admin = tokenAdmin();
        String recurso = idDe(criar(admin, "{\"nome\":\"Coworking " + sufixo() + "\",\"tipo\":\"COWORKING\","
                + "\"capacidade\":3}").andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        LocalDate dia = proximoDiaUtil(46);
        reservarSala(token(novoProfissional()), recurso, dia, "10:00", "11:00").andExpect(status().isCreated());
        reservarSala(token(novoProfissional()), recurso, dia, "10:00", "11:00").andExpect(status().isCreated());

        atualizar(admin, recurso, "{\"nome\":\"Coworking\",\"tipo\":\"COWORKING\",\"capacidade\":1}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(containsString("capacidade")));
        atualizar(admin, recurso, "{\"nome\":\"Coworking\",\"tipo\":\"COWORKING\",\"capacidade\":2}")
                .andExpect(status().isOk());
    }

    @Test
    void reduzirOPrazoMaximoDoEquipamentoComEmprestimoMarcadoERecusado() throws Exception {
        String admin = tokenAdmin();
        String profissional = token(novoProfissional());
        String patrimonio = "HUB-Q" + sufixo();
        String recurso = idDe(criar(admin, "{\"nome\":\"Nível " + sufixo() + "\",\"tipo\":\"EQUIPAMENTO\","
                + "\"patrimonio\":\"" + patrimonio + "\",\"prazoMaxDias\":2}")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        LocalDate retirada = proximoDiaUtil(47);
        while (retirada.getDayOfWeek().getValue() > DayOfWeek.WEDNESDAY.getValue()) {
            retirada = retirada.plusDays(1); // segunda a quarta: a devolução, no dia seguinte, também é dia útil
        }
        LocalDate devolucao = retirada.plusDays(1);
        mvc.perform(post("/reservas").header("Authorization", "Bearer " + profissional)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"recursoId\":\"" + recurso + "\",\"tipo\":\"equipamento\",\"dataInicio\":\""
                                + retirada + "T08:30:00\",\"dataFim\":\"" + devolucao + "T17:00:00\","
                                + "\"finalidade\":\"Levantamento\",\"termoAceito\":true}"))
                .andExpect(status().isCreated());

        atualizar(admin, recurso, "{\"nome\":\"Nível\",\"tipo\":\"EQUIPAMENTO\",\"patrimonio\":\"" + patrimonio
                + "\",\"prazoMaxDias\":1}").andExpect(status().isConflict());
    }

    // ---------- helpers ----------

    private ResultActions perfil(String token) throws Exception {
        return mvc.perform(get("/auth/me").header("Authorization", "Bearer " + token));
    }

    private ResultActions criar(String token, String corpo) throws Exception {
        return mvc.perform(post("/admin/recursos").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions atualizar(String token, String id, String corpo) throws Exception {
        return mvc.perform(put("/admin/recursos/" + id).header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions reservarSala(String token, String recursoId, LocalDate dia, String inicio, String fim)
            throws Exception {
        return mvc.perform(post("/reservas").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"recursoId\":\"" + recursoId + "\",\"dataInicio\":\"" + dia + "T" + inicio
                        + ":00\",\"dataFim\":\"" + dia + "T" + fim + ":00\",\"finalidade\":\"Estudo\"}"));
    }

    private String idDe(String corpo) throws Exception {
        return json.readTree(corpo).get("id").asText();
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
