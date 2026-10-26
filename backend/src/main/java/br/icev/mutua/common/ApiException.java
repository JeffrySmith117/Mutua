package br.icev.mutua.common;

import java.util.List;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final List<ErroResposta.CampoInvalido> erros;

    public ApiException(HttpStatus status, String mensagem) {
        this(status, mensagem, null);
    }

    public ApiException(HttpStatus status, String mensagem, List<ErroResposta.CampoInvalido> erros) {
        super(mensagem);
        this.status = status;
        this.erros = erros;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public List<ErroResposta.CampoInvalido> getErros() {
        return erros;
    }

    public static ApiException invalida(String mensagem) {
        return new ApiException(HttpStatus.BAD_REQUEST, mensagem);
    }

    public static ApiException campoInvalido(String campo, String mensagem) {
        return new ApiException(HttpStatus.BAD_REQUEST, mensagem,
                List.of(new ErroResposta.CampoInvalido(campo, mensagem)));
    }

    public static ApiException naoAutorizada(String mensagem) {
        return new ApiException(HttpStatus.UNAUTHORIZED, mensagem);
    }

    public static ApiException proibida(String mensagem) {
        return new ApiException(HttpStatus.FORBIDDEN, mensagem);
    }

    public static ApiException naoEncontrada(String mensagem) {
        return new ApiException(HttpStatus.NOT_FOUND, mensagem);
    }

    public static ApiException conflito(String mensagem) {
        return new ApiException(HttpStatus.CONFLICT, mensagem);
    }

    public static ApiException conflito(String campo, String mensagem) {
        return new ApiException(HttpStatus.CONFLICT, mensagem,
                List.of(new ErroResposta.CampoInvalido(campo, mensagem)));
    }
}
