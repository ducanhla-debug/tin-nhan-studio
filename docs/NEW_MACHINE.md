# Tiếp tục trên máy mới — Windows/macOS/Linux

## Chuẩn bị

Git, Node.js22.12+, pnpm10 (CI Node22). Nếu cần cài pnpm: npm install -g pnpm@10, theo quyền máy của bạn.

    git clone https://github.com/ducanhla-debug/tin-nhan-studio.git
    cd tin-nhan-studio
    pnpm install --frozen-lockfile
    pnpm test
    pnpm build
    pnpm dev

Mở thư mục clone trong AI/IDE, gửi PROMPT_FOR_NEXT_AI.md và nhiệm vụ. Localhost http://127.0.0.1:5173/; Vite có thể dùng port khác nếu bận, truyền URL đó cho E2E.

Không API key/.env/database. node_modules/dist tạo lại, không commit. Kiểm tra node --version và pnpm --version khi install lỗi. Không xóa lockfile để chữa lỗi.

## Quyền GitHub/deploy

Repo public: clone/read không cần đăng nhập. Push cần chủ repo/collaborator. Đăng nhập credential manager/IDE trên máy mới; không gửi token trong chat hoặc repo. Commit dùng tên/email người sửa, không giả định danh tính máy cũ.

Trước sửa: git status; worktree sạch mới git pull --ff-only. Không reset hard dữ liệu hiện có.

Khi được yêu cầu deploy: commit file liên quan, git push origin main, chờ https://github.com/ducanhla-debug/tin-nhan-studio/actions success, kiểm tra https://ducanhla-debug.github.io/tin-nhan-studio/.

Denied: xin cấp quyền hoặc fork/PR theo yêu cầu, không cần token/SSH máy cũ. Fork host riêng phải bật Settings → Pages → GitHub Actions; URL đổi owner/repo. Vite base './'.

## Có / không có trong GitHub

Có code, lịch sử, docs/spec, fonts/OFL, unit/E2E script, workflow và ví dụ với nội dung giả. Không có hội thoại nhập trên browser, avatar cá nhân, lịch sử chat AI, token hoặc ảnh tham chiếu riêng tư. Public repo không tự cấp giấy phép mọi thương hiệu/ảnh; font có OFL riêng.

State theo origin/profile localStorage, không tự đồng bộ. Backup/import thủ công JSON theo AI_HANDOVER.md; chưa có nút UI. Không cần state cũ để tiếp quản code.

## QA/browser

    pnpm exec playwright install chromium

Chạy pnpm dev ở terminal1, pnpm test:e2e ở terminal2. Linux có thể cần install --with-deps chromium nếu được phép. Dùng Chrome có sẵn bằng QA_BROWSER_PATH, hướng dẫn trong docs/QA.md.

Font Windows không giống Apple: thử iPhone/Safari khi đối chiếu fidelity. Website cũ: kiểm tra Actions đúng commit success rồi reload.
