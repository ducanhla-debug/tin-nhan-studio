# Kiểm thử portable — 12/10/2026

Đã đưa script vào repo, không cần thư mục Playwright của máy cũ.

    pnpm install --frozen-lockfile
    pnpm test
    pnpm build
    pnpm exec playwright install chromium

Terminal1 chạy pnpm dev; terminal2 chạy pnpm test:e2e. Server phải đang chạy. URL khác: pnpm test:e2e http://127.0.0.1:5174/. Production: pnpm test:e2e https://ducanhla-debug.github.io/tin-nhan-studio/.

QA tạo browser context mới với seed, không ghi đè profile/hội thoại cá nhân. Script kiểm tra 18 tổ hợp chat, 14 file tải PNG/JPG (3 chat + 4 chuyển khoản), decode736 ×1600, kéo nhãn, phím mũi tên, edge/size, reload persistence, đổi tab giữ tin, console và mobile390 ×844. Không thay thế kiểm thử iPhone thực hoặc pixel-perfect.

Screenshot mặc định vào thư mục tạm, script in đường dẫn. QA_OUTPUT_DIR chọn thư mục khác. Không commit artifact riêng tư. QA_BROWSER_PATH dùng Chrome có sẵn nếu không cài Chromium; Windows PowerShell ví dụ:

    $env:QA_BROWSER_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
    pnpm test:e2e

Không cần biến này khi dùng Chromium Playwright. Linux có thể cần pnpm exec playwright install --with-deps chromium nếu có quyền. Không cài lại browser để vượt quyền máy.

Manual thêm: Safari iPhone/touch drag, copy ảnh (quyền Clipboard), quote dài, focus tin rất dài, upload, pin/mạng yếu. Mẫu chuyển khoản phải luôn có nhãn đọc được/trong ảnh khi xuất hoặc copy; không có bút vẽ/nhãn ẩn. Tên/mã/amount là minh họa, không giao dịch thật. Không công khai screenshot ngân hàng có dữ liệu riêng tư.

CI deploy hiện chỉ unit tests/build, chưa tự chạy E2E. Kiểm tra Actions success đúng head commit, mở production và chạy QA trên URL thật sau deploy. Không khẳng định triển khai chỉ dựa build local.
