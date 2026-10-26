package br.icev.mutua.recurso;

import java.time.LocalTime;
import java.util.List;

/** Texto legível do funcionamento, ex.: "Segunda a Sexta, das 08h às 18h". */
public final class Horarios {

    private static final String[] DIAS = {"Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"};

    private Horarios() {
    }

    public static String descrever(Recurso recurso) {
        List<Integer> dias = recurso.getDiasSemana().stream().sorted().toList();
        String texto;
        if (dias.isEmpty()) {
            texto = "Sem dias definidos";
        } else if (dias.size() == 7) {
            texto = "Todos os dias";
        } else if (dias.size() >= 3 && dias.get(dias.size() - 1) - dias.get(0) == dias.size() - 1) {
            texto = DIAS[dias.get(0) - 1] + " a " + DIAS[dias.get(dias.size() - 1) - 1];
        } else {
            texto = String.join(", ", dias.stream().map(d -> DIAS[d - 1]).toList());
        }
        return texto + ", das " + hora(recurso.getHorarioAbertura()) + " às " + hora(recurso.getHorarioFechamento());
    }

    private static String hora(LocalTime hora) {
        return hora.getMinute() == 0
                ? String.format("%02dh", hora.getHour())
                : String.format("%02dh%02d", hora.getHour(), hora.getMinute());
    }
}
