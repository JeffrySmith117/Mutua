package br.icev.mutua;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

class LoginSegurancaTest extends IntegracaoBase {

    @Test
    void bloqueiaOLoginAposVariasSenhasErradasMesmoComASenhaCerta() throws Exception {
        String[] alvo = novoProfissional();
        for (int i = 0; i < 5; i++) {
            tentar(alvo[0], "errada" + i).andExpect(status().isUnauthorized());
        }

        tentar(alvo[0], alvo[1]).andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Muitas tentativas")));

        // Outra conta, do mesmo IP, continua entrando normalmente.
        login(novoProfissional()[0], "senhaSegura123");
    }

    @Test
    void loginCorretoNaoContaComoFalhaELimpaAsFalhasDaConta() throws Exception {
        String[] conta = novoProfissional();
        for (int i = 0; i < 4; i++) {
            tentar(conta[0], "errada").andExpect(status().isUnauthorized());
        }
        tentar(conta[0], conta[1]).andExpect(status().isOk());

        // O acerto zerou a contagem: mais 4 erros ainda não bloqueiam.
        for (int i = 0; i < 4; i++) {
            tentar(conta[0], "errada").andExpect(status().isUnauthorized());
        }
        tentar(conta[0], conta[1]).andExpect(status().isOk());
    }

    @Test
    void healthEPublicoEOutrosEndpointsDoActuatorNao() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
        mvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
    }

    private ResultActions tentar(String email, String senha) throws Exception {
        return mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}"));
    }
}
