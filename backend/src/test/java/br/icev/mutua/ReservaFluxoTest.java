package br.icev.mutua;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import br.icev.mutua.common.Relogio;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** Fluxo completo contra um PostgreSQL real (embutido), incluindo a exclusion constraint. */
@SpringBootTest
@AutoConfigureMockMvc
class ReservaFluxoTest {

    private static final EmbeddedPostgres POSTGRES;

    static {
        try {
            POSTGRES = EmbeddedPostgres.builder().start();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @DynamicPropertySource
    static void banco(DynamicPropertyRegistry registro) {
        registro.add("spring.datasource.url", () -> POSTGRES.getJdbcUrl("postgres", "postgres"));
        registro.add("spring.datasource.username", () -> "postgres");
        registro.add("spring.datasource.password", () -> "postgres");
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    // ---------- auth ----------

    @Test
    void cadastroELoginRetornamTokenEPerfilProfissional() throws Exception {
        String email = novoEmail();
        mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro(email, "senhaSegura123")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfil").value("PROFISSIONAL"))
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.mensagem").value("Cadastro realizado com sucesso."));

        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"senha\":\"senhaSegura123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.usuario.perfil").value("PROFISSIONAL"));

        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"senha\":\"errada\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void rotasProtegidasExigemTokenEPerfil() throws Exception {
        mvc.perform(get("/ambientes")).andExpect(status().isUnauthorized());

        String profissional = token(novoProfissional());
        mvc.perform(get("/admin/metricas").header("Authorization", "Bearer " + profissional))
                .andExpect(status().isForbidden());
        mvc.perform(get("/admin/metricas").header("Authorization", "Bearer " + tokenAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taxaOcupacaoSalas", notNullValue()));
    }

    // ---------- conflito de horário ----------

    @Test
    void sobreposicaoRetorna409EHorarioAdjacenteECancelamentoLiberam() throws Exception {
        String token = token(novoProfissional());
        String sala = idPorNome(token, "/ambientes", "Sala de Reuniões Executiva A");
        LocalDate dia = proximoDiaUtil(10);

        String primeira = criar(token, sala, dia, "10:00", "11:00").andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMADA")).andReturn().getResponse().getContentAsString();

        criar(token, sala, dia, "10:30", "11:30").andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.validationErrors[0].field").value("dataInicio"));

        // [início, fim): 11h-12h encosta na reserva das 10h-11h e não colide.
        criar(token, sala, dia, "11:00", "12:00").andExpect(status().isCreated());

        String idPrimeira = json.readTree(primeira).get("id").asText();
        mvc.perform(patch("/reservas/" + idPrimeira + "/cancelar").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Adiado.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA"));

        criar(token, sala, dia, "10:00", "11:00").andExpect(status().isCreated());
    }

    @Test
    void requisicoesSimultaneasParaOMesmoHorarioGeramUmaUnicaReserva() throws Exception {
        String token = token(novoProfissional());
        String sala = idPorNome(token, "/ambientes", "Sala de Reuniões Executiva A");
        LocalDate dia = proximoDiaUtil(11);
        int tentativas = 8;

        ExecutorService pool = Executors.newFixedThreadPool(tentativas);
        CountDownLatch largada = new CountDownLatch(1);
        List<Future<Integer>> resultados = new ArrayList<>();
        for (int i = 0; i < tentativas; i++) {
            resultados.add(pool.submit(() -> {
                largada.await();
                return criar(token, sala, dia, "14:00", "15:00").andReturn().getResponse().getStatus();
            }));
        }
        largada.countDown();
        List<Integer> codigos = new ArrayList<>();
        for (Future<Integer> f : resultados) {
            codigos.add(f.get());
        }
        pool.shutdown();

        assertThat(codigos.stream().filter(c -> c == 201).count()).isEqualTo(1);
        assertThat(codigos.stream().filter(c -> c == 409).count()).isEqualTo(tentativas - 1);
    }

    @Test
    void auditorioNasceComoPendenteEBloqueiaOHorarioAteSerRecusado() throws Exception {
        String token = token(novoProfissional());
        String outro = token(novoProfissional());
        String admin = tokenAdmin();
        String auditorio = idPorNome(token, "/ambientes", "Auditório Master Cláudio Portella");
        LocalDate dia = proximoDiaUtil(12);

        String corpo = criar(token, auditorio, dia, "09:00", "12:00").andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDENTE")).andReturn().getResponse().getContentAsString();
        String id = json.readTree(corpo).get("id").asText();

        criar(outro, auditorio, dia, "10:00", "11:00").andExpect(status().isConflict());

        mvc.perform(post("/admin/pendencias/" + id + "/recusar").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/admin/pendencias/" + id + "/recusar").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Solenidade oficial.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("recusada"));

        criar(outro, auditorio, dia, "10:00", "11:00").andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDENTE"));
    }

    @Test
    void coworkingAceitaVariasReservasSimultaneas() throws Exception {
        String a = token(novoProfissional());
        String b = token(novoProfissional());
        String coworking = idPorNome(a, "/ambientes", "Espaço Coworking Compartilhado");
        LocalDate dia = proximoDiaUtil(13);

        criar(a, coworking, dia, "09:00", "12:00").andExpect(status().isCreated());
        criar(b, coworking, dia, "09:00", "12:00").andExpect(status().isCreated());

        mvc.perform(get("/ambientes/" + coworking + "/disponibilidade?data=" + dia)
                        .header("Authorization", "Bearer " + a))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intervalosOcupados", hasSize(0)));
    }

    @Test
    void disponibilidadeEscondeOMotivoDeReservasAlheias() throws Exception {
        String dono = token(novoProfissional());
        String outro = token(novoProfissional());
        String sala = idPorNome(dono, "/ambientes", "Sala de Reuniões Executiva A");
        LocalDate dia = proximoDiaUtil(14);
        criar(dono, sala, dia, "08:00", "09:00").andExpect(status().isCreated());

        mvc.perform(get("/ambientes/" + sala + "/disponibilidade?data=" + dia)
                        .header("Authorization", "Bearer " + dono))
                .andExpect(jsonPath("$.intervalosOcupados[0].inicio").value("08:00:00"))
                .andExpect(jsonPath("$.intervalosOcupados[0].motivo").value("Reunião de teste"));
        mvc.perform(get("/ambientes/" + sala + "/disponibilidade?data=" + dia)
                        .header("Authorization", "Bearer " + outro))
                .andExpect(jsonPath("$.intervalosOcupados[0].motivo").value("Reservado"));
    }

    @Test
    void foraDoHorarioDeFuncionamentoERetornado400() throws Exception {
        String token = token(novoProfissional());
        String sala = idPorNome(token, "/ambientes", "Sala de Reuniões Executiva A");
        criar(token, sala, proximoDiaUtil(15), "19:00", "20:00").andExpect(status().isBadRequest());
    }

    // ---------- equipamento: solicitação, despacho, balcão e histórico ----------

    @Test
    void equipamentoPercorreTodoOCicloEFicaNoHistorico() throws Exception {
        String token = token(novoProfissional());
        String admin = tokenAdmin();
        String drone = idPorNome(token, "/equipamentos", "Drone DJI Phantom 4 RTK");
        LocalDate retirada = proximoDiaUtil(20);

        // Sem o termo aceito, a solicitação é recusada.
        mvc.perform(post("/reservas").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoEquipamento(drone, retirada, false)))
                .andExpect(status().isBadRequest());

        String corpo = mvc.perform(post("/reservas").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoEquipamento(drone, retirada, true)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.protocolo").value(org.hamcrest.Matchers.startsWith("HUB-")))
                .andReturn().getResponse().getContentAsString();
        String id = json.readTree(corpo).get("id").asText();

        mvc.perform(post("/admin/pendencias/" + id + "/aprovar").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"observacao\":\"Aprovado.\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("aprovada"));

        mvc.perform(post("/admin/movimentacoes/" + id + "/retirar").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"condicao\":\"otimo\",\"observacao\":\"Retirado.\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.statusMovimentacao").value("em_campo"));

        mvc.perform(get("/equipamentos/" + drone).header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.status").value("EM_CAMPO"));

        mvc.perform(post("/admin/movimentacoes/" + id + "/devolver").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"condicao\":\"bom\",\"observacao\":\"Ok.\",\"itensConferidos\":[\"Aeronave\",\"Controle\"]}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.statusMovimentacao").value("devolvido"));

        mvc.perform(get("/admin/historico?status=concluida&tipo=equipamento&busca=HUB-0042")
                        .header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].protocolo").value(json.readTree(corpo).get("protocolo").asText()))
                .andExpect(jsonPath("$[0].cpfMascarado").value(org.hamcrest.Matchers.startsWith("***.")))
                .andExpect(jsonPath("$[0].dadosBalcao.itensConferidos", hasSize(2)))
                .andExpect(jsonPath("$[0].linhaDoTempo", hasSize(4)));

        // Reserva concluída não pode mais ser cancelada.
        mvc.perform(delete("/reservas/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict());
    }

    @Test
    void usuarioNaoOperaReservaDeOutro() throws Exception {
        String dono = token(novoProfissional());
        String intruso = token(novoProfissional());
        String sala = idPorNome(dono, "/ambientes", "Sala de Reuniões Executiva A");
        String corpo = criar(dono, sala, proximoDiaUtil(16), "13:00", "14:00").andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id = json.readTree(corpo).get("id").asText();

        mvc.perform(delete("/reservas/" + id).header("Authorization", "Bearer " + intruso))
                .andExpect(status().isForbidden());
        mvc.perform(get("/reservas/minhas").header("Authorization", "Bearer " + dono))
                .andExpect(jsonPath("$[0].podeCancelar", is(true)))
                .andExpect(jsonPath("$[0].tipo").value("ambiente"));
    }

    // ---------- helpers ----------

    private ResultActions criar(String token, String recursoId, LocalDate dia, String inicio, String fim)
            throws Exception {
        String corpo = "{\"recursoId\":\"" + recursoId + "\",\"dataInicio\":\"" + dia + "T" + inicio + ":00\","
                + "\"dataFim\":\"" + dia + "T" + fim + ":00\",\"finalidade\":\"Reunião de teste\"}";
        return mvc.perform(post("/reservas").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private String corpoEquipamento(String id, LocalDate retirada, boolean termo) {
        return "{\"recursoId\":\"" + id + "\",\"tipo\":\"equipamento\",\"dataInicio\":\"" + retirada
                + "T08:30:00\",\"dataFim\":\"" + retirada.plusDays(2) + "T17:00:00\","
                + "\"finalidade\":\"Levantamento planialtimétrico.\","
                + "\"documentoVinculado\":\"ART: PI2026008491 • SISANT: 412850-BR\",\"termoAceito\":" + termo + "}";
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

    /** Cadastra um profissional novo e devolve o par e-mail/senha. */
    private String[] novoProfissional() throws Exception {
        String email = novoEmail();
        mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON)
                .content(corpoCadastro(email, "senhaSegura123"))).andExpect(status().isCreated());
        return new String[] {email, "senhaSegura123"};
    }

    private String token(String[] credenciais) throws Exception {
        return login(credenciais[0], credenciais[1]);
    }

    private String tokenAdmin() throws Exception {
        return login("admin@mutua-pi.com.br", "admin123");
    }

    private String login(String email, String senha) throws Exception {
        String corpo = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(corpo).get("token").asText();
    }

    private String corpoCadastro(String email, String senha) {
        long cpf = Math.abs(UUID.randomUUID().getMostSignificantBits() % 100_000_000_000L);
        return "{\"nome\":\"Profissional Teste\",\"email\":\"" + email + "\",\"senha\":\"" + senha
                + "\",\"confirmarSenha\":\"" + senha + "\",\"cpf\":\"" + String.format("%011d", cpf)
                + "\",\"registroCrea\":\"CREA-PI 1234/D\"}";
    }

    private String novoEmail() {
        return "teste-" + UUID.randomUUID() + "@exemplo.com";
    }

    /** Primeiro dia útil a partir de hoje + deslocamento. Cada teste usa um deslocamento próprio. */
    private LocalDate proximoDiaUtil(int deslocamentoDias) {
        LocalDate dia = LocalDate.now(Relogio.FUSO).plusDays(deslocamentoDias);
        while (dia.getDayOfWeek() == DayOfWeek.SATURDAY || dia.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dia = dia.plusDays(1);
        }
        return dia;
    }
}
