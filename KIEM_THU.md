# Kết quả kiểm tra

## Cập nhật font ngày 29/10/2026

- Đổi tiêu đề và nội dung sang Be Vietnam Pro, đóng gói năm tệp TTF đầy đủ dấu tiếng Việt trong assets/fonts.
- Kiểm tra hiển thị trang 4–5 trên máy tính và trang 5 ở viewport 390 × 844; chữ có dấu hiển thị đều, không tràn ngang.
- Kiểm tra CSS thực tế của tiêu đề dùng Be Vietnam Pro với line-height 28,5 px trên máy tính.
- Dùng chung font trên sách, gallery, viewer, hướng dẫn và trang QR; thêm phiên bản URL stylesheet để tránh dùng nhầm CSS cũ.

## Cập nhật sách kèm QR

- [x] Trang chủ đã là sách lật 20 trang lấy từ aa.html; thư viện và CSS phục vụ cục bộ.
- [x] Trang 5 có QR/nút mở ptr; trang 7 có QR/nút mở ptk; không gắn QR sai cho các bài chưa có mô hình.
- [x] Kiểm tra nút trang 5 mở viewer ptr thật và liên kết quay về index.html?page=5.
- [x] Dùng URL công khai mẫu riêng cho kiểm thử, giải mã QR trong ảnh chụp trang 5/7 thành đúng URL ptr/ptk. Sau kiểm tra đã xoá URL mẫu khỏi cấu hình bàn giao.
- [x] QR nằm đúng trong khung bài, không bị stylesheet canvas của thư viện lật sách đẩy ra góc trang.
- [x] Cấu hình bàn giao publicBaseUrl rỗng để tự dùng địa chỉ Pages sau khi đăng.
- [ ] Bố cục in A4/A5 và quét bản in thật còn cần kiểm tra riêng.

- [x] Chuyển đọc cuộn rồi trở lại sách lật không lỗi; mục lục hiện đủ 20 trang và đánh dấu đúng trang có QR.
- [x] Bài tập trang 15 giữ được phản hồi đúng/sai sau khi chuyển nội dung sang data/book.json.
- [x] Bản sách trên viewport 390 × 844 không tràn ngang; trang 7 có nút mở đúng ptk.
- [x] Sau khi khôi phục cấu hình rỗng, bản localhost hiện hướng dẫn chờ URL HTTPS, không giữ QR URL mẫu trong bản bàn giao.

Ngày 28/10/2026. Kiểm tra qua HTTP server cục bộ và trình duyệt máy tính trong app; không triển khai lên tài khoản GitHub của người dùng.

## Đã kiểm tra

- [x] JavaScript qua `node --check`, không lỗi cú pháp.
- [x] `node tools/check.mjs`: đủ tài nguyên, GLB 2.0 đúng header/kích thước, hai tệp dưới 10 MB, giữ nguyên BIN gốc sau xử lý.
- [x] Bản ptk có một clip `TatCaCacHat` với 100 kênh không trùng target, các sampler đúng chỉ mục; ptr vẫn không có hoạt hình.
- [x] Bounds của bản ptk khoảng 0,16 × 0,24 × 0,16 m; ptr khoảng 0,24 × 0,24 × 0,24 m; đáy ở Y=0.
- [x] Mở trang chủ, chọn từng mô hình và tải được mô hình thật trong viewer, không dùng ảnh thay mô hình.
- [x] Thể khí phát hoạt hình, nút tạm dừng đổi sang phát lại; thể rắn không có nút hoạt hình giả.
- [x] Bật tự xoay góc nhìn, thuộc tính nút chuyển sang pressed.
- [x] Màn hình điện thoại mô phỏng 390 × 844 và 360 × 780 không tràn ngang; đây chỉ là kiểm tra bố cục, không giả lập khả năng AR của điện thoại.
- [x] ID cảnh không tồn tại có thông báo và điều hướng về trang chủ.
- [x] Chia sẻ trên localhost hiện thông báo bản thử và vô hiệu hoá xuất QR localhost.
- [x] Trang QR tạo được hai mã với URL mẫu dành riêng cho thử nghiệm.
- [x] Dùng jsQR 1.4.0 giải mã ảnh chụp hai QR, đọc đúng `https://example.com/hat-ar/viewer.html?id=ptk` và `...id=ptr`. Đây là URL thử nghiệm, không phải bản web đã triển khai và không dùng để in cho lớp.
- [x] Chặn URL localhost, IP nội bộ, HTTP và link repository github.com; thử thêm bằng kiểm tra hàm.
- [x] Chặn kết quả QR cũ khi URL mới không hợp lệ.
- [x] URL builder giữ được thư mục con của project site.
- [x] Thư viện được đóng gói cục bộ; không cần tải model-viewer/QRCode.js từ CDN trong luồng mở web thông thường.

Ảnh kiểm chứng lưu ngoài thư mục triển khai, trong `ar-work/screenshots/` của workspace. Thư viện giải mã QR chỉ phục vụ kiểm thử, không là phụ thuộc của sản phẩm.

## Chưa xác nhận / cần kiểm tra sau khi đăng

- [ ] Triển khai thật lên GitHub Pages của người dùng và mở URL công khai qua 4G.
- [ ] In QR và quét bằng camera điện thoại thật.
- [ ] Cấp quyền camera, nhận mặt phẳng, đặt mô hình, ánh sáng và tỉ lệ trong phòng học thật.
- [ ] Hoạt hình/vật liệu trong WebXR, Android Scene Viewer và iPhone Quick Look.
- [ ] Thời gian tải mới trên 4G có đạt dưới 5 giây không.
- [ ] Video thay thế: chưa được cung cấp MP4 nên chưa kiểm tra phát video thật; tab chỉ hiện khi thêm videoSrc.
- [ ] Xác nhận lưu PNG vào hệ thống tệp trong Safari/Chrome thông thường. Trình duyệt kiểm thử trong app không trả được sự kiện tải xuống; đã kiểm tra được ảnh QR trên canvas và giải mã thành công. Nếu trình duyệt nhúng không cho tải, dùng trình duyệt hệ thống hoặc máy tính.
- [ ] Kiểm chứng nội dung với SGK và xác nhận nguồn/giấy phép mô hình.

## Bảng thử trên máy thật

| Cảnh | Máy / trình duyệt | Mạng | Tải lần đầu | 3D | AR | Hoạt hình | Lỗi / bản sửa |
|---|---|---|---|---|---|---|---|
| ptk | Chưa thử | Chưa thử | Chưa đo | Chờ | Chờ | Chờ | |
| ptr | Chưa thử | Chưa thử | Chưa đo | Chờ | Chờ | Mô hình tĩnh | |

Ghi lại kết quả thật, không đổi các dòng chưa thử thành đạt chỉ dựa trên việc mở được 3D trên máy tính.
