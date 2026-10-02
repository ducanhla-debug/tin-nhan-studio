import test from 'node:test'
import assert from 'node:assert/strict'
import { createMessage, initialState, statusPresets } from '../src/defaults.js'

test('dữ liệu mẫu có đủ ba nền tảng và tin nhắn được chọn', () => {
  assert.equal(initialState.platform, 'messenger')
  assert.ok(initialState.messages.length >= 5)
  assert.ok(initialState.messages.some((message) => message.id === initialState.selectedId))
})

test('tin nhắn mới có cấu trúc hợp lệ', () => {
  const message = createMessage('me')
  assert.equal(message.sender, 'me')
  assert.equal(message.type, 'text')
  assert.match(message.time, /^\d{2}:\d{2}$/)
  assert.ok(message.id.startsWith('m-'))
})

test('quick pick trạng thái luôn nằm trong giới hạn hợp lệ', () => {
  assert.equal(statusPresets.length, 4)
  for (const preset of statusPresets) {
    assert.ok(preset.battery >= 1 && preset.battery <= 100)
    assert.ok(preset.signal >= 1 && preset.signal <= 4)
    assert.match(preset.time, /^\d{2}:\d{2}$/)
  }
})
