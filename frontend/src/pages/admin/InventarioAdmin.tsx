import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Janela from '../../components/Janela'
import { adminService, type DadosRecurso, type RecursoInventario, type TipoRecursoInventario } from '../../services/adminService'
import { linkRecurso } from '../../services/consultas'
import { extrairMensagemErro } from '../../utils/erroApi'

const tipos = { COWORKING: 'Coworking', SALA: 'Sala', AUDITORIO: 'Auditório', EQUIPAMENTO: 'Equipamento' }
const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function InventarioAdmin({ itens, carregando, chave }: {
  itens: RecursoInventario[]
  carregando: boolean
  chave: readonly unknown[]
}) {
  const [editor, setEditor] = useState<{ tipo: TipoRecursoInventario; recurso?: RecursoInventario }>()
  const [alteracao, setAlteracao] = useState<RecursoInventario>()
  const [pendente, setPendente] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const client = useQueryClient()

  async function atualizar(recurso: RecursoInventario, texto: string) {
    client.setQueryData<RecursoInventario[]>(chave, lista =>
      [...(lista ?? []).filter(item => item.id !== recurso.id), recurso]
        .sort((a, b) => a.tipo.localeCompare(b.tipo) || a.nome.localeCompare(b.nome, 'pt-BR')))
    setMensagem(texto)
    await Promise.all([
      client.invalidateQueries({ queryKey: chave }),
      client.invalidateQueries({ queryKey: ['ambientes'] }),
      client.invalidateQueries({ queryKey: ['equipamentos'] }),
      client.invalidateQueries({ queryKey: ['disponibilidade'] }),
    ])
  }

  async function confirmarStatus(recurso: RecursoInventario) {
    if (pendente) return
    setPendente(true)
    setErro('')
    setMensagem('')
    try {
      const atualizado = await adminService.definirRecursoAtivo(recurso.id, !recurso.ativo)
      await atualizar(atualizado, atualizado.ativo ? 'Recurso ativado.' : 'Recurso desativado.')
      setAlteracao(undefined)
    } catch (falha) {
      setErro(extrairMensagemErro(falha, 'Não foi possível alterar a situação do recurso.'))
    } finally {
      setPendente(false)
    }
  }

  return <section className="admin-conteudo-aba" aria-label="Inventário">
    <div className="inventario-acoes">
      <button type="button" className="btn btn-primario" onClick={() => setEditor({ tipo: 'SALA' })}>Adicionar espaço</button>
      <button type="button" className="btn btn-secundario" onClick={() => setEditor({ tipo: 'EQUIPAMENTO' })}>Adicionar equipamento</button>
    </div>
    {mensagem && <p className="inventario-mensagem" role="status">{mensagem}</p>}
    {carregando && <p role="status">Carregando inventário…</p>}
    {!carregando && itens.length === 0 && <p>Nenhum recurso cadastrado.</p>}
    <div className="inventario-grid-cards">
      {itens.map(item => <article className="inventario-card" key={item.id}>
        <div className="inventario-card-topo">
          <span className="inventario-tipo-tag">{tipos[item.tipo]}</span>
          <span className={item.ativo ? 'badge-inventario-livre' : 'inventario-tipo-tag'}>{item.ativo ? 'Ativo' : 'Inativo'}</span>
        </div>
        <h3 className="inventario-nome">{item.nome}</h3>
        {(item.patrimonio || item.localizacao) && <p className="inventario-detalhes">{item.patrimonio || item.localizacao}</p>}
        <div className="inventario-acoes">
          <button type="button" className="btn btn-secundario" aria-label={`Editar ${item.nome}`}
            onClick={() => setEditor({ tipo: item.tipo, recurso: item })}>Editar</button>
          <button type="button" className="btn btn-secundario" aria-label={`${item.ativo ? 'Desativar' : 'Ativar'} ${item.nome}`}
            onClick={() => { setErro(''); setAlteracao(item) }}>{item.ativo ? 'Desativar' : 'Ativar'}</button>
        </div>
        {item.ativo && <Link className="inventario-horarios" to={linkRecurso(item.tipo === 'EQUIPAMENTO' ? 'equipamentos' : 'ambientes', item.id)}>Ver horários</Link>}
      </article>)}
    </div>
    {editor && <EditorRecurso tipoInicial={editor.tipo} recurso={editor.recurso} fechar={() => setEditor(undefined)}
      salvar={async dados => {
        setMensagem('')
        const recurso = editor.recurso
          ? await adminService.atualizarRecurso(editor.recurso.id, dados)
          : await adminService.criarRecurso(dados)
        await atualizar(recurso, editor.recurso ? 'Alterações salvas.' : 'Recurso cadastrado.')
        setEditor(undefined)
      }} />}
    {alteracao && <Janela titulo={alteracao.ativo ? 'Desativar recurso' : 'Ativar recurso'}
      fechar={() => { if (!pendente) setAlteracao(undefined) }}>
      <h2>{alteracao.ativo ? 'Desativar' : 'Ativar'} {alteracao.nome}?</h2>
      <p>{alteracao.ativo ? 'O recurso será retirado do catálogo de reservas.' : 'O recurso voltará ao catálogo de reservas.'}</p>
      {erro && <p className="erro-sigra" role="alert">{erro}</p>}
      <div className="inventario-acoes">
        <button type="button" className="btn btn-secundario" disabled={pendente} onClick={() => setAlteracao(undefined)}>Cancelar</button>
        <button type="button" className="btn btn-primario" disabled={pendente}
          onClick={() => void confirmarStatus(alteracao)}>{pendente ? 'Atualizando…' : 'Confirmar'}</button>
      </div>
    </Janela>}
  </section>
}

function EditorRecurso({ tipoInicial, recurso, fechar, salvar }: {
  tipoInicial: TipoRecursoInventario
  recurso?: RecursoInventario
  fechar: () => void
  salvar: (dados: DadosRecurso) => Promise<void>
}) {
  const [tipo, setTipo] = useState(tipoInicial)
  const [pendente, setPendente] = useState(false)
  const [erro, setErro] = useState('')
  const equipamento = tipo === 'EQUIPAMENTO'
  const titulo = recurso ? 'Editar recurso' : equipamento ? 'Adicionar equipamento' : 'Adicionar espaço'

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pendente) return
    const dados = new FormData(event.currentTarget)
    const texto = (campo: string) => String(dados.get(campo) ?? '').trim()
    const lista = (campo: string) => texto(campo).split(/\r?\n/).map(item => item.trim()).filter(Boolean)
    const nome = texto('nome')
    const horarioAbertura = texto('horarioAbertura')
    const horarioFechamento = texto('horarioFechamento')
    const dias = dados.getAll('diasSemana').map(Number)
    if (!nome || (equipamento && !texto('patrimonio'))) {
      setErro(equipamento ? 'Informe o nome e o patrimônio.' : 'Informe o nome.')
      return
    }
    if (horarioFechamento <= horarioAbertura || dias.length === 0) {
      setErro(dias.length === 0 ? 'Selecione pelo menos um dia de funcionamento.' : 'O horário de fechamento deve ser posterior ao de abertura.')
      return
    }
    setErro('')
    setPendente(true)
    try {
      await salvar({
        tipo, nome, horarioAbertura, horarioFechamento, diasSemana: dias,
        localizacao: texto('localizacao'), descricao: texto('descricao'),
        exigeAprovacao: dados.has('aprovacao'),
        ...(equipamento ? {
          patrimonio: texto('patrimonio'), categoria: texto('categoria'),
          prazoMaxDias: Number(texto('prazoMaxDias')), exigeArtSisant: dados.has('art'),
          especificacoes: lista('detalhes'), capacidade: recurso?.capacidade,
          recursosDisponiveis: recurso?.recursosDisponiveis,
        } : {
          capacidade: Number(texto('capacidade')), recursosDisponiveis: lista('detalhes'),
          categoria: recurso?.categoria ?? undefined, prazoMaxDias: recurso?.prazoMaxDias,
          especificacoes: recurso?.especificacoes,
        }),
      })
    } catch (falha) {
      setErro(extrairMensagemErro(falha, 'Não foi possível salvar o recurso.'))
    } finally {
      setPendente(false)
    }
  }

  return <Janela titulo={titulo} focoInicial="#inventario-nome" fechar={() => { if (!pendente) fechar() }}>
    <div className="janela-topo"><h2>{titulo}</h2></div>
    <form className="formulario-recurso" onSubmit={enviar} aria-busy={pendente}>
      <label>Nome<input id="inventario-nome" className="controle-campo" name="nome" required maxLength={150} defaultValue={recurso?.nome} /></label>
      <div className="grade-formulario">
        <label>Tipo<select className="controle-campo" value={tipo} disabled={Boolean(recurso) || equipamento}
          onChange={event => setTipo(event.target.value as TipoRecursoInventario)}>
          {Object.entries(tipos).filter(([valor]) => equipamento === (valor === 'EQUIPAMENTO'))
            .map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
        </select></label>
        <label>{equipamento ? 'Patrimônio' : 'Capacidade'}
          {equipamento
            ? <input className="controle-campo" name="patrimonio" required maxLength={50} defaultValue={recurso?.patrimonio ?? ''} />
            : <input className="controle-campo" name="capacidade" type="number" min={1} max={2147483647} required defaultValue={recurso?.capacidade ?? 1} />}
        </label>
        <label>Localização<input className="controle-campo" name="localizacao" maxLength={150} defaultValue={recurso?.localizacao ?? ''} /></label>
        {equipamento && <label>Categoria<input className="controle-campo" name="categoria" maxLength={100} defaultValue={recurso?.categoria ?? ''} /></label>}
        {equipamento && <label>Prazo máximo em dias<input className="controle-campo" name="prazoMaxDias" type="number" min={1}
          max={2147483647} required defaultValue={recurso?.prazoMaxDias ?? 1} /></label>}
      </div>
      <label>Descrição<textarea className="controle-campo" name="descricao" rows={2} defaultValue={recurso?.descricao ?? ''} /></label>
      <div className="grade-formulario">
        <label>Abertura<input className="controle-campo" name="horarioAbertura" type="time" step={1} required defaultValue={recurso?.horarioAbertura ?? '08:00'} /></label>
        <label>Fechamento<input className="controle-campo" name="horarioFechamento" type="time" step={1} required defaultValue={recurso?.horarioFechamento ?? '18:00'} /></label>
      </div>
      <fieldset className="inventario-dias">
        <legend>Dias de funcionamento</legend>
        <div>
          {diasSemana.map((dia, i) => <label className="aceite-recurso" key={dia}>
            <input type="checkbox" name="diasSemana" value={i + 1} defaultChecked={recurso ? recurso.diasSemana.includes(i + 1) : i < 5} />{dia}
          </label>)}
        </div>
      </fieldset>
      <label>{equipamento ? 'Especificações' : 'Recursos disponíveis'} (um por linha)
        <textarea className="controle-campo" name="detalhes" rows={3}
          defaultValue={(equipamento ? recurso?.especificacoes : recurso?.recursosDisponiveis)?.join('\n')} />
      </label>
      <label className="aceite-recurso"><input type="checkbox" name="aprovacao" defaultChecked={recurso?.exigeAprovacao} />Exige aprovação administrativa</label>
      {equipamento && <label className="aceite-recurso"><input type="checkbox" name="art" defaultChecked={recurso?.exigeArtSisant} />Exige ART ou cadastro SISANT, quando aplicável</label>}
      {erro && <p className="erro-sigra" role="alert">{erro}</p>}
      <div className="inventario-acoes">
        <button type="button" className="btn btn-secundario" onClick={fechar} disabled={pendente}>Cancelar</button>
        <button type="submit" className="btn btn-primario" disabled={pendente}>{pendente ? 'Salvando…' : 'Salvar recurso'}</button>
      </div>
    </form>
  </Janela>
}
