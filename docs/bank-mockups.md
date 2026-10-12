# Mẫu chuyển khoản — 12/10/2026

Người dùng chốt thêm vào webtool; đây là mẫu minh họa, không chứng từ thật. Bốn phong cách lấy cảm hứng từ ảnh Vietcombank/VietinBank/Techcombank/MB, không phát hành screenshot tài chính gốc, không tái sử dụng dữ liệu riêng tư hoặc banner quảng cáo gốc. UI có dòng MẪU THIẾT KẾ/không kết nối ngân hàng, nội dung seed/mã DEMO.

## Chốt và giới hạn

- Nhãn MÔ PHỎNG + KHÔNG CÓ GIÁ TRỊ GIAO DỊCH luôn được vẽ lớp cuối. Không toggle off, opacity/text override hoặc stroke phủ nhãn.
- Người dùng có thể kéo nhãn đến bất kỳ tọa độ khả dụng trong khung, không chỉ corner presets. X/Y sliders và phím mũi tên cũng điều khiển được; phím mũi tên thay đổi2%.
- Kích thước14–22pt, nền vàng đục/chữ nâu tương phản, clamp toàn bộ bounding box trong ảnh. Cỡ lớn chiếm nhiều chiều ngang nên vùng di chuyển ngang hẹp hơn; đó là điều kiện để không cắt nhãn.
- Bỏ bút vẽ/khoanh vùng theo yêu cầu cuối cùng.
- 736 ×1600 PNG/JPG, preview và file export/copy dùng cùng renderToCanvas.
- Tab chat/bank không làm mất messages; state bank lưu cùng key localStorage, không đồng bộ qua máy khác. Global Đặt lại reset toàn bộ; Đặt lại mẫu chuyển khoản chỉ reset bank.

## Mã nguồn

bankModel.js: initialBank, normalizeBank, labelGeometry, moveLabel, amountText. labelX/Y0..100 tương ứng góc trái nhãn trong vùng khả dụng đã trừ lề10pt, không phải % tọa độ tâm toàn ảnh. Size và vị trí normalize cả khi import state.

bankRenderer.js: gradient/check/text/card tự vẽ, không logo/ảnh thật. renderSimulationLabel không đọc các cờ enabled/opacity/showLabel. renderBank gọi nhãn cuối cùng. Renderer chính nhánh documentType bank trước chat modes; hit regions rỗng. Status dùng renderer chat qua callback, tránh circular import.

BankPanels.jsx: thông tin, status, sliders/export. App.jsx Preview: pointer capture khi nhấn trong nhãn, tọa độ scale logical, cancel/lostcapture, key arrows; load normalizeBank để merge state cũ.

## QA

pnpm test: normalize amount/style, nhãn min/max/bounds, kéo giữa/cạnh. pnpm test:e2e: 4styles × PNG/JPG, drag/key/size/edge/reload/mobile; cả chat regression. Phải visual review chữ nhãn đọc được và test touch Safari thực trước khi khẳng định hỗ trợ iPhone đầy đủ.

Không claim giống native từng pixel. Tên người nhận/ngân hàng dài được ellipsis; ghi chú tối đa3 dòng. Ảnh không chứng minh giao dịch được thực hiện. Không gửi thanh toán hoặc gọi API ngân hàng.
