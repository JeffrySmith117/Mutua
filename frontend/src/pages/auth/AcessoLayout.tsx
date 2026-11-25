import type { ReactNode } from 'react'
import Marca from '../../components/Marca'

export default function AcessoLayout({ children, tituloId }: { children: ReactNode; tituloId: string }) {
  return <main className="login-sigra">
    <aside className="login-institucional">
      <Marca />
      <div className="login-apresentacao">
        <p>Espaços e equipamentos para sua prática profissional.</p>
        <span>Reserve ambientes e solicite equipamentos disponibilizados pela Mútua-PI.</span>
      </div>
      <small>Mútua-PI · Teresina</small>
    </aside>
    <section className="login-area" aria-labelledby={tituloId}>{children}</section>
  </main>
}
