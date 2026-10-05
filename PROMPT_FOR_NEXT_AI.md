# Prompt bàn giao cho AI tiếp theo

Sao chép toàn bộ prompt bên dưới và gửi cho AI sẽ tiếp quản dự án.

---

Bạn đang tiếp quản dự án **Tin Nhắn Studio**, một webtool tiếng Việt tạo ảnh hội thoại mô phỏng trên iPhone 14 Pro/Dynamic Island.

## Nguồn dự án

- Repository: https://github.com/ducanhla-debug/tin-nhan-studio
- Production: https://ducanhla-debug.github.io/tin-nhan-studio/
- Nếu làm trên máy hiện tại, thư mục dự án là: `C:\Users\X1 CarBon G8\OneDrive\Documents\ChatGPT\AHC\tin-nhan-studio`

Trước khi hành động, hãy đọc đầy đủ:

1. `AI_HANDOVER.md`
2. `README.md`
3. `package.json`
4. `.github/workflows/deploy.yml`
5. Toàn bộ `src/`
6. Toàn bộ `tests/`

Sau đó kiểm tra `git status` và giữ nguyên mọi thay đổi không liên quan của người dùng.

## Mục tiêu sản phẩm bắt buộc

- Ba giao diện: Messenger, Zalo và Tin nhắn iPhone.
- Ba chế độ: Toàn bộ, Làm nổi bật và Xem trước Haptic Touch/3D Touch.
- Thiết bị: iPhone 14 Pro có Dynamic Island.
- Ảnh xuất: dọc 1080 × 1920, PNG/JPG.
- Có Quick Pick cho thời gian, pin, sóng, Wi‑Fi/4G/5G và sáng/tối.
- Có thể sửa tên, avatar, trạng thái, người gửi, nội dung, ảnh, thời gian, cảm xúc và thứ tự tin nhắn.
- Có thể hiện/ẩn bàn phím iPhone.
- Dữ liệu lưu cục bộ trong trình duyệt.
- Không watermark.
- Không biến ứng dụng thành landing page; phải giữ editor ba vùng và bản xem trước trực tiếp.

## Kiến trúc cần giữ

- React + Vite.
- `App.jsx` quản lý state, localStorage, upload và export.
- `components.jsx` chứa UI điều khiển.
- `defaults.js` chứa seed/preset.
- `renderer.js` dựng ảnh bằng Canvas 2D.
- Canvas thật luôn là 1080 × 1920; CSS chỉ thu nhỏ bản xem trước.
- GitHub Pages deploy từ workflow trong `.github/workflows/deploy.yml`.

## Nhiệm vụ của bạn

1. Hỏi hoặc suy luận yêu cầu thay đổi cụ thể từ tin nhắn mới nhất của người dùng.
2. Kiểm tra hiện trạng trước khi sửa; không đoán khi mã nguồn có thể trả lời.
3. Thực hiện thay đổi hoàn chỉnh, bao gồm state, UI, renderer và export nếu tính năng liên quan ảnh.
4. Giữ giao diện tiếng Việt tự nhiên, gọn và nhất quán.
5. Không thêm backend, tài khoản, analytics, watermark hoặc truyền dữ liệu ra ngoài nếu người dùng chưa yêu cầu.
6. Nếu sửa giao diện nền tảng, ưu tiên nâng độ chân thực của Messenger/Zalo/Messages trên iPhone 14 Pro.
7. Nếu thêm loại tin nhắn, cập nhật đồng thời editor, dữ liệu mặc định, Canvas renderer và test.

## Kiểm thử bắt buộc

Chạy:

```bash
pnpm install
pnpm test
pnpm build
```

Sau đó kiểm thử bằng trình duyệt thật:

- Trang tải được, không có framework overlay.
- Console không có lỗi liên quan.
- Control mới làm thay đổi UI thật.
- Kiểm tra cả desktop và mobile 390 px.
- Kiểm tra ba nền tảng và ba chế độ nếu renderer bị sửa.
- Tải ảnh PNG và xác nhận file có kích thước 1080 × 1920.
- Kiểm tra bản production sau khi deploy.

## Trước khi kết thúc

- `docs/design-concept.png` chỉ tham khảo bố cục editor. Giao diện chat phải đối chiếu ảnh chụp thật hoặc nguồn chính thức theo phiên bản ứng dụng, không dùng concept làm chuẩn nền tảng.
- Ghi rõ file đã sửa, kiểm thử đã chạy, kết quả, giới hạn còn lại.
- Nếu được yêu cầu triển khai, commit và push lên `main`, theo dõi GitHub Actions đến khi thành công, rồi mở production URL để xác minh.
- Không tuyên bố hoàn tất chỉ vì build thành công; phải xác minh luồng người dùng và ảnh xuất thật.

Hãy bắt đầu bằng cách tóm tắt hiện trạng dự án và nêu ngắn gọn kế hoạch cho yêu cầu mới nhất, sau đó chủ động thực hiện đến khi hoàn tất.

---
