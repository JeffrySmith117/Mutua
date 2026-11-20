import type { ReactNode } from 'react'
import Marca from '../../components/Marca'

export default function AcessoLayout({ children, tituloId }: { children: ReactNode; tituloId: string }) {
  return <main className="login-sigra">
    <aside className="login-institucional">
      <Marca />
      <p>Sistema Integrado de Gestão de Reservas e Ativos</p>
      <small>Mútua-PI · Teresina</small>
    </aside>
    <section className="login-area" aria-labelledby={tituloId}>{children}</section>
  </main>
}
