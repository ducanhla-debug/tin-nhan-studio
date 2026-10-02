import test from 'node:test'
import assert from 'node:assert/strict'
import { canvasSize, wrapLines } from '../src/renderer.js'

test('kích thước ảnh xuất đúng tỷ lệ 9:16', () => {
  assert.deepEqual(canvasSize, { width: 1080, height: 1920 })
  assert.equal(canvasSize.width / canvasSize.height, 9 / 16)
})

test('nội dung dài được ngắt thành nhiều dòng', () => {
  const ctx = { measureText: (text) => ({ width: text.length * 10 }) }
  const lines = wrapLines(ctx, 'Một đoạn tin nhắn khá dài cần được xuống dòng', 100)
  assert.ok(lines.length > 2)
  assert.equal(lines.join(' '), 'Một đoạn tin nhắn khá dài cần được xuống dòng')
})

test('xuống dòng thủ công được giữ lại', () => {
  const ctx = { measureText: (text) => ({ width: text.length * 8 }) }
  assert.deepEqual(wrapLines(ctx, 'Dòng một\nDòng hai', 300), ['Dòng một', 'Dòng hai'])
})
