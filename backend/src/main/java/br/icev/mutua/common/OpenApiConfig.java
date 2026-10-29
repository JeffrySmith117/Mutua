package br.icev.mutua.common;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String ESQUEMA_JWT = "jwt";

    /** Habilita o botão "Authorize" do Swagger: cole o token devolvido por /auth/login. */
    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info().title("Mútua-PI — API de Reservas").version("0.1.0")
                        .description("Reservas de ambientes e empréstimo de equipamentos do Crea Tec HUB."))
                .components(new Components().addSecuritySchemes(ESQUEMA_JWT,
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_JWT));
    }
}
