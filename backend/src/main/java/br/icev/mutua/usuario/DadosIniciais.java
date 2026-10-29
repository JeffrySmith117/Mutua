package br.icev.mutua.usuario;

import br.icev.mutua.common.Relogio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Cria o administrador inicial quando o banco ainda não tem nenhum (a senha precisa de hash BCrypt). */
@Component
public class DadosIniciais implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DadosIniciais.class);

    static final int TAMANHO_MINIMO_SENHA_EM_PRODUCAO = 12;

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final Environment ambiente;
    private final String email;
    private final String senha;

    public DadosIniciais(UsuarioRepository usuarios, PasswordEncoder encoder, Environment ambiente,
                         @Value("${mutua.admin.email}") String email,
                         @Value("${mutua.admin.senha}") String senha) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.ambiente = ambiente;
        this.email = email;
        this.senha = senha;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (usuarios.existsByPerfil(Perfil.ADMIN)) {
            return;
        }
        if (ambiente.acceptsProfiles(Profiles.of("prod")) && senha.length() < TAMANHO_MINIMO_SENHA_EM_PRODUCAO) {
            throw new IllegalStateException("Em produção, ADMIN_SENHA deve ter ao menos "
                    + TAMANHO_MINIMO_SENHA_EM_PRODUCAO + " caracteres.");
        }
        Usuario admin = new Usuario();
        admin.setNome("Administrador Mútua-PI");
        admin.setEmail(email.toLowerCase());
        admin.setSenhaHash(encoder.encode(senha));
        admin.setCpf("000.000.000-00");
        admin.setPerfil(Perfil.ADMIN);
        admin.setCriadoEm(Relogio.agora());
        usuarios.save(admin);
        log.warn("Administrador inicial '{}' criado. Altere a senha padrão antes de ir para produção.", email);
    }
}
