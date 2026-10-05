# Giao diện nền tảng — cập nhật 05/10/2026

Quyết định kích thước mới: đọc trực tiếp cả hai file screenshot gốc, xác nhận 736 × 1600 px. Đầu ra và bản xem trước chuyển sang tỷ lệ 736/1600 thay cho 9:16. Các ghi chú 9:16 bên dưới là lịch sử, không còn là yêu cầu hiện hành. Chữ/icon vẫn giữ tỷ lệ theo chiều rộng 393pt; chỉ tăng vùng hội thoại.

## Đối chiếu hai screenshot mới do người dùng cung cấp

Thanh trạng thái được chỉnh riêng theo ảnh: sóng gồm bốn cột đặc cùng đáy; Wi-Fi ba dải đặc thuôn; pin thân bo liền, đầu pin riêng, phần trăm 11.5pt và vùng pin còn lại. Cụm phải đặt tại x280–361 trên khung 393pt. Có kiểm thử clamp/round giá trị pin và sóng, quick pick pin thấp, mạng yếu và đủ pin. Đây vẫn là hình vẽ tái hiện từ ảnh, chưa chứng nhận trùng pixel với hệ thống iOS 26 thực tế.

Hai ảnh mới là chuẩn trực tiếp cho màn hình hội thoại Messenger/Zalo, không phải ảnh quảng bá. Không đưa tên, nội dung riêng tư hoặc screenshot gốc vào repository công khai.

- Messenger: header xanh nhạt chuyển sắc; bong bóng gửi đổi xanh theo vị trí dọc; góc nối nhóm nhỏ; avatar cuối nhóm; thanh soạn có nút cộng tròn, camera/micro đặc, input ngắn. Mặc định ẩn trạng thái hoạt động. Có trích dẫn trả lời tùy chọn.
- Zalo: nền xám xanh, tin gửi cyan nhạt có viền; góc bo đều kể cả cùng nhóm; avatar đầu nhóm; giờ nằm trái trong tin cuối nhóm; mốc ngày dạng pill xám và cảm xúc có số đếm/nút tròn.
- Khác biệt có chủ ý: vẫn giữ Dynamic Island và home indicator theo yêu cầu iPhone 14 Pro; đầu ra 9:16 ngắn hơn tỷ lệ vật lý thiết bị. Windows dùng Inter, chưa xác minh pixel-perfect trên Safari iPhone. Icon tự vẽ vẫn là xấp xỉ, menu nhấn giữ không có screenshot mới để xác minh.

Nguồn đối chiếu:
- Messenger: https://apps.apple.com/us/app/messenger/id454638411 — ảnh preview iPhone của Meta.
- Zalo: https://apps.apple.com/vn/app/zalo/id579523206 — ảnh preview iPhone của Zalo Group, phiên bản được liệt kê 26.10.01.
- Messages: https://support.apple.com/en-gb/guide/iphone/iph82fb73ba3/26/ios/26 — hướng dẫn iOS 26; nút thêm ở dưới trái, màu xanh dương iMessage / xanh lá SMS.
- Ảnh Zalo và menu nhấn giữ người dùng cung cấp trong cuộc hội thoại là tham chiếu bổ sung.

Đã sửa header, composer, palette và icon riêng từng nền tảng; tin liên tiếp cùng người gom khoảng cách và avatar cuối nhóm; Messages có đuôi bong bóng, Tapback ở góc trên, chọn iMessage/SMS. Menu focus/preview có nhãn theo nền tảng và màu sáng/tối.

## Đợt sửa typography/UX 05/10/2026

Người dùng đã chốt iOS 26. Nguồn App Store Messenger được kiểm tra trực tiếp liệt kê phiên bản 581.0.0, nhưng ảnh quảng bá không đủ chứng minh mọi màn hình của phiên bản đó. Không dùng phiên bản trong listing để gắn nhãn ảnh quảng bá là screenshot 2026 đã được xác minh.

- Renderer chuyển sang tọa độ rộng 393pt, chữ chat 17pt/line-height 22pt; xuất ảnh phóng đồng đều, preview card cũng phóng đồng đều.
- Typography chờ font tải xong trước khi đo/cắt dòng. Apple dùng font hệ thống native; Windows/Android dùng Inter 4.1 có giấy phép SIL OFL, lưu trong public/fonts. Emoji dùng hệ điều hành. Không phân phối font/emoji Apple.
- Nguồn font: https://developer.apple.com/fonts/ và https://rsms.me/inter/.
- Chạm bong bóng chọn tin, nhấn giữ 450ms mở focus; chạm nền mờ đóng focus. Chọn tin cuối đoạn chụp, trạng thái đã gửi/đã xem. Render vào buffer, chỉ commit phiên cập nhật mới nhất để tránh hiển thị dữ liệu cũ khi sửa nhanh.

Mismatches còn cần bằng chứng: font/emoji Apple trên iPhone thực tế; icon ứng dụng (path tự vẽ, không SF Symbols); hình dạng/opacity/blur Liquid Glass theo từng app/rollout; menu focus/preview; trạng thái giao/đọc theo app. Các điểm này chưa được xác minh từng pixel bằng screenshot cùng thiết bị/phiên bản/cỡ chữ.

Giới hạn: chưa kiểm thử trực tiếp Safari iPhone 14 Pro. Ảnh 9:16 có vùng hội thoại ngắn hơn màn hình vật lý iPhone 14 Pro, giữ nguyên tỷ lệ font/icon theo chiều rộng; không thể vừa giữ tỷ lệ toàn màn hình vật lý vừa có ảnh 9:16 không crop/pad.
