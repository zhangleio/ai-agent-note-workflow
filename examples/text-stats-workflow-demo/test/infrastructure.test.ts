import assert from 'node:assert/strict'
import test from 'node:test'

test('test infrastructure is available', () => {
  assert.equal(typeof test, 'function')
})