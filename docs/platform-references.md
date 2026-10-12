# Spec tham chiếu Messenger/Zalo/iOS — 05/10/2026

Chuẩn hiện hành: hai screenshot do người dùng gửi, đọc file gốc xác nhận đều **736 × 1600 px** (tỷ lệ 0.46). Không dùng 9:16. Đây không phải kích thước screenshot native mặc định của mọi iPhone; là kích thước file tham chiếu người dùng muốn.

Ảnh gốc chứa hội thoại/tên/avatar riêng tư, không nằm trong repo công khai. Spec dưới đây lưu đặc điểm nhìn thấy; không chứa nội dung riêng. docs/examples chỉ là kết quả tool với dữ liệu giả, không thay cho nguồn native.

## Messenger — ảnh tham chiếu 1

- Header trắng bên trái → xanh da trời nhạt bên phải, avatar tròn trước tên đậm; back nét xanh, phone/video xanh đặc. Không subtitle online/dot trong ảnh.
- Nền chat trắng; nhận xám rất nhạt khoảng #f2f2f6; gửi đổi xanh theo vị trí dọc (trên sáng khoảng #326af5, dưới đậm khoảng #0b0fc3), không lặp gradient riêng mỗi bubble.
- Avatar nhận chỉ ở tin cuối nhóm, căn đáy; incoming lề trái ~50pt trên chiều rộng quy đổi 393pt. Avatar ~23–24pt tại x14pt.
- Bubble ngoài bo lớn ~17–18pt, cạnh nối cùng người bo nhỏ ~2pt, gap trong nhóm ~2pt, giữa nhóm ~10pt. Tin gửi lề phải ~7pt.
- Có nhãn Bạn đã trả lời [tên], khối quote xám và bubble phản hồi phía dưới; seen mini avatar dưới tin gửi.
- Composer: cộng trắng trong hình tròn xanh đậm, camera/image/mic đặc, input Aa ngắn màu xám, smile đặc và thumbs. Vị trí xấp xỉ x13/51/91/132pt; input x168pt. Màu control xanh tím đậm #1518bf.
- Không suy luận tất cả menu/dark/rollout từ ảnh sáng này.

## Zalo — ảnh tham chiếu 2

- Header/status xanh chuyển sắc ~#0087ff → #00b4ed; tên trắng, không avatar trong header; back/phone/video/menu trắng nét outline.
- Nền ~#e2e9f1; nhận trắng có viền, gửi cyan nhạt ~#cff0fb có viền xanh xám.
- Tất cả bubble bo đều ~9pt, không giảm góc theo nhóm. Incoming x38pt; avatar ở **đầu nhóm, căn trên**, x10pt size~22pt. Gửi lề phải~12pt.
- Giờ xám khoảng10pt nằm **trái trong tin cuối nhóm**, không phải mỗi tin/căn phải. Date separator trắng trên pill xám centered, ví dụ giờ + ngày/tháng/năm.
- Cảm xúc dưới phải: pill trắng emoji + số đếm, kèm nút tròn cảm xúc riêng.
- Composer nền trắng phẳng: smile outline, placeholder Tin nhắn, ellipsis/mic/image xám; không input pill nổi.

## Status/thiết bị/font

- Theo yêu cầu: iPhone 14 Pro có Dynamic Island/home indicator dù hai screenshot không hiện island. Đây là khác biệt có chủ ý; không xóa khi không được yêu cầu.
- Status cụm phải (khung393pt): sóng x280pt, 4 cột đặc cùng đáy; Wi-Fi x306pt, 3 tầng thuôn đặc; pin x332pt thân27 × 13.5pt, bo4pt, đầu riêng, %11.5pt. Theo ảnh, không dùng outline Wi-Fi quá mảnh.
- Time17pt semibold. Pin thấp đỏ, foreground trắng ở Zalo/dark, đen ở Messenger/Messages sáng; giá trị clamp/round.
- Canvas logical393 ×854.35pt → file736 ×1600, scale hai trục736/393. Chat hiện17pt/line22pt; giữ scale uniform; CSS preview height:auto.
- Apple native font/emoji khi mở trên Apple. Inter4.1/OFL đóng gói thay trên Windows/Android, emoji theo OS. Không phân phối font Apple.

## Messages / focus / preview

Messages là mô phỏng iOS26: contact control, composer plus/mic, iMessage xanh dương hoặc SMS xanh lá, incoming xám có tail cuối nhóm. Menu hold, reaction và thẻ preview dựa trên ảnh ban đầu và nguồn chính thức; chưa có ảnh mới cùng thiết bị đủ chứng minh khớp từng pixel.

Hold450ms focus, tap nền dismiss; keyboard QWERTY tĩnh. Cần kiểm tra quote dài/menu quá đáy khi đổi layout.

## Nguồn bổ sung và giới hạn

- Messenger: https://apps.apple.com/us/app/messenger/id454638411
- Zalo: https://apps.apple.com/vn/app/zalo/id579523206
- Apple Messages iOS26: https://support.apple.com/en-gb/guide/iphone/iph82fb73ba3/26/ios/26
- Apple fonts: https://developer.apple.com/fonts/
- Inter: https://rsms.me/inter/

Nguồn này bổ sung, không thay hai ảnh của người dùng. Listing/version hoặc marketing preview không chứng minh mọi bản giao diện năm2026. Chưa kiểm thử Safari iPhone14Pro thực; icon tự vẽ không chính thức, Liquid Glass/dark/menu/emoji có sai khác. Functional QA không đồng nghĩa pixel-perfect. Khi cần chỉnh fidelity vượt spec, xin screenshot mới có thể chia sẻ hoặc kiểm tra trực tiếp trên iPhone, không đoán.
