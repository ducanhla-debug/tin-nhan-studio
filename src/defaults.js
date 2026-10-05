export const platformLabels = {
  messenger: 'Messenger',
  zalo: 'Zalo',
  imessage: 'Tin nhắn',
}

export const modeLabels = {
  full: 'Toàn bộ',
  focus: 'Làm nổi bật',
  preview: 'Xem trước',
}

export const seedMessages = [
  { id: 'm1', sender: 'them', type: 'text', text: 'Hôm nay của bạn thế nào?', time: '21:20', reaction: '' },
  { id: 'm2', sender: 'me', type: 'text', text: 'Khá ổn, chỉ hơi bận một chút thôi.', time: '21:21', reaction: '❤️' },
  { id: 'm3', sender: 'them', type: 'text', text: 'Nhớ nghỉ ngơi nhé. Mai mình đi cà phê không?', time: '21:22', reaction: '' },
  { id: 'm4', sender: 'me', type: 'text', text: 'Được đó, 9 giờ chỗ cũ nha ☕', time: '21:23', reaction: '👍' },
  { id: 'm5', sender: 'them', type: 'text', text: 'Chốt vậy nhé, mai gặp!', time: '21:24', reaction: '' },
]

export const initialState = {
  platform: 'messenger',
  messageService: 'imessage',
  captureEndId: '',
  deliveryState: 'none',
  mode: 'full',
  name: 'Minh Anh',
  avatar: '',
  activity: 'Không hiển thị',
  time: '21:25',
  carrier: '5G',
  signal: 4,
  wifi: true,
  battery: 79,
  appearance: 'light',
  keyboard: false,
  format: 'png',
  messages: seedMessages,
  selectedId: 'm3',
}

export const statusPresets = [
  { label: 'Mặc định', time: '09:41', carrier: '5G', signal: 4, wifi: true, battery: 100, appearance: 'light' },
  { label: 'Hằng ngày', time: '21:25', carrier: '5G', signal: 4, wifi: false, battery: 79, appearance: 'light' },
  { label: 'Đêm khuya', time: '23:48', carrier: 'Wi‑Fi', signal: 3, wifi: true, battery: 20, appearance: 'dark' },
  { label: 'Mạng yếu', time: '16:12', carrier: '4G', signal: 1, wifi: false, battery: 50, appearance: 'light' },
]

export function createMessage(sender = 'them') {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender,
    type: 'text',
    text: 'Tin nhắn mới',
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    reaction: '',
    image: '',
  }
}
