package br.icev.mutua.common;

public final class Lgpd {

    private Lgpd() {
    }

    /** "123.456.789-00" vira "***.456.789-**". */
    public static String mascararCpf(String cpfFormatado) {
        if (cpfFormatado == null || cpfFormatado.length() != 14) {
            return "***.***.***-**";
        }
        return "***." + cpfFormatado.substring(4, 11) + "-**";
    }
}
