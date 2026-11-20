import assert from 'node:assert/strict'
import test from 'node:test'
import { corresponde } from '../node_modules/.cache/sigra-tests/corresponde.js'

test('busca características e nomes com ou sem acentos, em qualquer ordem', () => {
  assert.equal(corresponde('  PROJETOR   reuniao ', 'Sala de Reunião', null, 'Projetor'), true)
  assert.equal(corresponde('projetor auditorio', 'Sala de Reunião', 'Projetor'), false)
})

test('busca por categoria, patrimônio e protocolo', () => {
  assert.equal(corresponde('topografia hub-0042', 'Drone', 'Topografia', 'HUB-0042'), true)
  assert.equal(corresponde('mut-2026-042', 'Coworking', 'MUT-2026-042'), true)
  assert.equal(corresponde('hub-9999', 'Drone', 'HUB-0042'), false)
})

test('aceita busca vazia e campos opcionais de recursos', () => {
  assert.equal(corresponde('   ', null, undefined), true)
  assert.equal(corresponde('wifi', null, undefined), false)
})
