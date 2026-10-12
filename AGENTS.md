# Quy tắc AI tiếp quản

Đọc AI_HANDOVER.md, README.md, docs/NEW_MACHINE.md, docs/platform-references.md và docs/QA.md trước sửa. Không cần máy/lịch sử chat cũ.

- Hiện hành: iPhone14Pro/Dynamic Island/iOS26; PNG/JPG736 ×1600. Không phục hồi kích thước cũ hoặc export phụ thuộc viewport.
- Editor tiếng Việt, ba nền tảng/mode. Không biến thành landing page.
- Tin nhắn không watermark. Mẫu chuyển khoản bắt buộc nhãn MÔ PHỎNG – KHÔNG CÓ GIÁ TRỊ GIAO DỊCH, không cho tắt/làm mờ/che/đẩy ra ngoài ảnh. Không backend/analytics/truyền dữ liệu ra server nếu chưa được yêu cầu.
- Không commit chat riêng, localStorage/avatar người dùng, credential hoặc ảnh gốc. docs/examples chỉ nội dung giả.
- Apple native / Inter fallback; không gọi pixel-perfect chưa xác minh.
- Kiểm tra git status, giữ changes không liên quan; dùng install frozen-lockfile, không update dependency tùy tiện.
- Chạy pnpm test và pnpm build; UI/renderer thêm E2E, visual review desktop/mobile, decode ảnh tải xuống.
- Đồng bộ docs/prompt/tests khi đổi spec; đọc docs/QA.md.
- Push/deploy chỉ khi người dùng yêu cầu, cần quyền GitHub; xác nhận Actions + production.
- Không tự spawn/delegate agent hoặc thêm framework/backend ngoài phạm vi.
