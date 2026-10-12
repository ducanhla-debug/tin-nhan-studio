# Prompt tiếp quản trên máy mới

Sao chép phần dưới, điền nhiệm vụ.

Tiếp quản Tin Nhắn Studio: https://github.com/ducanhla-debug/tin-nhan-studio. Production: https://ducanhla-debug.github.io/tin-nhan-studio/.

Clone/pull repo mới nhất; đọc AGENTS.md, AI_HANDOVER.md, README.md, docs/NEW_MACHINE.md, docs/platform-references.md, docs/QA.md. Kiểm tra git status, package/lockfile/workflow/src/tests. Không cần máy hoặc lịch sử chat cũ. Nếu môi trường không đọc/chỉnh được repo, nói rõ và yêu cầu mở repo trong môi trường lập trình phù hợp.

Hiện hành: webtool tiếng Việt, iPhone 14 Pro/Dynamic Island/iOS 26; Messenger/Zalo/Tin nhắn full/focus/preview và tab Mẫu chuyển khoản (4 phong cách tham khảo). PNG/JPG **736 × 1600 px**. Không quay về yêu cầu 9:16/1080 × 1920 cũ; không kéo méo font/icon. Tin nhắn không watermark; chuyển khoản bắt buộc nhãn MÔ PHỎNG – KHÔNG CÓ GIÁ TRỊ GIAO DỊCH đọc được, kéo trong ảnh, không tắt/che/làm mờ, không bút vẽ. Đọc docs/bank-mockups.md. Không backend/analytics. docs/examples là ảnh tool dựng với nội dung giả, không ảnh native pixel-perfect.

Máy mới: Git, Node.js 22.12+, pnpm 10; pnpm install --frozen-lockfile, pnpm test, pnpm build, pnpm dev. QA: pnpm exec playwright install chromium; chạy server rồi pnpm test:e2e. Xác minh desktop/mobile và decode PNG/JPG thực, không chỉ build.

**Nhiệm vụ mới: [ĐIỀN YÊU CẦU Ở ĐÂY].**

Thực hiện trong phạm vi, giữ thay đổi không liên quan; sửa tài liệu/tests cùng tính năng. Không reset dữ liệu trình duyệt, xuất bản ảnh riêng hoặc credentials; không tuyên bố pixel-perfect chưa xác minh. Báo cáo kết quả và rủi ro.

Triển khai chỉ khi tôi yêu cầu: push main cần quyền GitHub trên máy mới; chờ Actions success rồi kiểm tra production. Thiếu quyền thì giữ local và hướng dẫn cấp quyền.
