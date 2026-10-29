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
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(expiracao)))
                .signWith(chave)
                .compact();
    }

    /** Devolve o id do usuário dono do token, ou vazio se o token for inválido ou estiver expirado. */
    public Optional<UUID> validar(String token) {
        try {
            String sujeito = Jwts.parser().verifyWith(chave).build()
                    .parseSignedClaims(token).getPayload().getSubject();
            return Optional.of(UUID.fromString(sujeito));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
