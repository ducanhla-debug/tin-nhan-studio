# Typography iOS — 2026-10-05

Font mục tiêu của các mô phỏng iOS là SF Pro (San Francisco), truy cập bằng font hệ thống trên Apple, không bằng file font nhúng. Cùng một family không có nghĩa cùng kích thước, weight, khoảng cách hoặc layout giữa các app.

- Apple xác nhận SF Pro là font hệ thống: https://developer.apple.com/fonts/
- Apple hướng dẫn WebKit dùng `system-ui` và không bundle font hệ thống Apple: https://developer.apple.com/documentation/technologyoverviews/fonts
- Chưa tìm thấy tài liệu chính thức của Meta hoặc Zalo xác nhận family của chữ trong bong bóng chat trên bản iOS hiện hành. SF Pro cho Messenger/Zalo là lựa chọn mô phỏng dựa trên hệ thống iOS và ảnh tham chiếu, **không phải xác nhận của nhà phát hành**. Không dùng guideline ZaloPay để chứng minh font Zalo.

`src/typography.js` dùng `system-ui, -apple-system, BlinkMacSystemFont, sans-serif` trên môi trường Apple và Inter đã có giấy phép trên máy khác. Font ghi chú cập nhật theo lựa chọn nền tảng. Cả đo dòng và vẽ canvas dùng cùng helper `font()`; chờ các weight tải xong trước khi render. Không tải hoặc phân phối SF Pro vào website.

Production trên Windows vẫn xuất bằng Inter thay thế, không được quảng bá là SF Pro. Chưa kiểm chứng trên iPhone vật lý hoặc xác nhận khớp từng pixel. Kích thước ảnh vẫn 736 × 1600 px; giữ ba nền tảng và ba chế độ.

## Font cục bộ do người dùng cung cấp — lượt nhập ban đầu

Đã nhập bốn file OTF Regular/Medium/Semibold/Bold từ ZIP `SF Pro Display.zip` của người dùng vào `.local-fonts/` (gitignored). Chỉ dev server localhost phục vụ bốn file này; production build không chứa chúng. Không cài vào font hệ thống Windows, không mở shortcut URL đi kèm ZIP. Trình duyệt nạp đủ bốn weight trước khi khởi tạo giao diện và renderer. Nhãn UI xác nhận đã nạp font cục bộ trên Windows; test 15/15 và build đạt. File là bản Display do người dùng cung cấp, chưa xác thực nguồn gốc/bản phát hành, không phải bằng chứng font chat chính thức hoặc font hệ thống iOS đầy đủ. Chưa kiểm tra lại file PNG/JPG tải xuống sau thay đổi font này.

## Cập nhật đối chiếu ảnh ngày 05/10/2026

Dev localhost hiện nạp thêm SF Pro Text Regular/Medium/Semibold/Bold từ gói SF Pro tải trực tiếp của Apple, lưu tại `.local-fonts/apple-text/Library/Fonts/`. Chữ giao diện và bong bóng dùng Text; riêng bàn phím giữ Display. Cỡ chat 14.5pt, tracking 0; line-height Messenger/Zalo 18pt, Tin nhắn iPhone 21pt. Đo dòng và vẽ dùng cùng profile. Đây là điều chỉnh theo ảnh tham chiếu, không phải chứng minh font chính thức của Meta/Zalo hoặc xác nhận pixel-perfect.

Ngày 06/10/2026, người dùng xác nhận không có giấy phép riêng cho nhúng/phân phối SF Pro Text/Display trên website công khai, và đồng ý triển khai bằng Inter trên Windows/Android, font hệ thống trên Apple. Font Apple chỉ phục vụ dev localhost. Không coi bản public là SF Pro trên mọi thiết bị. Cỡ chat hiện tại 15.5pt; chiều cao dòng Messenger/Zalo 19pt, SMS/iMessage 22pt.
