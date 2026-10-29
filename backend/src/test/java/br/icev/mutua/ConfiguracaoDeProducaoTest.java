package br.icev.mutua;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import br.icev.mutua.auth.JwtService;
import br.icev.mutua.usuario.DadosIniciais;
import br.icev.mutua.usuario.Usuario;
import br.icev.mutua.usuario.UsuarioRepository;

import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** Em produção a API recusa subir com segredo ou senha de desenvolvimento. */
class ConfiguracaoDeProducaoTest {

    private static final String SEGREDO_DE_DESENVOLVIMENTO = "troque-este-segredo-em-producao-0123456789abcdef";

    private final MockEnvironment dev = new MockEnvironment();
    private final MockEnvironment prod = new MockEnvironment().withProperty("spring.profiles.active", "prod");

    ConfiguracaoDeProducaoTest() {
        prod.setActiveProfiles("prod");
    }

    @Test
    void jwtRecusaOSegredoDeDesenvolvimentoEmProducao() {
        assertThatThrownBy(() -> new JwtService(SEGREDO_DE_DESENVOLVIMENTO, 8, prod))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
    }

    @Test
    void jwtAceitaSegredoProprioEmProducaoEOPadraoEmDesenvolvimento() {
        assertThatCode(() -> new JwtService("segredo-de-verdade-bem-longo-e-aleatorio-9f3a", 8, prod))
                .doesNotThrowAnyException();
        assertThatCode(() -> new JwtService(SEGREDO_DE_DESENVOLVIMENTO, 8, dev)).doesNotThrowAnyException();
    }

    @Test
    void jwtRecusaSegredoCurtoEmQualquerPerfil() {
        assertThatThrownBy(() -> new JwtService("curto", 8, dev)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void administradorInicialRecusaSenhaFracaEmProducao() {
        UsuarioRepository usuarios = mock(UsuarioRepository.class);
        DadosIniciais dados = new DadosIniciais(usuarios, new BCryptPasswordEncoder(), prod, "admin@x.com", "admin123");

        assertThatThrownBy(() -> dados.run(new DefaultApplicationArguments()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ADMIN_SENHA");
        verify(usuarios, never()).save(any());
    }

    @Test
    void administradorInicialAceitaSenhaForteEmProducaoESenhaFracaEmDesenvolvimento() {
        UsuarioRepository emProducao = mock(UsuarioRepository.class);
        new DadosIniciais(emProducao, new BCryptPasswordEncoder(), prod, "admin@x.com", "uma-senha-bem-forte-123")
                .run(new DefaultApplicationArguments());
        verify(emProducao).save(any(Usuario.class));

        UsuarioRepository emDev = mock(UsuarioRepository.class);
        new DadosIniciais(emDev, new BCryptPasswordEncoder(), dev, "admin@x.com", "admin123")
                .run(new DefaultApplicationArguments());
        verify(emDev).save(any(Usuario.class));
        assertThat(prod.acceptsProfiles(org.springframework.core.env.Profiles.of("prod"))).isTrue();
    }
}
