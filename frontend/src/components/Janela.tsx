import { useEffect, useRef, type ReactNode } from 'react'

export default function Janela({ children, fechar, titulo, className, focoInicial }: {
  children: ReactNode
  fechar: () => void
  titulo: string
  className?: string
  focoInicial?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const janela = ref.current
    janela?.showModal()
    if (focoInicial) janela?.querySelector<HTMLElement>(focoInicial)?.focus()
    return () => janela?.close()
  }, [focoInicial])

  return <dialog ref={ref} className={`janela ${className ?? ''}`} aria-label={titulo}
    onCancel={event => { event.preventDefault(); fechar() }}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const area = event.currentTarget.getBoundingClientRect()
      if (event.clientX < area.left || event.clientX > area.right ||
          event.clientY < area.top || event.clientY > area.bottom) fechar()
    }}>
    {children}
  </dialog>
}
