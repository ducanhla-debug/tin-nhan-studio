# Tài liệu bàn giao — Tin Nhắn Studio

> Cập nhật: 05/10/2026 · Trạng thái: MVP đã chạy production

## 1. Thông tin nhanh

- **Tên sản phẩm:** Tin Nhắn Studio
- **Mục tiêu:** Webtool tiếng Việt để dựng và xuất ảnh hội thoại mô phỏng trên iPhone 14 Pro/Dynamic Island.
- **Website production:** https://ducanhla-debug.github.io/tin-nhan-studio/
- **Repository:** https://github.com/ducanhla-debug/tin-nhan-studio
- **Thư mục cục bộ:** `C:\Users\X1 CarBon G8\OneDrive\Documents\ChatGPT\AHC\tin-nhan-studio`
- **Stack:** React 19, Vite 8, JavaScript, CSS thuần, Canvas 2D, Lucide React.
- **Backend:** Không có. Toàn bộ dữ liệu và quá trình dựng ảnh chạy trong trình duyệt.
- **Lưu dữ liệu:** `localStorage`, khóa `tin-nhan-studio-v1`.
- **Kích thước ảnh xuất:** 1080 × 1920 px, tỷ lệ 9:16.

## 2. Yêu cầu sản phẩm đã được chốt

### Nền tảng hội thoại

1. Messenger.
2. Zalo.
3. Tin nhắn iPhone.

### Chế độ ảnh

1. **Toàn bộ:** hiển thị toàn bộ phần hội thoại vừa với màn hình.
2. **Làm nổi bật:** làm mờ phần xung quanh, giữ rõ tin nhắn được chọn và hiển thị thanh cảm xúc/menu thao tác.
3. **Xem trước:** mô phỏng thẻ xem trước Haptic Touch/3D Touch với các thao tác nhanh phía dưới.

### Thiết bị và định dạng

- Phong cách iPhone 14 Pro có Dynamic Island.
- Ảnh dọc 1080 × 1920.
- PNG mặc định, JPG tùy chọn.
- Không thêm watermark hoặc nhãn “Nội dung mô phỏng”.
- Cho phép hiện/ẩn bàn phím iPhone.

### Nội dung có thể chỉnh

- Tên người trò chuyện và ảnh đại diện.
- Trạng thái hoạt động.
- Tin nhắn văn bản hoặc hình ảnh.
- Người gửi: “Người kia” hoặc “Bạn”.
- Thời gian và cảm xúc của từng tin nhắn.
- Thêm, sửa, xóa và thay đổi thứ tự tin nhắn.
- Thời gian hệ thống, pin, số vạch sóng, Wi‑Fi, 4G/5G, giao diện sáng/tối.
- Quick Pick: Mặc định, Hằng ngày, Đêm khuya và Mạng yếu.

### Trải nghiệm sử dụng

- Xem trước trực tiếp trong khung iPhone.
- Tự lưu trên trình duyệt, không cần tài khoản.
- Sử dụng tốt trên máy tính và điện thoại.
- Nội dung và hình ảnh người dùng không được gửi đến máy chủ.

## 3. Kiến trúc mã nguồn

```text
tin-nhan-studio/
├─ .github/workflows/deploy.yml   # Build, test và deploy GitHub Pages
├─ docs/design-concept.png        # Mẫu thiết kế tham chiếu
├─ public/favicon.svg             # Biểu tượng trang
├─ src/
│  ├─ App.jsx                     # State, localStorage, upload, export/copy ảnh
│  ├─ components.jsx              # Header, bảng thiết lập, bảng chỉnh sửa
│  ├─ defaults.js                 # Dữ liệu mẫu, nhãn, preset, factory tin nhắn
│  ├─ main.jsx                    # React entry point
│  ├─ renderer.js                 # Bộ dựng Canvas 1080 × 1920
│  └─ styles.css                  # Design system và responsive
├─ tests/
│  ├─ defaults.test.js            # Kiểm tra dữ liệu/preset
│  └─ renderer.test.js            # Kiểm tra tỷ lệ và ngắt dòng
├─ index.html
├─ package.json
├─ pnpm-lock.yaml
└─ vite.config.js
```

## 4. Luồng dữ liệu

```text
Người dùng thay đổi form
        ↓
React state trong App.jsx
        ↓
Lưu JSON vào localStorage
        ↓
renderToCanvas(canvas, state)
        ↓
Canvas 1080 × 1920
        ↓
Xem trước thu nhỏ / xuất PNG hoặc JPG
```

State chính có cấu trúc gần như sau:

```js
{
  platform: 'messenger' | 'zalo' | 'imessage',
  mode: 'full' | 'focus' | 'preview',
  name: string,
  avatar: string,             // Data URL
  activity: string,
  time: string,
  carrier: string,
  signal: number,             // 1..4
  wifi: boolean,
  battery: number,            // 1..100
  appearance: 'light' | 'dark',
  keyboard: boolean,
  format: 'png' | 'jpg',
  selectedId: string,
  messages: Array<{
    id: string,
    sender: 'me' | 'them',
    type: 'text' | 'image',
    text: string,
    image?: string,           // Data URL
    time: string,
    reaction: string
  }>
}
```

## 5. Bộ dựng ảnh Canvas

`src/renderer.js` là phần quan trọng nhất.

- `renderToCanvas()` là cổng vào chung.
- `renderFull()` dựng giao diện hội thoại đầy đủ.
- `renderFocus()` dựng một canvas nền, blur nền, sau đó chép lại vùng tin nhắn được chọn và vẽ menu.
- `renderPreview()` dựng ảnh nền blur, thẻ xem trước và danh sách thao tác nhanh.
- `drawStatusBar()` dựng thời gian, sóng, mạng, pin và Dynamic Island.
- `drawMessages()` tính layout rồi vẽ bong bóng, avatar, thời gian và cảm xúc.
- `canvasToBlob()` chuyển canvas thành PNG/JPG.

Nguyên tắc cần giữ:

- Thuộc tính thật của canvas luôn là `1080 × 1920`; chỉ CSS mới thu nhỏ bản xem trước.
- Không dựng ảnh xuất từ screenshot DOM vì sẽ phụ thuộc độ phân giải màn hình.
- Ảnh tải lên phải được chuyển thành Data URL để Canvas có thể vẽ và localStorage có thể lưu.
- Khi thay đổi renderer, luôn kiểm tra cả ba mode và cả light/dark.

## 6. Design system

- Bảng điều khiển: nền trắng thật `#ffffff`.
- Canvas làm việc: xanh than/charcoal.
- Màu nhấn chính: `#0b74f6`.
- Bán kính control: khoảng 8–12 px.
- Typography: system font, ưu tiên `-apple-system`, sau đó `Segoe UI`.
- Desktop: ba cột — thiết lập / bản xem trước / chỉnh sửa và xuất.
- Mobile: bản xem trước lên trước, các bảng điều khiển xếp dọc phía dưới.

Mẫu tham chiếu nằm tại `docs/design-concept.png`. Không được thay toàn bộ UI bằng landing page; đây phải là công cụ biên tập thực tế.

## 7. Chạy và kiểm thử

Yêu cầu Node.js hiện đại và pnpm.

```bash
pnpm install
pnpm dev
```

Đóng gói và kiểm thử:

```bash
pnpm test
pnpm build
```

Kết quả bàn giao gần nhất:

- 6/6 unit tests đạt.
- Build production đạt.
- Không có lỗi console trên localhost và production.
- Thêm tin nhắn làm số dòng tăng từ 5 lên 6.
- Ảnh tải xuống đã được đọc trực tiếp và xác nhận đúng 1080 × 1920.
- Viewport 390 × 844 không có tràn ngang.
- GitHub Pages workflow chạy thành công sau khi Pages được bật bằng GitHub Actions.

### Checklist kiểm thử thủ công bắt buộc

1. Mở trang và xác nhận Canvas không trắng.
2. Đổi lần lượt Messenger, Zalo, Tin nhắn.
3. Đổi lần lượt Toàn bộ, Làm nổi bật, Xem trước.
4. Sửa tên, trạng thái, nội dung và thời gian.
5. Thêm rồi xóa một tin nhắn.
6. Đổi người gửi và thứ tự tin nhắn.
7. Tải avatar và ảnh tin nhắn.
8. Bật bàn phím, dark mode và từng Quick Pick.
9. Xuất cả PNG và JPG.
10. Đọc kích thước file PNG để xác nhận 1080 × 1920.
11. Kiểm tra desktop và viewport mobile khoảng 390 px.
12. Kiểm tra console không có error/warning liên quan ứng dụng.

## 8. Triển khai

Workflow: `.github/workflows/deploy.yml`.

Mỗi lần push lên nhánh `main`, GitHub Actions sẽ:

1. Cài pnpm và Node.
2. Cài dependencies theo lockfile.
3. Chạy test.
4. Build Vite.
5. Upload thư mục `dist`.
6. Deploy GitHub Pages.

Vite đang dùng `base: './'`, phù hợp với project page `/tin-nhan-studio/`.

## 9. Hạn chế và nợ kỹ thuật hiện tại

Đây là MVP hoàn chỉnh để thử nghiệm, nhưng chưa phải bản sao pixel-perfect của từng ứng dụng thật.

1. Cập nhật 05/10/2026: header/composer riêng cho ba nền tảng, Zalo header xanh và tin gửi xanh nhạt; Messages dùng contact control kiểu iOS 26, không có avatar bên bong bóng. Icon tự vẽ bằng path; chưa phải bản sao pixel-perfect và có thể khác các đợt rollout của ứng dụng.
2. Đã có chọn nhanh iMessage xanh dương / SMS xanh lá. Thời gian Messenger/Messages nhóm theo khoảng cách trên 5 phút, Zalo đặt trong bong bóng. Focus giữ tin được chọn, menu tự tránh đáy và không sao chép một mảng nền sắc nét quanh tin.
3. Icon “grip” trong danh sách mới là dấu hiệu trực quan; sắp xếp thực tế dùng nút lên/xuống, chưa có drag-and-drop.
4. Data URL của nhiều ảnh lớn có thể vượt giới hạn `localStorage` của trình duyệt.
5. Tin nhắn dài được tự động bỏ bớt các tin đầu để vừa ảnh; chưa có thanh chọn chính xác đoạn hội thoại cần chụp.
6. Chưa hỗ trợ video, audio, voice note, link preview, reply quote, sticker thật, trạng thái đã xem/đã gửi chi tiết hoặc nhóm chat.
7. Bàn phím là bản mô phỏng tĩnh, chưa có nhiều layout tiếng Việt/số/emoji.
8. Tên thương hiệu và hình thức UI chỉ mang tính mô phỏng; không sử dụng asset/logo chính thức của nền tảng.
9. Chưa có E2E tests được commit vào repository; lần bàn giao trước dùng Playwright bên ngoài repo để kiểm thử trình duyệt và file tải xuống.
10. Dependencies đang khai báo `latest`; nên pin phiên bản trước khi phát triển dài hạn.

## 10. Thứ tự cải tiến đề xuất

### P0 — Độ chân thực

- Header/composer đã có nhánh riêng; tiếp tục đối chiếu ảnh chụp thật theo phiên bản ứng dụng.
- Đối chiếu khoảng cách, font, icon, màu, trạng thái đã xem với từng ứng dụng trên iPhone 14 Pro.
- Tùy chọn iMessage/SMS đã hoàn thành.

### P1 — Điều khiển ảnh

- Cho phép chọn tin nhắn bắt đầu/kết thúc hoặc kéo vùng hội thoại muốn chụp.
- Thêm mức blur, vị trí menu cảm xúc và kiểu menu Haptic Touch.
- Thêm preset iOS 16/17/18 nếu cần.

### P1 — Nội dung chat

- Reply quote, link preview, sticker, voice note, cuộc gọi nhỡ, đã xem và nhóm chat.
- Kéo thả sắp xếp tin nhắn.
- Sao chép/nhân bản tin nhắn.

### P2 — Độ bền dữ liệu

- Chuyển ảnh từ localStorage sang IndexedDB.
- Export/import dự án dưới dạng JSON.
- Tự nén ảnh tải lên trước khi lưu.

### P2 — QA và bảo trì

- Pin dependency versions.
- Thêm Playwright E2E vào repo và GitHub Actions.
- Thêm visual regression cho ba nền tảng × ba chế độ × sáng/tối.

## 11. Quy tắc khi AI khác sửa tiếp

1. Đọc toàn bộ `AI_HANDOVER.md`, `PROMPT_FOR_NEXT_AI.md`, `README.md` và các file trong `src/` trước khi sửa.
2. Không tự ý thêm watermark.
3. Không đổi mục tiêu sang landing page hoặc thêm backend khi chưa được yêu cầu.
4. Không làm ảnh xuất phụ thuộc kích thước viewport.
5. Giữ dữ liệu ở máy người dùng trừ khi có yêu cầu rõ ràng khác.
6. Không xóa hoặc ghi đè thay đổi không liên quan trong worktree.
7. Sau mỗi thay đổi phải chạy `pnpm test`, `pnpm build` và kiểm thử giao diện thật.
8. Với thay đổi renderer, phải tải một ảnh thật và xác minh header PNG là 1080 × 1920.
9. Kiểm tra production sau khi GitHub Actions hoàn tất, không chỉ dựa vào build cục bộ.
10. Ghi lại thay đổi, test đã chạy, rủi ro còn lại và URL production trong câu trả lời bàn giao.

## 12. Tiêu chí hoàn thành cho lần phát triển tiếp theo

Một thay đổi chỉ được xem là hoàn tất khi:

- Tính năng hoạt động trên giao diện thật, không phải control giả.
- Bản xem trước và file tải xuống cùng phản ánh thay đổi.
- Không có lỗi console liên quan.
- Không có tràn ngang trên mobile.
- Unit tests và production build đạt.
- File ảnh xuất vẫn đúng 1080 × 1920.
- GitHub Pages triển khai thành công và URL production mở được.
