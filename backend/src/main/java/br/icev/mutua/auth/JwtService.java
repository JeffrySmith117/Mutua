package br.icev.mutua.auth;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.SecretKey;

import br.icev.mutua.usuario.Usuario;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey chave;
    private final Duration expiracao;

    /** Prefixo do segredo de desenvolvimento do application.yml, proibido no perfil prod. */
    static final String SEGREDO_DE_DESENVOLVIMENTO = "troque-este-segredo";

    private static final String CLAIM_SESSAO = "sv";

    /** Usuário dono do token e a versão de sessão com que ele foi emitido (tokens antigos, sem versão, valem 0). */
    public record TokenValido(UUID usuarioId, long sessaoVersao) {
    }

    public JwtService(@Value("${mutua.jwt.secret}") String segredo,
                      @Value("${mutua.jwt.expiracao-horas}") long horas, Environment ambiente) {
        byte[] bytes = segredo.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("mutua.jwt.secret precisa ter ao menos 32 caracteres.");
        }
        if (ambiente.acceptsProfiles(Profiles.of("prod")) && segredo.startsWith(SEGREDO_DE_DESENVOLVIMENTO)) {
            throw new IllegalStateException("Em produção, defina JWT_SECRET com um valor próprio e secreto.");
        }
        this.chave = Keys.hmacShaKeyFor(bytes);
        this.expiracao = Duration.ofHours(horas);
    }

    public String gerar(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getId().toString())
                .claim("perfil", usuario.getPerfil().name())
                .claim(CLAIM_SESSAO, usuario.getSessaoVersao())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(expiracao)))
                .signWith(chave)
                .compact();
    }

    /** Devolve o dono e a versão de sessão do token, ou vazio se ele for inválido ou estiver expirado. */
    public Optional<TokenValido> validar(String token) {
        try {
            var carga = Jwts.parser().verifyWith(chave).build().parseSignedClaims(token).getPayload();
            Object versao = carga.get(CLAIM_SESSAO);
            return Optional.of(new TokenValido(UUID.fromString(carga.getSubject()),
                    versao instanceof Number n ? n.longValue() : 0L));
        } catch (JwtException | IllegalArgumentException | ClassCastException e) {
            return Optional.empty();
        }
    }
}
