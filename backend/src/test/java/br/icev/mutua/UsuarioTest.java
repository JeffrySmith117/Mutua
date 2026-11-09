package br.icev.mutua;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

/** Criação de contas pelo admin e troca de senha. */
class UsuarioTest extends IntegracaoBase {

    @Test
    void profissionalNaoCriaUsuarios() throws Exception {
        String profissional = token(novoProfissional());
        criar(profissional, novoUsuarioJson(novoEmail(), "ADMIN")).andExpect(status().isForbidden());
    }

    @Test
    void adminCriaOutroAdminQueAcessaOPainel() throws Exception {
        String email = novoEmail();
        criar(tokenAdmin(), novoUsuarioJson(email, "ADMIN")).andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfil").value("ADMIN"))
                .andExpect(jsonPath("$.email").value(email));

        String tokenNovo = login(email, "senhaSegura123");
        mvc.perform(get("/admin/metricas").header("Authorization", "Bearer " + tokenNovo))
                .andExpect(status().isOk());
    }

    @Test
    void adminTambemPodeCriarProfissional() throws Exception {
        criar(tokenAdmin(), novoUsuarioJson(novoEmail(), "PROFISSIONAL")).andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfil").value("PROFISSIONAL"));
    }

    @Test
    void rejeitaEmailRepetidoCpfInvalidoEPerfilAusente() throws Exception {
        String admin = tokenAdmin();
        String email = novoEmail();
        criar(admin, novoUsuarioJson(email, "ADMIN")).andExpect(status().isCreated());

        criar(admin, novoUsuarioJson(email, "ADMIN")).andExpect(status().isConflict())
                .andExpect(jsonPath("$.validationErrors[0].field").value("email"));

        criar(admin, "{\"nome\":\"X\",\"email\":\"" + novoEmail() + "\",\"senha\":\"senhaSegura123\","
                + "\"cpf\":\"123\",\"perfil\":\"ADMIN\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("cpf"));

        criar(admin, "{\"nome\":\"X\",\"email\":\"" + novoEmail() + "\",\"senha\":\"senhaSegura123\","
                + "\"cpf\":\"" + cpfAleatorio() + "\"}").andExpect(status().isBadRequest());
    }

    @Test
    void trocaDeSenhaFuncionaERejeitaSenhaAtualErradaOuRepetida() throws Exception {
        String[] credenciais = novoProfissional();
        String token = token(credenciais);

        trocarSenha(token, "errada", "outraSenha123").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("senhaAtual"));
        trocarSenha(token, "senhaSegura123", "senhaSegura123").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("novaSenha"));
        trocarSenha(token, "senhaSegura123", "curta").andExpect(status().isBadRequest());

        trocarSenha(token, "senhaSegura123", "novaSenha456").andExpect(status().isNoContent());

        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + credenciais[0] + "\",\"senha\":\"senhaSegura123\"}"))
                .andExpect(status().isUnauthorized());
        login(credenciais[0], "novaSenha456");
    }

    @Test
    void trocaDeSenhaExigeAutenticacao() throws Exception {
        mvc.perform(patch("/auth/senha").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"senhaAtual\":\"a\",\"novaSenha\":\"novaSenha456\"}"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- helpers ----------

    private ResultActions criar(String token, String corpo) throws Exception {
        return mvc.perform(post("/admin/usuarios").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions trocarSenha(String token, String atual, String nova) throws Exception {
        return mvc.perform(patch("/auth/senha").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"senhaAtual\":\"" + atual + "\",\"novaSenha\":\"" + nova + "\"}"));
    }

    private String novoUsuarioJson(String email, String perfil) {
        return "{\"nome\":\"Usuário Teste\",\"email\":\"" + email + "\",\"senha\":\"senhaSegura123\","
                + "\"cpf\":\"" + cpfAleatorio() + "\",\"registroCrea\":\"CREA-PI 99/D\",\"perfil\":\"" + perfil
                + "\"}";
    }

    private String cpfAleatorio() {
        long cpf = Math.abs(UUID.randomUUID().getMostSignificantBits() % 100_000_000_000L);
        return String.format("%011d", cpf);
    }
}
