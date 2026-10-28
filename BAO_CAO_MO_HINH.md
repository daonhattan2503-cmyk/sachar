# Phân tích tài nguyên người dùng gửi

Ngày kiểm tra: 28/10/2026. Phân tích cấu trúc GLB 2.0 và mở hai bản web trong trình duyệt máy tính. Không sửa các tệp gốc.

## Hai GLB chính

| Thuộc tính | ptk.glb gốc | ptr.glb gốc |
|---|---:|---:|
| Dung lượng (byte) | 3.583.172 | 5.315.764 |
| Mesh | 51 | 209 |
| Đỉnh (tổng theo primitive) | 99.392 | 154.816 |
| Clip hoạt hình | 50 | 0 |
| Ảnh nhúng | 0 | 0 |
| Nguồn xuất trong metadata | Blender glTF I/O 5.2.41 | Blender glTF I/O 5.2.41 |

`ptk`: bình trụ và 50 hạt màu xanh, mỗi hạt có clip riêng dài khoảng 10,42 giây. Nếu chỉ phát clip đầu trong viewer, không phát được chuyển động của cả 50 hạt cùng lúc. Bản web ghép 50 clip thành một clip tên `TatCaCacHat`, tổng 100 kênh, giữ dữ liệu sampler và BIN gốc. Công cụ kiểm tra không có kênh target trùng trước khi ghép.

`ptr`: các hạt đỏ, thanh nối và bình chứa; không có clip hoạt hình. Website hiển thị là cấu trúc tĩnh và lưu ý không thể hiện dao động của hạt. Không tạo hoạt hình giả để báo có chuyển động.

Cả hai có kích thước hình học gốc lớn nhất 6 đơn vị theo cách diễn giải mét của glTF. Bản web thêm node gốc có scale 0,04, đặt đáy ở 0 và căn giữa theo trục ngang, cho kích thước lớn nhất khoảng 0,24 m. Hình học, vật liệu và dữ liệu nhị phân hình học/hoạt hình không bị thay thế. Có thể thu/phóng trong AR khi nền tảng cho phép.

`ptr` dùng `KHR_materials_clearcoat`; không có extension bắt buộc. Hai tệp không dùng nén Draco hoặc KTX2 và không cần ảnh bề mặt ngoài. Độ trong suốt/ánh sáng có thể khác giữa trình xem 3D và từng nền tảng AR.

## Tệp người dùng gọi là raw

Tệp thực tế là `Công nghệ giáo dục tiên tiến.rar`, định dạng RAR5, khoảng 40,42 MB. Nó là gói nén tài nguyên, không phải định dạng hiển thị AR.

| Tệp trong RAR | Dung lượng (byte) | Mesh | Clip |
|---|---:|---:|---:|
| chu trình nước nén.glb | 7.157.096 | 10 | 2 |
| chu trình nước.glb | 48.866.816 | 10 | 2 |
| khí.glb | 1.684.880 | 3 | 0 |
| lỏng.glb | 3.172.896 | 6 | 0 |
| rắn.glb | 1.060.940 | 1 | 0 |

Bản chu trình nước nén có `EXT_texture_webp`; bản gốc có `KHR_materials_ior` và `KHR_materials_specular`. Mô hình lỏng có `KHR_materials_transmission`. Chưa kiểm tra hiển thị và chuyển đổi AR của các tài nguyên này trong lần triển khai hai mô hình.

Không đưa RAR và năm GLB trong đó vào bộ web để giữ phạm vi hai tệp chính. Nếu bổ sung chu trình nước sau, ưu tiên kiểm tra bản nén thay vì đưa ngay bản gần 49 MB vào luồng quét 4G.

## Giới hạn

- Chưa xác minh tác giả và giấy phép của các mô hình người dùng gửi; không tự gán CC0 hoặc giấy phép nguồn mở.
- Chưa đánh giá mức phù hợp từng câu với SGK cụ thể; lời mô tả trong web cần nhóm nội dung duyệt trước khi dạy chính thức.
- Chưa thử AR, hoạt hình Quick Look và tỉ lệ mặt bàn trên điện thoại thật.
- Chưa đo tải 4G và chưa xác nhận đạt dưới 5 giây. Xem 3D trên máy tính không thay thế các kiểm tra này.

Chi tiết máy đọc được ở `data/model-analysis.json`. Công cụ tái tạo là `tools/prepare_models.py`; công cụ đọc `ptk.glb`, `ptr.glb` ở thư mục cha của bộ web và chỉ ghi các bản web trong `assets/models/`.
