/** Data local (não UTC) no formato YYYY-MM-DD, com deslocamento opcional em dias. */
export function dataLocal(diasAFrente = 0): string {
  const data = new Date()
  data.setDate(data.getDate() + diasAFrente)
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}
