# Bàn giao Tin Nhắn Studio — bắt đầu ở đây

Cập nhật 12/10/2026. Trạng thái hiện hành; máy mới không cần đường dẫn, lịch sử chat hoặc tài khoản Codex trên máy cũ.

## 1. Yêu cầu đã chốt

- Repo: https://github.com/ducanhla-debug/tin-nhan-studio
- Website: https://ducanhla-debug.github.io/tin-nhan-studio/
- Webtool tiếng Việt; iPhone 14 Pro/Dynamic Island, iOS 26.
- Messenger, Zalo, Tin nhắn iPhone (iMessage xanh dương / SMS xanh lá).
- Ba mode full (phần hội thoại vừa màn hình), focus (tin rõ/nền mờ), preview (Haptic Touch). Full không phải ảnh cuộn dài vô hạn.
- PNG/JPG **736 × 1600 px**. Hai screenshot mới nhất có kích thước này; yêu cầu 9:16/1080 × 1920 trước đây đã bị thay thế.
- Tin nhắn không watermark; mẫu chuyển khoản có nhãn mô phỏng bắt buộc. Không backend/analytics; nội dung và ảnh không gửi lên server.
- Quick pick giờ/pin/sóng/Wi-Fi/4G/5G/sáng tối; trạng thái hoạt động mặc định ẩn nhưng vẫn cho chọn.
- Giữ Dynamic Island/home indicator theo yêu cầu dù không thấy trong hai ảnh mới nhất.

## 2. Đọc và chạy trên máy mới

Đọc AGENTS.md, README.md, docs/NEW_MACHINE.md, docs/platform-references.md, docs/QA.md, package.json, lockfile, workflow, src/ và tests/ trước khi sửa. PROMPT_FOR_NEXT_AI.md dùng để khởi động phiên mới.

Cần Git, Node.js 22.12+ (CI dùng Node 22), pnpm 10; không cần .env/API key/database.

    git clone https://github.com/ducanhla-debug/tin-nhan-studio.git
    cd tin-nhan-studio
    pnpm install --frozen-lockfile
    pnpm test
    pnpm build
    pnpm dev

URL local mặc định http://127.0.0.1:5173/. Giữ lockfile; dependencies đã pin theo bản hiện có, Playwright1.63.0 dùng QA. Không update tự ý. Clone công khai không cần đăng nhập; push cần quyền ghi repo, đăng nhập riêng trên máy mới.

## 3. Kiến trúc

| File | Vai trò |
| --- | --- |
| src/App.jsx | State, localStorage, upload Data URL, export/copy, buffer render, gesture |
| src/components.jsx | Editor/control; quote/date nằm trong Chi tiết hiển thị |
| src/defaults.js | Seed, nhãn, preset, createMessage |
| src/renderer.js | Canvas, layout, mode, status, hit regions, export |
| src/bankModel.js | Dữ liệu/chuẩn hóa, nhãn clamp, số tiền |
| src/bankRenderer.js | 4 phong cách tham khảo + nhãn bắt buộc lớp cuối |
| src/BankPanels.jsx | Editor chuyển khoản, vị trí/cỡ nhãn/status/export |
| src/icons.js | Icon path tự vẽ, không SF Symbols |
| src/typography.js | Apple native / Inter fallback; chờ font trước đo chữ |
| src/styles.css | Desktop ba vùng, mobile preview trước, CSS không kéo méo canvas |
| public/fonts/ | Inter 4.1 + OFL; không font Apple |
| tests/ | Unit tests Node, hiện 16 bài |
| scripts/qa-browser.mjs | QA trình duyệt portable |
| .github/workflows/deploy.yml | Install → unit tests → build → Pages |

Luồng: form → React state → localStorage + render buffer → commit canvas mới nhất → preview/canvasToBlob. Debounce 70ms, renderToken ngăn kết quả cũ ghi đè.

API hiện hành:

- canvasSize: 736 × 1600. logicalSize: 393 × (393 × 1600 / 736) pt, khoảng 854.35pt. SCALE=736/393, phóng đồng đều hai trục.
- layoutMessages(ctx,state,top,bottom): wrap/group/capture; bottom-align, clip tin đầu khi dài; focus đưa tin cũ được chọn vào viewport.
- renderToCanvas(canvas,state): chờ font/ảnh; nhánh nội bộ tên full, focus, preview.
- commitRenderedCanvas(source,target): copy pixels + hit regions.
- messageAtPoint(canvas,x,y): tọa độ logical, trả message id/null.
- statusValues(state): clamp/round pin 0..100, sóng 0..4.
- canvasToBlob(canvas,format): PNG/JPEG quality .94.

Không screenshot DOM để export; không phụ thuộc viewport/DPR. Frame điện thoại chỉ trong preview, không nằm trong file tải xuống.

## 4. State và UX

Storage key tin-nhan-studio-v1; load merge initialState với JSON cũ nếu messages là array. localStorage có quota; hiển thị chưa lưu được nếu lỗi. documentType chat/bank giữ riêng nội dung; bank merge/normalize defaults khi load. Xem docs/bank-mockups.md. Nhãn chuyển khoản luôn được renderer vẽ, không dựa vào cờ visibility trong state.

State: platform, messageService, mode, name, avatar, activity, time, carrier, signal, wifi, battery, appearance, keyboard, format, selectedId, captureEndId, deliveryState, messages.

Message: id, sender (me/them), type (text/image), text, time, reaction; optional image Data URL, dateSeparator, replyText, replyName, reactionCount. Giữ fallback cho state cũ.

- Chạm chọn tin, hold 450ms mở focus, chạm nền đóng, pointer kéo >8px hủy hold.
- captureEndId chọn tin cuối đoạn chụp; thêm tin reset captureEndId.
- deliveryState none/delivered/seen hiển thị riêng theo nền tảng.
- Sắp xếp nút lên/xuống; grip chưa kéo thả.
- Messenger quote, Zalo date pill và reaction count; quote trên các nền tảng khác chưa có đầy đủ.
- Bàn phím mô phỏng QWERTY tĩnh, không keyboard thật.

## 5. Tham chiếu và giới hạn fidelity

docs/platform-references.md ghi đặc điểm hai screenshot thật người dùng gửi. Không công khai ảnh gốc/tên/nội dung riêng tư. docs/design-concept.png chỉ chuẩn editor, không chuẩn chat. docs/examples/ là ảnh tool tạo với hội thoại giả, không phải ảnh native hoặc bằng chứng pixel-perfect.

Apple dùng font hệ thống/emoji Apple có sẵn; Windows/Android dùng Inter/emoji OS. Không phân phối SF Pro/Apple emoji. Safari iPhone 14 Pro, độ khớp từng pixel, dark/menu/blur chưa được xác minh đầy đủ. Phiên bản App Store không chứng minh mọi rollout.

## 6. QA và deploy

    pnpm test
    pnpm build
    pnpm exec playwright install chromium

Chạy pnpm dev ở terminal 1, terminal 2:

    pnpm test:e2e
    pnpm test:e2e https://ducanhla-debug.github.io/tin-nhan-studio/

Đọc docs/QA.md. CI hiện unit/build, không E2E. QA chức năng không chứng minh pixel-perfect.

Sau sửa renderer: 3 nền tảng × 3 mode × sáng/tối; keyboard/upload/crop/seen/quote/date/status/hold; desktop/mobile; decode PNG/JPG tải xuống cùng 736 × 1600. Không dùng canvas attribute/build làm bằng chứng duy nhất.

Khi người dùng yêu cầu deploy: giữ worktree unrelated, commit/push main, chờ Actions success rồi kiểm tra production. Vite base './'. Fork cần bật Settings → Pages → GitHub Actions, đổi URL owner/repo; không mặc định có quyền repo gốc.

## 7. Dữ liệu không mang theo

Repo có code/spec/test/font/config, không có state trình duyệt, avatar cá nhân, credentials, lịch sử chat AI. Domain/profile khác không tự có hội thoại. Chưa có UI export/import JSON.

Backup thủ công: DevTools → Application/Storage → Local Storage → đúng origin → copy giá trị tin-nhan-studio-v1 vào JSON riêng. Kiểm tra messages array; backup state đích trước ghi đè, nhập cùng key trên origin đích rồi reload. Không dán script không tin cậy hoặc đưa dữ liệu riêng lên GitHub. Data URL có thể rất lớn. Không cần chuyển state để sửa code.

## 8. Hạn chế / ưu tiên

- P0: đối chiếu Safari iPhone thực tế, font/emoji/icon/menu theo bằng chứng mới.
- P1: chọn tin bắt đầu, layout quote dài, focus tin rất dài, keyboard nhiều layout, drag/drop.
- Chưa có voice note/sticker/link preview/cuộc gọi/nhóm chat. CaptureEnd, delivery cơ bản và Messenger quote đã có.
- P2: JSON import/export, IndexedDB/nén ảnh/schema migration, visual regression/CI E2E, Clipboard JPEG tùy trình duyệt. Dependencies đã pin, E2E portable đã vào repo.

Checkpoint chức năng chat trước đây: 12 unit tests + build, 18 trạng thái/6 file export. Đợt bổ sung chuyển khoản: 16 unit tests; E2E 18 trạng thái chat và 14 file PNG/JPG (6 chat + 8 chuyển khoản) đúng736 ×1600; kiểm tra pixel nền nhãn trong file tải, drag/key/edge/reload và mobile390 ×844. Chạy lại trên localhost và production sau deploy; không coi checkpoint là bảo đảm cho thay đổi sau này hoặc khớp pixel-native.
