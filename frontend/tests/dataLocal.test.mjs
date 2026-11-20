import assert from 'node:assert/strict'
import test from 'node:test'
import { proximaDataDeFuncionamento } from '../node_modules/.cache/sigra-tests/dataLocal.js'

test('sugere segunda-feira para recursos que fecham no fim de semana', () => {
  assert.equal(proximaDataDeFuncionamento([1, 2, 3, 4, 5], new Date('2026-11-20T15:00:00Z')), '2026-11-23')
})

test('respeita o expediente configurado e o fuso da operação', () => {
  assert.equal(proximaDataDeFuncionamento([6], new Date('2026-11-21T01:00:00Z')), '2026-11-21')
})
