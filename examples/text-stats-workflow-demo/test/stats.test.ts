import assert from 'node:assert/strict'
import test from 'node:test'

import { countText } from '../src/stats.js'

test('counts empty text as zero', () => {
  assert.deepEqual(countText(''), { lines: 0, words: 0, characters: 0 })
})

test('counts Unicode whitespace tokens and code points', () => {
  assert.deepEqual(countText('hello\t世界 😀\n'), {
    lines: 1,
    words: 3,
    characters: 11,
  })
})

test('counts logical LF lines without adding one for a final separator', () => {
  assert.deepEqual(countText('first\n\nthird\n'), {
    lines: 3,
    words: 2,
    characters: 13,
  })
})

test('counts CRLF as one line separator and two characters', () => {
  assert.deepEqual(countText('one\r\ntwo\r\n'), {
    lines: 2,
    words: 2,
    characters: 10,
  })
})

test('does not linguistically segment continuous Chinese text', () => {
  assert.equal(countText('你好世界').words, 1)
  assert.equal(countText('你好 世界').words, 2)
})