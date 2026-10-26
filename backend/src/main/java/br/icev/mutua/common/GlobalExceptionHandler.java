package br.icev.mutua.common;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErroResposta> aoLancarApiException(ApiException ex, HttpServletRequest req) {
        return resposta(ex.getStatus(), ex.getMessage(), req, ex.getErros());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> aoValidar(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<ErroResposta.CampoInvalido> erros = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new ErroResposta.CampoInvalido(e.getField(), e.getDefaultMessage()))
                .toList();
        return resposta(HttpStatus.BAD_REQUEST, "Há campos inválidos na requisição.", req, erros);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErroResposta> aoReceberRequisicaoMalFormada(Exception ex, HttpServletRequest req) {
        return resposta(HttpStatus.BAD_REQUEST, "Requisição mal formatada ou com parâmetros inválidos.", req, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResposta> aoViolarIntegridade(DataIntegrityViolationException ex,
                                                            HttpServletRequest req) {
        String detalhe = ex.getMostSpecificCause().getMessage();
        if (detalhe != null && detalhe.contains("reserva_sem_sobreposicao")) {
            // A exclusion constraint do banco venceu uma disputa de requisições simultâneas.
            return resposta(HttpStatus.CONFLICT,
                    "O recurso já possui uma reserva ativa para o horário selecionado.", req,
                    List.of(new ErroResposta.CampoInvalido("dataInicio",
                            "Horário sobreposto a uma reserva existente.")));
        }
        log.warn("Violação de integridade: {}", detalhe);
        return resposta(HttpStatus.CONFLICT, "A operação viola uma regra de integridade dos dados.", req, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResposta> aoNegarAcesso(AccessDeniedException ex, HttpServletRequest req) {
        return resposta(HttpStatus.FORBIDDEN, "Seu perfil não tem permissão para esta operação.", req, null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErroResposta> aoUsarMetodoNaoSuportado(HttpRequestMethodNotSupportedException ex,
                                                                 HttpServletRequest req) {
        return resposta(HttpStatus.METHOD_NOT_ALLOWED, "Método HTTP não suportado nesta rota.", req, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResposta> aoNaoEncontrarRota(NoResourceFoundException ex, HttpServletRequest req) {
        return resposta(HttpStatus.NOT_FOUND, "Rota não encontrada.", req, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> aoFalharInesperadamente(Exception ex, HttpServletRequest req) {
        log.error("Erro inesperado em {}", req.getRequestURI(), ex);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor.", req, null);
    }

    private ResponseEntity<ErroResposta> resposta(HttpStatus status, String mensagem, HttpServletRequest req,
                                                  List<ErroResposta.CampoInvalido> erros) {
        return ResponseEntity.status(status)
                .body(ErroResposta.de(status, mensagem, req.getRequestURI(), erros));
    }
}
