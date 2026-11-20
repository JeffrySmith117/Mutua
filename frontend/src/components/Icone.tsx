const caminhos = {
  painel: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  ambiente: 'M4 21V5l8-3 8 3v16 M2 21h20 M9 21v-5h6v5 M8 8h.01 M16 8h.01 M8 12h.01 M16 12h.01',
  equipamento: 'm12 3 9 5v8l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v8',
  calendario: 'M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2z M7 3v4 M17 3v4 M3 10h18',
  admin: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  busca: 'M15.9 15.9 21 21 M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  seta: 'M4 12h16 M14 6l6 6-6 6',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  fechar: 'M6 6l12 12 M18 6 6 18',
  lua: 'M20 15A9 9 0 0 1 9 4a8 8 0 1 0 11 11z',
  sol: 'M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l2 2 M17 17l2 2 M19 5l-2 2 M7 17l-2 2 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  recolher: 'M3 4h18v16H3z M9 4v16',
  olho: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
} as const

export type NomeIcone = keyof typeof caminhos

export default function Icone({ nome }: { nome: NomeIcone }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d={caminhos[nome]} />
  </svg>
}
