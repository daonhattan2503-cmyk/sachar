# Thay GLB, thêm video và giữ nguyên QR

## Đổi nội dung một cảnh

Mở `data/scenes.json`, tìm cảnh có `"id": "ptk"` hoặc `"id": "ptr"`. Sửa `title`, `shortTitle`, `description`, `observations`, `motionNote` theo nội dung nhóm đã kiểm chứng. Không đổi ID nếu đã in QR.

JSON không cho phép chú thích, không để dấu phẩy thừa ở cuối. Giữ dấu ngoặc và dấu nháy kép.

## Thay mô hình GLB

1. Chép tệp thật vào `assets/models/`, ví dụ `ptk-v2.glb`.
2. Ở cảnh `ptk`, sửa `modelSrc` thành `assets/models/ptk-v2.glb`.
3. Sửa `sizeLabel` cho khớp dung lượng tệp mới.
4. Nếu có hoạt hình, điền `animationName` đúng tên clip. Nếu không biết tên, để chuỗi rỗng; viewer dùng clip đầu tiên nếu có.
5. Sửa `hasAnimation` và `motionNote` cho khớp mô hình. Viewer kiểm tra clip thật để quyết định hiện nút phát/dừng.
6. Đăng lại tệp mới cùng JSON lên GitHub. Dùng link cảnh/QR cũ để thử.

Đường dẫn tính từ gốc website. Dùng `assets/models/ptk-v2.glb`, không dùng `/assets/models/...` hoặc `E:\...`. Trên GitHub, chữ hoa/thường phải khớp.

Mô hình mới nên có kích thước theo mét phù hợp AR. Viewer không tự chuẩn hoá mọi tệp mới bạn chép vào. Hai GLB bàn giao đã được chuẩn bị cỡ mặt bàn; không cần chạy lại công cụ Python để đăng.

Nếu bản mới có nhiều clip tách theo từng hạt như `ptk.glb` gốc, cần ghép những clip tương thích để cùng chạy. Không ghép các clip thay thế nhau hoặc trùng kênh chuyển động tuỳ tiện.

## Thêm video thay thế

1. Chuẩn bị MP4 thật, nên dùng mã hoá tương thích thiết bị như H.264/AAC.
2. Chép vào `assets/videos/`, ví dụ `ptk.mp4`.
3. Sửa `videoSrc` của cảnh `ptk` thành `assets/videos/ptk.mp4`.
4. Giữ `defaultView` là `3d` nếu muốn mở mô hình trước. Đổi thành `video` nếu muốn phát video trước.
5. Đăng lại video và JSON. Tab **Video minh hoạ** sẽ xuất hiện.

Ví dụ **đối tượng cảnh** hợp lệ trong mảng `scenes` (không phải toàn bộ tệp JSON):

```json
{
  "id": "ptk",
  "title": "Chuyển động thể khí",
  "shortTitle": "Thể khí",
  "kicker": "01 / CHUYỂN ĐỘNG CỦA CÁC HẠT",
  "theme": "gas",
  "description": "Quan sát cách các hạt chuyển động trong bình chứa.",
  "observations": ["Kéo để xoay mô hình.", "Tạm dừng hoạt hình để quan sát."],
  "motionNote": "Có hoạt hình minh hoạ.",
  "modelSrc": "assets/models/ptk.glb",
  "iosSrc": "",
  "videoSrc": "assets/videos/ptk.mp4",
  "posterSrc": "",
  "defaultView": "video",
  "animationName": "TatCaCacHat",
  "sizeLabel": "3,58 MB",
  "hasAnimation": true
}
```

Chỉ điền đường dẫn video sau khi đã chép video thật. URL trang xem YouTube hoặc trang chia sẻ Google Drive không phải URL MP4 trực tiếp dùng được với trường này.

## Thêm poster hoặc USDZ

- Chép ảnh vào `assets/posters/`, điền `posterSrc`, ví dụ `assets/posters/ptk.jpg`.
- Nếu có USDZ đã xuất và kiểm tra, chép vào thư mục mô hình và điền `iosSrc`, ví dụ `assets/models/ptk.usdz`.
- Không đổi đuôi `.glb` thành `.usdz`. Đây là hai định dạng khác nhau.
- Khi `iosSrc` rỗng, model-viewer có thể chuyển đổi tự động cho Quick Look. Kiểm tra riêng hoạt hình và vật liệu trên iPhone trước khi dạy.

## Tại sao QR cũ vẫn dùng được?

QR mở `viewer.html?id=ptk` hoặc `viewer.html?id=ptr`, không mở trực tiếp tên tệp GLB. Bạn có thể thay GLB/video và nội dung mà URL cảnh vẫn giữ nguyên.

Đổi tài khoản/tên repo làm thay URL, đổi tên `viewer.html`, hoặc đổi ID có thể làm QR cũ không mở đúng nữa. Nếu `publicBaseUrl` được điền, phải sửa nó khi đổi địa chỉ hosting; để rỗng thì website tự dùng thư mục đang mở.

## Cập nhật GitHub

Chép tệp mới lên repo và commit thay đổi. Hoặc trong PowerShell của repo:

```powershell
git add .
git commit -m "Update model content"
git push
```

Chờ Pages cập nhật rồi mở bản công khai. Sửa tệp trên máy mà chưa push/upload thì website chưa đổi.

Để hạn chế cache, dùng tên mới như `ptk-v2.glb` / `ptk-v2.mp4` rồi sửa JSON. Trường hợp giữ nguyên tên, thử tải lại trang hoặc xoá cache khi thấy bản cũ.

## Lỗi thường gặp

| Lỗi | Cách kiểm tra |
|---|---|
| Không mở được danh sách | Chạy qua HTTP server, kiểm tra JSON và đường dẫn `data/scenes.json` |
| GLB 404 | Tệp thật đã được commit chưa? Tên và chữ hoa/thường có đúng không? |
| Chỉ thấy trang trắng | Mở bằng HTTP/HTTPS, giữ đủ thư mục `js`, `css`, `data`, `vendor` |
| Không có AR trên máy tính | Thử trên điện thoại hỗ trợ AR qua URL HTTPS |
| Không có AR trong app nhắn tin | Mở lại bằng Safari/Chrome của điện thoại |
| Video không phát | Kiểm tra codec và URL trực tiếp, không chỉ đuôi MP4 |
| Mô hình mới quá lớn/nhỏ trong AR | Kiểm tra đơn vị và kích thước trong phần mềm dựng; xuất lại bản phù hợp |
| QR trỏ sai repo | Dùng URL website Pages, không dùng URL github.com; kiểm tra publicBaseUrl |
| Không tải QR được trong trình duyệt nhúng | Mở bằng Safari/Chrome hoặc máy tính rồi tải lại |

Mục tiêu GLB dưới 10 MB và tải dưới 5 giây qua 4G cần đo trên tệp và thiết bị thật. Dung lượng nhỏ không tự bảo đảm đủ tốc độ.
