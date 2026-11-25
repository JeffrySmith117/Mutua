export default function Marca({ compacta = false }: { compacta?: boolean }) {
  if (compacta) return <div className="marca-sigra marca-compacta">
    <img src={`${import.meta.env.BASE_URL}mutua-favicon.png`} width="32" height="32" alt="Mútua Tec HUB" />
  </div>
  return <div className="marca-sigra">
    <img src={`${import.meta.env.BASE_URL}mutua-oficial.png`} width="291" height="73"
      alt="Mútua — Caixa de Assistência dos Profissionais do Crea" />
    <strong>Mútua Tec HUB</strong>
  </div>
}
