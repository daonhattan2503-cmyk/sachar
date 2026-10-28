# Sách có nội dung và QR mở đúng mô hình

## Luồng sử dụng

1. Mở trang chủ website để đọc sách 20 trang.
2. Đến trang 5 (thể rắn), dùng điện thoại quét QR: mở `viewer.html?id=ptr`.
3. Đến trang 7 (thể khí), quét QR khác: mở `viewer.html?id=ptk`.
4. Nếu đang đọc trên chính điện thoại, bấm **Mở mô hình 3D** ngay cạnh QR; không cần quét màn hình của mình.
5. Sau khi quan sát, bấm **Về trang sách** để trở lại bài vừa đọc.

QR mở trình xem 3D. Xem bằng camera và đặt mô hình lên bàn là lựa chọn AR bổ sung; không yêu cầu camera nhận diện trang sách.

## Khi chạy thử trên máy

Ô QR sẽ ghi rằng mã xuất hiện sau khi đăng HTTPS. Nút mở mô hình bên cạnh vẫn hoạt động để thử đủ luồng sách → mô hình → quay lại sách.

Khi upload toàn bộ bộ web lên GitHub Pages, script tự lấy URL gốc của website và sinh QR trong từng trang. Không phải chụp QR từ bản localhost hoặc dán QR thủ công vào mã nguồn.

Nếu đã điền `publicBaseUrl` trong `data/scenes.json`, nó phải đúng website thật. Mặc định để chuỗi rỗng để web tự lấy URL đang mở.

## Nội dung lấy ở đâu?

`data/book.json` chứa 20 trang lấy từ file `aa.html` người dùng cung cấp. Hai lỗi đã sửa: thẻ em đóng sai ở trang bay hơi và cụm “nhận nhiệt độ” thành “nhận nhiệt”. Trang 3 được viết lại hướng dẫn đúng cách đọc và quét QR. Các chủ đề bài khác được giữ theo bản gốc để nhóm tiếp tục duyệt.

Chưa phải mọi cảnh theo outline đều có mô hình. Bộ hiện tại chỉ gắn QR thật cho hai mô hình đã được cung cấp, không gắn mô hình thể rắn vào các bài không liên quan.

## Gắn mô hình mới vào một trang sách

Sau khi thêm GLB và đối tượng cảnh trong `data/scenes.json` theo hướng dẫn thay nội dung, thêm trường:

```json
"bookPage": 6
```

Đây là trường bên trong đối tượng cảnh, không phải toàn bộ JSON. Ví dụ `bookPage: 6` cho mô hình thể lỏng phù hợp nội dung trang 6. Mỗi cảnh phải có `id` riêng. Có thể gắn nhiều cảnh vào một trang bằng cách đặt cùng bookPage cho các cảnh đó.

Sách tự thêm vùng QR và nút mở mô hình tại trang đã chỉ định. QR dùng URL theo ID, không theo tên GLB; thay GLB mà giữ ID/địa chỉ website thì QR cũ vẫn dùng được.

## Sửa nội dung bài

- Mở `data/book.json`, chọn phần tử trong mảng `pages`. Phần tử đầu tiên là trang 1.
- Sửa `title`, `chapter`, `content`. Content là HTML của phần nội dung trang.
- Cẩn thận dấu nháy và dấu phẩy khi sửa JSON. Không dán HTML vào ngoài chuỗi content.
- Các màu/khung của bản gốc đã có CSS biên dịch sẵn. Khi thêm class Tailwind hoàn toàn mới, cần cập nhật CSS hoặc viết CSS riêng trong `css/book.css`; sửa câu chữ thông thường không cần build.
- Nếu nhóm sắp xếp lại thứ tự trang, sửa bookPage trong scenes.json cho khớp.

## Đọc và in

- Dùng nút trước/sau, danh sách chọn trang hoặc mục lục để lật sách.
- Dùng **Đọc dạng cuộn** khi muốn chữ dễ theo dõi hơn trên điện thoại.
- CSS in dùng nội dung dạng cuộn để không chỉ in một cặp trang đang mở. Cần xem Print Preview và in thử; chưa kiểm chứng bố cục A4/A5 chính thức trong lần sửa này.
- QR cần URL công khai đúng trước khi in. Có thể tải bản PNG lớn từ `qr.html` để đưa vào bản dàn trang in riêng.
