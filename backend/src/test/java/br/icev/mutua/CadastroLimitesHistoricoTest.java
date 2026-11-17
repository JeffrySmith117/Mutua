package br.icev.mutua;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import br.icev.mutua.common.Relogio;
import br.icev.mutua.reserva.Reserva;
import br.icev.mutua.reserva.ReservaRepository;
import br.icev.mutua.reserva.StatusReserva;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

/** Regras do relatório de QA: CPF (D12), enumeração de contas (D13), limites da reserva (D15) e histórico (D17). */
class CadastroLimitesHistoricoTest extends IntegracaoBase {

    private static final String SALA = "Sala de Reuniões Executiva A";

    @Autowired
    private ReservaRepository reservas;

    @Test
    void cadastroRecusaCpfComDigitosVerificadoresErrados() throws Exception {
        cadastrar(novoEmail(), "111.111.111-11").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("cpf")); // CT09
        cadastrar(novoEmail(), "123.456.789-00").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("cpf"));
        cadastrar(novoEmail(), cpfAleatorio()).andExpect(status().isCreated());
    }

    @Test
    void cadastroPublicoNaoDizSeFoiOEmailOuOCpfQueJaExiste() throws Exception {
        String email = novoEmail();
        String cpf = cpfAleatorio();
        cadastrar(email, cpf).andExpect(status().isCreated());

        String porEmail = cadastrar(email, cpfAleatorio()).andExpect(status().isConflict())
                .andExpect(jsonPath("$.validationErrors").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        String porCpf = cadastrar(novoEmail(), cpf).andExpect(status().isConflict())
                .andExpect(jsonPath("$.validationErrors").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        assertThat(json.readTree(porEmail).get("message").asText())
                .isEqualTo(json.readTree(porCpf).get("message").asText())
                .doesNotContainIgnoringCase("e-mail já")
                .doesNotContainIgnoringCase("CPF");
    }

    @Test
    void reservaRespeitaAntecedenciaMaximaEDuracaoMinima() throws Exception {
        String token = token(novoProfissional());
        String sala = idPorNome(token, "/ambientes", SALA);

        reservar(token, sala, diaUtil(120), "09:00", "10:00").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("dataInicio"));
        // O limite conta a partir do instante atual, não só da data: 90 dias e algumas horas à frente é recusado.
        Relogio.fixar(diaUtil(10).atTime(8, 0));
        reservar(token, sala, diaUtil(10).plusDays(90), "09:00", "10:00").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("dataInicio"));
        Relogio.restaurar();
        reservar(token, sala, diaUtil(75), "09:00", "09:10").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("dataFim"));
    }

    @Test
    void profissionalNaoAcumulaMaisReservasAtivasQueOLimite() throws Exception {
        String token = token(novoProfissional());
        String sala = idPorNome(token, "/ambientes", SALA);
        LocalDate dia = diaUtil(76);
        LocalTime inicio = LocalTime.of(8, 0);
        for (int i = 0; i < 10; i++) {
            reservar(token, sala, dia, inicio.plusMinutes(30L * i).toString(),
                    inicio.plusMinutes(30L * (i + 1)).toString()).andExpect(status().isCreated());
        }
        reservar(token, sala, dia, "13:30", "14:00").andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("reservas ativas")));
    }

    @Test
    void historicoSeparaNaoComparecimentoDeCancelamentoEInformaOTotal() throws Exception {
        String token = token(novoProfissional());
        String admin = tokenAdmin();
        String sala = idPorNome(token, "/ambientes", SALA);
        String id = json.readTree(reservar(token, sala, diaUtil(77), "15:00", "16:00")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();

        Reserva faltosa = reservas.findById(UUID.fromString(id)).orElseThrow();
        faltosa.mudarPara(StatusReserva.NAO_COMPARECEU);
        reservas.saveAndFlush(faltosa);

        String protocolo = faltosa.getProtocolo();
        mvc.perform(get("/admin/historico?status=nao_compareceu&busca=" + protocolo)
                        .header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Total-Count", "1"))
                .andExpect(jsonPath("$[0].status").value("nao_compareceu")); // CT12
        mvc.perform(get("/admin/historico?status=cancelada&busca=" + protocolo)
                        .header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Total-Count", "0"));

        mvc.perform(get("/admin/historico?tamanho=1").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/admin/historico?tamanho=500").header("Authorization", "Bearer " + admin))
                .andExpect(status().isBadRequest());
    }

    // ---------- helpers ----------

    private ResultActions cadastrar(String email, String cpf) throws Exception {
        String corpo = "{\"nome\":\"Profissional Teste\",\"email\":\"" + email + "\",\"senha\":\"senhaSegura123\","
                + "\"confirmarSenha\":\"senhaSegura123\",\"cpf\":\"" + cpf + "\",\"registroCrea\":\"CREA-PI 1/D\"}";
        return mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions reservar(String token, String sala, LocalDate dia, String inicio, String fim)
            throws Exception {
        String corpo = "{\"recursoId\":\"" + sala + "\",\"dataInicio\":\"" + dia + "T" + inicio + ":00\","
                + "\"dataFim\":\"" + dia + "T" + fim + ":00\",\"finalidade\":\"Reunião de teste\"}";
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
