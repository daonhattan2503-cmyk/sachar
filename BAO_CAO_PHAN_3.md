# PHẦN 3. QUY TRÌNH THỰC HIỆN VÀ CÁCH LÀM

## 3.1. Ý tưởng thiết kế và kịch bản học tập

Sản phẩm được thiết kế dưới dạng sách học tập tương tác cho bài “Các thể của chất và sự chuyển thể” (Khoa học tự nhiên 6). Mỗi nội dung kiến thức được tổ chức theo mạch: quan sát hiện tượng - dự đoán - quét mã QR - quan sát mô hình 3D chuyển động - rút ra kết luận.

Mô hình 3D chỉ xuất hiện tại những trang có kiến thức vi mô hoặc quá trình biến đổi khó quan sát trực tiếp. Mã QR đặt ngay cạnh nội dung liên quan để học sinh không phải tìm liên kết ở nơi khác. Sau khi quét, học sinh mở được mô hình trong trình duyệt điện thoại, xoay, phóng to, dừng/phát chuyển động và, trên thiết bị hỗ trợ, đặt mô hình vào không gian thật.

Hệ thống hiện có 12 cảnh 3D, gắn với các nội dung sau:

| Trang sách | Nội dung | Mã cảnh |
|---:|---|---|
| 5 | Cấu trúc thể rắn | `the-ran` |
| 6 | Thể lỏng | `the-long` |
| 7 | Chuyển động thể khí | `the-khi` |
| 9 | Sự nóng chảy | `nong-chay` |
| 10 | Sự đông đặc | `dong-dac` |
| 11 | Sự bay hơi | `bay-hoi` |
| 13 | Sự ngưng tụ | `ngung-tu` |
| 14 | Sự sôi | `su-soi` |
| 17 | Chu trình nước trong tự nhiên | `chu-trinh-nuoc` |
| 19 | Làm muối từ nước biển | `lam-muoi-tu-nuoc-bien` |
| 21 | Làm nến: nóng chảy và đông đặc | `lam-nen` |
| 22 | Sự hình thành sương mù | `suong-mu` |

## 3.2. Công cụ sử dụng

| Công việc | Công cụ/giải pháp |
|---|---|
| Dựng và kiểm tra mô hình | Blender 5.2 |
| Xử lý tự động mô hình | Python |
| Hiển thị 3D trên web | `<model-viewer>` 4.4.0 |
| Tạo mã QR | QRCode.js 1.0.0 |
| Xuất bản website | GitHub Pages qua HTTPS |
| Kiểm tra cấu trúc tệp | Script Node.js `tools/check.mjs` |

## 3.3. Quy trình xử lý mô hình 3D

### Bước 1. Xác định yêu cầu từng mô hình

Với mỗi bài học, nhóm xác định hiện tượng cần thể hiện, số lượng và trạng thái các hạt, màu sắc, các chi tiết minh hoạ, thời lượng chuyển động và thông tin học sinh cần quan sát. Ví dụ: thể rắn nhấn mạnh dao động quanh vị trí cố định; thể lỏng nhấn mạnh sự trượt qua nhau; thể khí nhấn mạnh chuyển động tự do; các quá trình chuyển thể thể hiện sự thay đổi cách sắp xếp của hạt.

### Bước 2. Chuẩn bị tệp GLB

Mô hình gốc được lưu riêng trong thư mục `3D/`. Script `tools/prepare_models.py` đọc bản gốc và tạo bản dùng cho website trong `assets/models/`; tệp gốc không bị chỉnh sửa.

Khi một mô hình chứa nhiều đoạn hoạt hình riêng cho từng hạt, script gộp chúng thành một hoạt hình duy nhất có tên `TatCaCacHat`. Cách làm này giúp toàn bộ hạt chuyển động đồng thời trong trình xem web thay vì chỉ phát chuyển động của một hạt.

### Bước 3. Chuẩn hoá để xem bằng AR

Trong quá trình tạo bản web, mô hình được bổ sung một node gốc `WebAR_Tabletop_24cm`, căn đáy về mặt phẳng đặt AR và điều chỉnh chiều lớn nhất xấp xỉ 24 cm. Việc chuẩn hoá này giúp mô hình vừa với mặt bàn khi học sinh mở AR, đồng thời vẫn giữ nguyên dữ liệu hình học và hoạt hình của bản gốc.

### Bước 4. Kiểm tra mô hình

Mỗi bản GLB được kiểm tra cấu trúc, sự tồn tại của hoạt hình, tên hoạt hình, các kênh chuyển động và tệp tài nguyên đi kèm. Lệnh `node tools/check.mjs` kiểm tra các tệp mô hình, đường dẫn QR, cấu hình trang sách và tính toàn vẹn của dữ liệu nhị phân.

### Bước 5. Chuẩn bị bản AR cho iPhone

Từ bản GLB đã chuẩn hoá, Blender xuất thêm tệp USDZ vào `assets/models-ios/`. Trên iPhone, hệ thống dùng tệp USDZ này khi mở AR Quick Look để giữ chuyển động tương ứng với mô hình web. Bản GLB dùng trên web vẫn được giữ nguyên.

## 3.4. Kỹ thuật Web AR và mã QR

Mỗi cảnh được khai báo trong `data/scenes.json`, gồm tiêu đề, số trang sách, đường dẫn GLB, đường dẫn USDZ cho iPhone, tên hoạt hình và trạng thái có hoạt hình. Từ dữ liệu này, trang sách tự tạo đúng mã QR cho từng bài.

Khi học sinh quét QR, điện thoại mở liên kết dạng `viewer.html?id=<ma-canh>`. Trang xem tải mô hình 3D tương ứng, tự phát hoạt hình và cung cấp các thao tác xoay, phóng to, dừng/phát. Nút “Xem trong không gian thật” gọi chế độ AR của thiết bị:

- Android ưu tiên WebXR hoặc Scene Viewer.
- iPhone dùng Quick Look với tệp USDZ tương ứng.
- Nếu điện thoại không hỗ trợ AR, học sinh vẫn có thể xem và tương tác với mô hình 3D trên trình duyệt.

Website được triển khai qua GitHub Pages bằng HTTPS, vì camera và AR trên điện thoại cần một địa chỉ web an toàn. Mã QR chỉ chứa đường dẫn của cảnh học tập, không chứa tệp mô hình trực tiếp; do đó khi mô hình được cập nhật, QR của trang đó vẫn tiếp tục hoạt động.

## 3.5. Kết quả và giới hạn kiểm thử

Sản phẩm đã có 12 QR liên kết với 12 mô hình 3D theo đúng các trang bài học. Các mô hình hỗ trợ hoạt hình được tự phát trong trình duyệt; ba mô hình cập nhật gần nhất (Làm muối, Làm nến và Sương mù) cũng đã được tạo lại ở cả định dạng GLB và USDZ.

Việc kiểm tra tự động xác nhận đường dẫn mô hình, định dạng GLB, hoạt hình đã gộp, tệp USDZ và liên kết QR công khai. Tuy nhiên, việc đánh giá trải nghiệm AR vẫn cần được thử trên điện thoại thật, trong điều kiện mạng và ánh sáng của lớp học, trước khi sử dụng đại trà.

## 3.6. Minh chứng đề xuất đưa vào báo cáo Word

1. Ảnh chụp trang sách có mã QR ở các bài Thể rắn, Thể lỏng, Thể khí và một bài vận dụng.
2. Ảnh màn hình Blender với mô hình hạt và timeline hoạt hình.
3. Ảnh trang xem 3D trên điện thoại sau khi quét QR.
4. Ảnh mô hình được đặt trong không gian thật bằng AR.
5. Ảnh kho mã nguồn GitHub và đường dẫn GitHub Pages của dự án.
