import { useQuery } from '@tanstack/react-query'
import { consultarDisponibilidade } from '../services/disponibilidadeService'

export default function Disponibilidade({ catalogo, id, data, titulo = 'Disponibilidade' }: {
  catalogo: 'ambientes' | 'equipamentos'
  id: string
  data: string
  titulo?: string
}) {
  const consulta = useQuery({
    queryKey: ['disponibilidade', catalogo, id, data],
    queryFn: ({ signal }) => consultarDisponibilidade(catalogo, id, data, signal),
    enabled: Boolean(data),
    staleTime: 0,
  })
  if (!data) return null
  return (
    <section className="consulta-disponibilidade" aria-label={titulo}>
      <strong>{titulo}</strong>
      {consulta.isPending && <p role="status">Consultando horários…</p>}
      {consulta.isError && <p role="alert">Não foi possível consultar. <button type="button" onClick={() => void consulta.refetch()}>Tentar novamente</button></p>}
      {consulta.data && (
        <div aria-live="polite">
          {consulta.data.horarioAbertura && consulta.data.horarioFechamento &&
            <p>Funcionamento: {consulta.data.horarioAbertura.slice(0, 5)}–{consulta.data.horarioFechamento.slice(0, 5)}</p>}
          {consulta.data.intervalosOcupados.length === 0 ? <p>Nenhum intervalo ocupado informado para a data.</p> :
            <>
              <p>Intervalos ocupados</p>
              <ul>{consulta.data.intervalosOcupados.map(({ inicio, fim }, index) =>
                <li key={index}>{inicio.slice(0, 5)}–{fim.slice(0, 5)}</li>)}</ul>
            </>}
        </div>
      )}
    </section>
  )
}
