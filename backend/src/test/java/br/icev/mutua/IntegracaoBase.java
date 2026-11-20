package br.icev.mutua;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.UUID;

import br.icev.mutua.common.Relogio;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Base dos testes de integração: um PostgreSQL real embutido (sem Docker), pois a regra de conflito depende da
 * exclusion constraint do banco. O banco e o contexto Spring são compartilhados entre as classes de teste, então
 * cada teste cria os próprios dados (e-mails, recursos e horários únicos).
 */
@SpringBootTest
@AutoConfigureMockMvc
abstract class IntegracaoBase {

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

    /** Testes que fixam o relógio do sistema não vazam o horário para os demais. */
    @AfterEach
    void restaurarRelogio() {
        Relogio.restaurar();
    }

    @Autowired
    protected MockMvc mvc;

    @Autowired
    protected ObjectMapper json;

    /** Cadastra um profissional novo e devolve o par e-mail/senha. */
    protected String[] novoProfissional() throws Exception {
        String email = novoEmail();
        mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON)
                .content(corpoCadastro(email, "senhaSegura123"))).andExpect(status().isCreated());
        return new String[] {email, "senhaSegura123"};
    }

    protected String token(String[] credenciais) throws Exception {
        return login(credenciais[0], credenciais[1]);
    }

    protected String tokenAdmin() throws Exception {
        return login("admin@mutua-pi.com.br", "admin123");
    }

    protected String login(String email, String senha) throws Exception {
        String corpo = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(corpo).get("token").asText();
    }

    protected String corpoCadastro(String email, String senha) {
        return "{\"nome\":\"Profissional Teste\",\"email\":\"" + email + "\",\"senha\":\"" + senha
                + "\",\"confirmarSenha\":\"" + senha + "\",\"cpf\":\"" + cpfAleatorio()
                + "\",\"registroCrea\":\"CREA-PI 1234/D\"}";
    }

    /** CPF aleatório com dígitos verificadores corretos. */
    protected String cpfAleatorio() {
        String base = String.format("%09d", Math.abs(UUID.randomUUID().getMostSignificantBits() % 1_000_000_000L));
        if (base.chars().distinct().count() == 1) {
            base = "123456789";
        }
        base += digitoVerificador(base);
        return base + digitoVerificador(base);
    }

    private static int digitoVerificador(String digitos) {
        int soma = 0;
        for (int i = 0; i < digitos.length(); i++) {
            soma += (digitos.charAt(i) - '0') * (digitos.length() + 1 - i);
        }
        int resto = (soma * 10) % 11;
        return resto == 10 ? 0 : resto;
    }

    protected String novoEmail() {
        return "teste-" + UUID.randomUUID() + "@exemplo.com";
    }
}
