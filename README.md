# 🌌 NASA APOD Gallery — Dual View Gallery

Trang web tĩnh xem **Ảnh Thiên Văn Trong Ngày (Astronomy Picture of the Day)** của NASA, lấy dữ liệu trực tiếp từ NASA Open APIs. Giao diện lấy cảm hứng từ GitHub Primer, hỗ trợ 2 chế độ sáng/tối, phân trang và xem chi tiết dạng modal.

## ✨ Tính năng

- **Tải 10 ảnh ngẫu nhiên** từ NASA APOD khi mở trang.
- **Xem theo ngày**: chọn một ngày (không được chọn ngày tương lai) để xem ảnh của ngày đó.
- **Lọc theo chủ đề**: Thiên hà, Tinh vân, Hệ Mặt Trời, Trái Đất & Bầu trời — phân loại tự động dựa trên tiêu đề và mô tả.
- **Phân trang**: 2 ảnh/trang, nút Trước/Sau và hiển thị `Trang x / y`.
- **Xem chi tiết (Modal)**: click vào ảnh để phóng to, xem mô tả đầy đủ, tải ảnh HD và copy link.
- **Tải ảnh HD** trực tiếp về máy (có fallback mở tab mới nếu bị CORS chặn).
- **Đổi giao diện Sáng/Tối (Light/Dark)**, lưu lựa chọn vào `localStorage`.
- **Xử lý trạng thái đầy đủ**: đang tải (spinner), lỗi API (flash error), rỗng (không có ảnh khớp bộ lọc).
- **Ảnh/video**: APOD đôi khi trả về video — trang sẽ nhúng iframe thay vì thẻ `<img>`.
- **Responsive**: lưới 2 cột trên desktop, 1 cột trên mobile (≤768px).

## 🗂 Cấu trúc dự án

```
.
├── index.html   # Cấu trúc trang: header, bộ điều khiển, lưới ảnh, modal, footer
├── style.css    # Biến CSS theo chủ đề (dark/light), layout Grid, component kiểu GitHub Primer
└── app.js       # Gọi NASA API, phân loại chủ đề, lọc, phân trang, render, modal, tải ảnh
```

Không có bước build, không phụ thuộc package manager — mở trực tiếp là chạy.

## 🛠 Công nghệ

| Thành phần | Sử dụng |
| --- | --- |
| Ngôn ngữ | HTML5, CSS3 (Custom Properties, Grid), JavaScript ES6+ (async/await, Fetch API) |
| Dữ liệu | [NASA APOD API](https://api.nasa.gov/planetary/apod) |
| Biểu tượng | [Octicons](https://cdnjs.cloudflare.com/ajax/libs/Octicons/19.8.0/build.css) (CDN) |
| Giao diện | GitHub Primer CSS style (tự viết lại trong `style.css`) |

## 🚀 Cách chạy

Vì trang dùng `fetch`, bạn nên chạy qua một web server thay vì mở file trực tiếp:

```bash
# Cách 1: Python
python3 -m http.server 8000

# Cách 2: Node (npx)
npx serve .
```

Sau đó mở `http://localhost:8000`.

## 🔑 Cấu hình API Key

`app.js` có hằng số ở đầu file:

```js
const API_KEY = '...';       // thay bằng key của bạn
const BASE_URL = 'https://api.nasa.gov/planetary/apod';
```

- Lấy key miễn phí tại [https://api.nasa.gov/](https://api.nasa.gov/) (đăng ký sẽ nhận key `DEMO_KEY` dùng thử, giới hạn ~30 request/giờ và ~50/ngày).
- **Không commit API key thật của bạn vào repository công khai** — key nhúng trong mã phía client luôn có thể nhìn thấy. Nếu cần bảo mật, hãy đặt key ở tầng server hoặc dùng cơ chế proxy.

## 📖 Cách sử dụng

| Thao tác | Kết quả |
| --- | --- |
| Mở trang | Tự động tải 10 ảnh ngẫu nhiên |
| Chọn ngày | Tải ảnh của ngày đã chọn |
| Chọn chủ đề | Lọc bộ ảnh hiện tại theo chủ đề |
| **Tải bộ ảnh mới** / **Ngẫu nhiên 10 ảnh** | Gọi API lấy 10 ảnh mới |
| Click vào ảnh | Mở modal xem chi tiết |
| **⬇️ Tải ảnh HD** | Tải file ảnh chất lượng cao |
| **📋 Copy** | Sao chép link ảnh vào clipboard |
| 🌙 / ☀️ (góc phải header) | Đổi giao diện sáng/tối |
| `Esc` hoặc click nền tối | Đóng modal |

## 📂 Luồng xử lý dữ liệu

```
fetchApodList(count=10 | date=YYYY-MM-DD)
        │
        ▼
detectCategory(item)      → gắn nhãn chủ đề cho từng ảnh
        │
        ▼
applyCategoryFilter()     → lọc theo dropdown (all / galaxy / nebula / solar / earth)
        │
        ▼
renderCurrentPage()       → cắt 2 phần tử cho trang hiện tại
        │
        ├── renderGallery()      → dựng card + gắn sự kiện
        └── updatePaginationUI() → cập nhật nút/trạng thái phân trang
```

## ⚠️ Ghi chú & giới hạn

- Phân loại chủ đề chỉ là **heuristic dựa trên từ khóa** trong title/explanation, không phải phân loại chính thức của NASA — một số ảnh có thể bị xếp nhầm hoặc rơi vào nhóm "🚀 Vũ trụ".
- Khi lọc theo chủ đề, bộ lọc chỉ áp trên 10 ảnh đã tải (không gọi lại API), nên một số chủ đề có thể không có ảnh.
- Ảnh hiển thị trong thẻ là bản thường (`url`); modal hiển thị bản HD (`hdurl`) khi có.
- Việc tải ảnh có thể phụ thuộc CORS; nếu thất bại, ứng dụng sẽ mở ảnh trong tab mới.

## 📄 Giấy phép & Nguồn dữ liệu

- Ảnh và mô tả: [NASA APOD](https://apod.nasa.gov/apod/astropix.html) — thuộc bản quyền của các tác giả/nhà thiên văn học được NASA ghi nhận; sử dụng theo [chính sách truyền thông của NASA](https://www.nasa.gov/nasa-brand-center/images-and-media/).
- Dữ liệu API: [api.nasa.gov](https://api.nasa.gov/) (giấy phép NASA open data).

---
© 2026 — hoana2007