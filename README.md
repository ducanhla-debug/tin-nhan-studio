# Tin Nhắn Studio

Webtool tiếng Việt tạo ảnh hội thoại theo giao diện iPhone 14 Pro/Dynamic Island. Ứng dụng chạy hoàn toàn trên trình duyệt, không gửi nội dung hoặc hình ảnh lên máy chủ.

**Dùng thử:** https://ducanhla-debug.github.io/tin-nhan-studio/

## Tính năng

- Ba giao diện: Messenger, Zalo và Tin nhắn iPhone.
- Ba chế độ: toàn bộ cuộc trò chuyện, làm nổi bật một tin nhắn và xem trước Haptic Touch.
- Thêm, sửa, xóa, đổi thứ tự và chọn người gửi cho từng tin nhắn.
- Tin nhắn văn bản, hình ảnh và cảm xúc.
- Quick Pick cho thời gian, sóng, Wi‑Fi/4G/5G, pin và sáng/tối.
- Ảnh đại diện tùy chỉnh, bàn phím iPhone tùy chọn.
- Xuất PNG/JPG chính xác 736 × 1600 theo hai screenshot người dùng cung cấp, không watermark.
- Tự lưu dữ liệu trong trình duyệt và hỗ trợ giao diện điện thoại.
- Chạm chọn tin, nhấn giữ để làm nổi bật, chọn tin cuối vùng chụp và trạng thái đã gửi/đã xem.

## Giao diện iOS 26

Bộ dựng dùng tọa độ giao diện rộng 393pt, cỡ chữ chat 17pt và phóng đồng đều lên ảnh 736 × 1600. Tỷ lệ đầu ra 0.46 thay cho yêu cầu 9:16 ban đầu; tăng chiều cao hội thoại, không kéo méo chữ/icon.

Trên thiết bị Apple, ảnh dùng font hệ thống và emoji Apple có sẵn. Trên Windows/Android, font Inter 4.1 được đóng gói tại chỗ để thay thế; không phải SF Pro. Không phát hành font Apple trong repo.

Độ khớp pixel của Messenger/Zalo 2026 chưa được xác minh bằng ảnh chụp ứng dụng thực tế trên iPhone 14 Pro. Nguồn và giới hạn được ghi trong [tài liệu tham chiếu](./docs/platform-references.md).

## Chạy trên máy

```bash
pnpm install
pnpm dev
```

Kiểm thử và đóng gói:

```bash
pnpm test
pnpm build
```

## Triển khai

Dự án là web tĩnh. Thư mục `dist` sau khi chạy `pnpm build` có thể được triển khai trên GitHub Pages hoặc bất kỳ dịch vụ lưu trữ web tĩnh nào.

## Bàn giao cho AI khác

- [Tài liệu kiến trúc, vận hành và roadmap](./AI_HANDOVER.md)
- [Prompt copy–paste cho AI tiếp quản](./PROMPT_FOR_NEXT_AI.md)
