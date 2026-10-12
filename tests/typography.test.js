import test from 'node:test'
import assert from 'node:assert/strict'
import { font, screenshotFont, typographyProfiles, typographyNote, chatTypography } from '../src/typography.js'

test('ba giao diện iOS dùng chung font hệ thống mục tiêu, không giả nhận xác nhận nhà phát hành', () => {
  assert.deepEqual(Object.keys(typographyProfiles), ['messenger', 'zalo', 'imessage'])
  for (const platform of ['messenger', 'zalo']) {
    assert.equal(typographyProfiles[platform].evidence, 'inferred')
    assert.match(typographyNote(platform), /Chưa có xác nhận/)
    assert.match(typographyNote(platform), /Inter thay thế, không phải SF Pro/)
  }
  assert.equal(font(15.5, 600), `600 15.5px ${screenshotFont}`)
})

test('cả ba nền tảng dùng chữ chat 15.5pt với chiều cao dòng riêng', () => {
  for (const platform of ['messenger', 'zalo', 'imessage']) {
    assert.equal(chatTypography[platform].size, 15.5)
  }
  assert.equal(chatTypography.messenger.lineHeight, 19)
  assert.equal(chatTypography.zalo.lineHeight, 19)
  assert.equal(chatTypography.imessage.lineHeight, 22)
})
