# Giao diện nền tảng — cập nhật 05/10/2026

## Bộ ảnh bổ sung và bản sửa đang kiểm tra

Ảnh được gửi trong chat, chỉ dùng cục bộ để đối chiếu, không sao chép nội dung riêng tư hay file gốc vào repository:

- Bộ 5 ảnh: Zalo hội thoại và bàn phím; Messenger hội thoại, focus, preview.
- Bộ 4 ảnh: SMS và iMessage, mỗi loại có màn hình toàn bộ và preview.
- Tất cả ảnh đính kèm trong lượt này rộng 589 × 1280; đầu ra vẫn cố định 736 × 1600 theo yêu cầu người dùng.
- Messenger/Zalo: chữ chat 15.5pt trên khung 393pt, header thấp hơn, composer riêng; bàn phím cao 309pt. Messenger focus có camera và Dịch; preview có 6 thao tác.
- Messages: avatar 50pt, contact pill, nhãn dịch vụ và mã hóa cho iMessage, màu cyan/green, Tapback dạng bong bóng; hội thoại ngắn bắt đầu trên, hội thoại dài giữ tin cuối.
- Dynamic Island và home indicator giữ theo yêu cầu sản phẩm, dù một số mẫu không có. Không sao chép thanh cuộc gọi/Live Activity trong mẫu khi state không có cuộc gọi.
- Font/emoji trên Windows vẫn khác Apple; icon và glass/blur là dựng lại. Chưa xác nhận trùng pixel. Zalo focus/preview và Messages focus chưa có mẫu trực tiếp trong bộ này.

Trạng thái kiểm thử mới xem [QA-2026-10-05.md](./QA-2026-10-05.md); kết quả lịch sử bên dưới không thay thế kiểm tra bản sửa.

Quyết định kích thước mới: đầu ra bắt buộc 736 × 1600 px. Bộ ảnh người dùng gửi lại trong lượt hiện tại có kích thước 589 × 1280, không phải 736 × 1600. Đầu ra và bản xem trước chuyển sang tỷ lệ 736/1600 thay cho 9:16. Các ghi chú 9:16 bên dưới là lịch sử, không còn là yêu cầu hiện hành. Chữ/icon vẫn giữ tỷ lệ theo chiều rộng 393pt; chỉ tăng vùng hội thoại.

## Đối chiếu hai screenshot mới do người dùng cung cấp

Thanh trạng thái được chỉnh riêng theo ảnh: sóng gồm bốn cột đặc cùng đáy; Wi-Fi ba dải đặc thuôn; pin thân bo liền, đầu pin riêng, phần trăm 11.5pt và vùng pin còn lại. Cụm phải đặt tại x280–361 trên khung 393pt. Có kiểm thử clamp/round giá trị pin và sóng, quick pick pin thấp, mạng yếu và đủ pin. Đây vẫn là hình vẽ tái hiện từ ảnh, chưa chứng nhận trùng pixel với hệ thống iOS 26 thực tế.

Hai ảnh mới là chuẩn trực tiếp cho màn hình hội thoại Messenger/Zalo, không phải ảnh quảng bá. Không đưa tên, nội dung riêng tư hoặc screenshot gốc vào repository công khai.

- Messenger: header xanh nhạt chuyển sắc; bong bóng gửi đổi xanh theo vị trí dọc; góc nối nhóm nhỏ; avatar cuối nhóm; thanh soạn có nút cộng tròn, camera/micro đặc, input ngắn. Mặc định ẩn trạng thái hoạt động. Có trích dẫn trả lời tùy chọn.
- Zalo: nền xám xanh, tin gửi cyan nhạt có viền; góc bo đều kể cả cùng nhóm; avatar đầu nhóm; giờ nằm trái trong tin cuối nhóm; mốc ngày dạng pill xám và cảm xúc có số đếm/nút tròn.
- Khác biệt có chủ ý: vẫn giữ Dynamic Island và home indicator theo yêu cầu iPhone 14 Pro; đầu ra cố định 736 × 1600 theo yêu cầu hiện hành. Windows dùng Inter, chưa xác minh pixel-perfect trên Safari iPhone. Icon tự vẽ vẫn là xấp xỉ, menu nhấn giữ không có screenshot mới để xác minh.

Nguồn đối chiếu:
- Messenger: https://apps.apple.com/us/app/messenger/id454638411 — ảnh preview iPhone của Meta.
- Zalo: https://apps.apple.com/vn/app/zalo/id579523206 — ảnh preview iPhone của Zalo Group, phiên bản được liệt kê 26.10.01.
- Messages: https://support.apple.com/en-gb/guide/iphone/iph82fb73ba3/26/ios/26 — hướng dẫn iOS 26; nút thêm ở dưới trái, màu xanh dương iMessage / xanh lá SMS.
- Ảnh Zalo và menu nhấn giữ người dùng cung cấp trong cuộc hội thoại là tham chiếu bổ sung.

Đã sửa header, composer, palette và icon riêng từng nền tảng; tin liên tiếp cùng người gom khoảng cách và avatar cuối nhóm; Messages có đuôi bong bóng, Tapback ở góc trên, chọn iMessage/SMS. Menu focus/preview có nhãn theo nền tảng và màu sáng/tối.

## Đợt sửa typography/UX 05/10/2026

Người dùng đã chốt iOS 26. Nguồn App Store Messenger được kiểm tra trực tiếp liệt kê phiên bản 581.0.0, nhưng ảnh quảng bá không đủ chứng minh mọi màn hình của phiên bản đó. Không dùng phiên bản trong listing để gắn nhãn ảnh quảng bá là screenshot 2026 đã được xác minh.

- Renderer dùng tọa độ rộng 393pt, chữ chat hiện tại 15.5pt; line-height Messenger/Zalo 19pt, Tin nhắn iPhone 22pt (người dùng yêu cầu tăng ngày 06/10/2026). Xuất ảnh và preview card phóng đồng đều. Chưa xác nhận khớp từng pixel.
- Typography chờ font tải xong trước khi đo/cắt dòng. Apple dùng font hệ thống native; Windows/Android dùng Inter 4.1 có giấy phép SIL OFL, lưu trong public/fonts. Emoji dùng hệ điều hành. Không phân phối font/emoji Apple.
- Nguồn font: https://developer.apple.com/fonts/ và https://rsms.me/inter/.
- Chạm bong bóng chọn tin, nhấn giữ 450ms mở focus; chạm nền mờ đóng focus. Chọn tin cuối đoạn chụp, trạng thái đã gửi/đã xem. Render vào buffer, chỉ commit phiên cập nhật mới nhất để tránh hiển thị dữ liệu cũ khi sửa nhanh.

Mismatches còn cần bằng chứng: font/emoji Apple trên iPhone thực tế; icon ứng dụng (path tự vẽ, không SF Symbols); hình dạng/opacity/blur Liquid Glass theo từng app/rollout; menu focus/preview; trạng thái giao/đọc theo app. Các điểm này chưa được xác minh từng pixel bằng screenshot cùng thiết bị/phiên bản/cỡ chữ.

Giới hạn: chưa kiểm thử trực tiếp Safari iPhone 14 Pro. Đầu ra 736 × 1600 giữ tỷ lệ font/icon theo chiều rộng. Dynamic Island và home indicator được giữ theo yêu cầu sản phẩm; một số ảnh mẫu không hiển thị chúng.
