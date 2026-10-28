# Thế giới hạt — Sách 20 trang kèm QR mở mô hình 3D

Trang chủ hiện là **cuốn sách lật 20 trang**, lấy nội dung từ `aa.html` người dùng gửi. QR và nút mở mô hình nằm ngay trong bài: **trang 5 → thể rắn `ptr.glb`; trang 7 → thể khí `ptk.glb`**. Quét QR sẽ mở đúng mô hình 3D của bài đó. Có thêm chế độ đọc cuộn, mục lục và liên kết trở lại đúng trang sách từ viewer.

Trang `models.html` giữ danh sách hai mô hình. Viewer có xoay, phóng to, phát/dừng hoạt hình thể khí và lựa chọn AR trên thiết bị hỗ trợ. Luồng chính của sách chỉ cần quét QR để xem 3D, không cần nhận diện hình in trên sách.

Font hiện dùng **Be Vietnam Pro** cho cả sách và các trang chức năng. Tệp font nằm trong `assets/fonts/`, khai báo tại `css/fonts.css`, không cần tải từ Google Fonts lúc đọc. Khi upload hoặc cập nhật, giữ đủ thư mục font và các HTML/CSS mới. Nếu trình duyệt vẫn thấy font cũ sau khi Pages cập nhật, thử Ctrl+F5 hoặc mở tab riêng tư.

**Sau khi đăng GitHub Pages, QR xuất hiện tự động ngay trong trang sách.** Chưa cần tạo thủ công rồi chèn lại vào HTML. Trang `qr.html` dùng khi bạn muốn tải ảnh QR riêng để chèn vào bản sách in. Đọc thêm `SACH_VA_QR.md`.

**Chưa được đăng lên GitHub trong lần bàn giao này.** Sau khi bạn bật GitHub Pages, QR sẽ mở trang mô hình qua Internet. Người học mở trang rồi chủ động bấm AR; quét QR không tự bật camera.

## 1. Xem thử trên máy Windows

Máy cần Python. Nhấp đúp `XEM_THU.cmd`, giữ cửa sổ đó mở, rồi vào:

```text
http://localhost:8123/
```

Hoặc mở PowerShell trong thư mục chứa README này và chạy:

```powershell
python -m http.server 8123 --bind 127.0.0.1
```

Nếu báo cổng đã dùng, thử `8124` và mở cùng số cổng. Dừng bằng Ctrl+C.

Không nhấp đúp HTML qua `file://`: website cần HTTP để đọc JSON và GLB. Địa chỉ localhost chỉ là bản thử trên máy, không phải link cho cả lớp quét qua 4G. Dùng VS Code Live Server cũng được.

## 2. Đưa lên GitHub Pages bằng giao diện web

1. Đăng nhập GitHub, tạo repository mới tên `hat-ar`. Với gói GitHub Free, chọn repository **Public** để dùng Pages.
2. Mở repository, chọn **Add file → Upload files**.
3. Tải **nội dung bên trong thư mục hat-ar** lên repository: `index.html`, `viewer.html`, `qr.html`, `huong-dan.html` và các thư mục `assets`, `vendor`, `css`, `js`, `data`. Có thể tải kèm tài liệu và `tools`.
4. Nhấn **Commit changes**. Kiểm tra trang Code của repo nhìn thấy ngay `index.html` ở gốc. Nếu phải mở thêm thư mục `hat-ar` mới thấy `index.html`, bạn đã lồng thêm một cấp thư mục.
5. Vào **Settings → Pages**.
6. Trong **Build and deployment**, chọn **Source: Deploy from a branch**.
7. Chọn **Branch: main**, thư mục **/ (root)**, bấm **Save**.
8. Đợi GitHub triển khai. Khi Pages hiển thị **Visit site**, mở URL HTTPS đó. Thay đổi có thể cần vài phút mới hiển thị.
9. Kiểm tra cả hai mô hình mở được trước khi in QR.

Ví dụ URL nếu tài khoản của bạn là `tenban` và repository là `hat-ar`:

```text
https://tenban.github.io/hat-ar/
```

Đây chỉ là ví dụ; dùng đúng địa chỉ GitHub cấp cho tài khoản của bạn. Link `https://github.com/tenban/hat-ar` là trang mã nguồn, **không phải link website để quét**.

Không tải nguyên RAR, bản GLB gốc 48 MB trong RAR, các tài liệu học khác hoặc toàn bộ thư mục làm việc lên repo. Chỉ cần bộ website `hat-ar`. GLB cần là tệp nhị phân thật, không phải tệp con trỏ Git LFS.

## 3. Nếu muốn đẩy bằng Git trên PowerShell

Tạo repository GitHub rỗng, không thêm README sẵn. Mở PowerShell trong thư mục `hat-ar`, thay `TEN_GITHUB` bằng tài khoản thật:

```powershell
git init
git add .
git commit -m "Add particle 3D and AR website"
git branch -M main
git remote add origin https://github.com/TEN_GITHUB/hat-ar.git
git push -u origin main
```

GitHub có thể yêu cầu đăng nhập. Sau khi push vẫn phải bật **Settings → Pages → main → / (root)** như phần trên. Git là công cụ đưa mã nguồn lên; GitHub Pages mới là phần phục vụ website.

Nếu thư mục đã là Git repository hoặc đã có remote, kiểm tra `git status` và `git remote -v` thay vì chạy lại toàn bộ khối lệnh. Không ghi mật khẩu/token vào mã nguồn.

## 4. Tạo QR sau khi đăng web

1. Mở website đã triển khai.
2. Bấm **Tạo mã QR**. Khi chạy trên URL HTTPS công khai, trang tự điền URL thư mục gốc hiện tại và tạo hai QR.
3. Nếu chưa tự điền đúng, dán URL website gốc rồi bấm **Tạo 2 mã QR**.
4. Tải `qr-ptk.png` và `qr-ptr.png`, chèn vào sách/phiếu học tập. Ảnh 640 × 640 px có lề trắng; không cắt mất phần trắng.
5. In thử và dùng điện thoại bật 4G quét. Kiểm tra mở đúng mô hình rồi thử AR.

URL hai cảnh theo ví dụ:

```text
https://tenban.github.io/hat-ar/viewer.html?id=ptk
https://tenban.github.io/hat-ar/viewer.html?id=ptr
```

**Không cần sửa mã nguồn để tạo QR sau khi đăng.** Có thể tuỳ chọn điền `publicBaseUrl` trong `data/scenes.json` nếu muốn chốt một URL gốc khác. Thông thường để chuỗi rỗng là đúng; trang tự dùng địa chỉ đang mở.

Bạn cũng có thể chạy trang tạo QR trên máy và dán URL HTTPS đã được cấp. Việc tạo QR không kiểm tra được website đích đã tồn tại hay chưa: luôn mở thử và quét thật.

## 5. Điều kiện dùng AR

- Dùng URL HTTPS của Pages trên điện thoại hỗ trợ AR. Ưu tiên Chrome trên Android, Safari trên iPhone, tránh trình duyệt trong ứng dụng nhắn tin.
- Mở mô hình, đợi tải xong, bấm **Xem trong không gian thật** rồi cấp quyền camera nếu được hỏi.
- Hướng vào mặt bàn đủ sáng, di chuyển nhẹ để tìm mặt phẳng và chạm để đặt.
- Điện thoại không hỗ trợ AR vẫn xem 3D được. Desktop thường không có AR, đây không phải lỗi mất mô hình.
- Model-viewer dùng WebXR / Scene Viewer / Quick Look tuỳ thiết bị. iPhone có thể tự chuyển GLB sang USDZ; hoạt hình không được bảo đảm giữ nguyên trong chế độ này. Nếu cần hoạt hình AR đồng nhất, phải xuất USDZ phù hợp và thử riêng trên máy thật.
- Đây là AR đặt lên mặt phẳng, không phải image tracking bám vào hình trên sách.

## 6. Mô hình đã được chuẩn bị thế nào?

| Tệp | Bản web | Xử lý |
|---|---:|---|
| `ptk.glb` | 3.579.528 byte | Ghép 50 clip riêng của các hạt thành một clip `TatCaCacHat`, giữ nguyên các kênh chuyển động |
| `ptr.glb` | 5.312.948 byte | Giữ nguyên mô hình tĩnh; không tạo chuyển động giả |

Cả hai được thêm node gốc để chiều lớn nhất khoảng 24 cm, phù hợp quan sát trên mặt bàn. Các tệp gốc ở ngoài thư mục web không bị sửa. Tỉ lệ của mô hình là minh hoạ, không phải kích thước thật của hạt.

Xem `BAO_CAO_MO_HINH.md`, `data/model-analysis.json` và `KIEM_THU.md` để biết phân tích và giới hạn kiểm chứng. Chưa có video người dùng cung cấp; giao diện sẽ hiện tab video khi có `videoSrc` hợp lệ.

## 7. Cấu trúc chính

```text
index.html                 Sách lật 20 trang có QR ở bài tương ứng
sach.html                  Bản truy cập trực tiếp giao diện sách
models.html                Trang chọn hai mô hình
viewer.html?id=ptk          Thể khí
viewer.html?id=ptr          Thể rắn
qr.html                    Tạo và tải mã QR
huong-dan.html             Hướng dẫn cho học sinh
data/scenes.json           Sửa tên, mô tả, đường dẫn GLB/video
data/book.json             Nội dung các trang sách
assets/models/             Hai GLB đã chuẩn bị
assets/videos/             Chép MP4 thay thế vào đây khi có
vendor/                    Thư viện đã đóng gói, không phụ thuộc CDN lúc mở web
tools/prepare_models.py    Tái tạo bản GLB web từ file gốc, không cần chạy để đăng
```

Website bàn giao không cần npm, không cần build, không cần backend. Thư viện: `@google/model-viewer` **4.4.0**, Apache-2.0; QRCode.js **1.0.0**, MIT; StPageFlip **2.0.7**, MIT. CSS nội dung được tạo sẵn bằng Tailwind CSS **3.4.17**, MIT. Giấy phép trong `vendor/` và `NGUON_VA_GIAY_PHEP.md`.

Tham khảo: [GitHub Pages](https://docs.github.com/en/pages/quickstart), [model-viewer và AR](https://developers.google.com/ar/develop/webxr/model-viewer), [tài liệu model-viewer](https://modelviewer.dev/docs/).
