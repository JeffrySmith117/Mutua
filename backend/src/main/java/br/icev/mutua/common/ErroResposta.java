package br.icev.mutua.common;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;

/** Corpo padrão de erro da API, conforme o contrato (seção 3). */
public record ErroResposta(String timestamp, int status, String error, String message, String path,
                           List<CampoInvalido> validationErrors) {

    public record CampoInvalido(String field, String message) {
    }

    public static ErroResposta de(HttpStatus status, String mensagem, String caminho, List<CampoInvalido> erros) {
        return new ErroResposta(Instant.now().toString(), status.value(), status.getReasonPhrase(), mensagem,
                caminho, erros);
    }
}
