# Cơm Nhà

Web tiếng Việt tổng hợp 479 món ăn từ 8 sheet trong file “Thực Đơn Cơm Nhà Tổng Hợp.xlsx”. HTML/CSS/JavaScript thuần, không cần cài package để chạy web.

## Chạy local

Yêu cầu Node.js 22 trở lên.

```sh
npm run dev
```

Mở http://127.0.0.1:4173. Chạy kiểm tra logic bằng `npm test`.

## Tính năng

- Tìm tên món có hoặc không dấu; lọc 12 nhóm món và cách chế biến.
- Random một món theo bộ lọc và mục đang xem.
- Random mâm cơm từ toàn bộ dữ liệu: món chính, rau, canh; đổi riêng từng món.
- Lưu yêu thích, chốt bữa ăn và xem lịch sử trên trình duyệt bằng localStorage.
- Mặc định random loại món đã chốt trong 7 ngày; không tự bỏ điều kiện khi hết món.
- Giao diện responsive; minh họa nhóm thực phẩm, không phải ảnh thực tế món ăn.

## Dữ liệu

`data/menu.json` giữ tên, phân loại, cách chế biến và sheet/dòng nguồn của từng món. Không suy diễn công thức, thời gian nấu hay nguyên liệu từ tên món. Món chay giữ đúng nhóm riêng trong file; rau hoặc đậu không được tự coi là món chay. Gợi ý mâm cơm là cách ghép nhóm món, không phải đánh giá dinh dưỡng.

Import lại khi file Excel thay đổi (Python có package openpyxl):

```sh
python3 scripts/import_menu.py '/duong/dan/Thực Đơn Cơm Nhà Tổng Hợp.xlsx'
```

`logic.js`: tìm/lọc và random. `app.js`: giao diện và trạng thái trình duyệt. `styles.css`: giao diện. Có thể host tĩnh bằng cách đưa `index.html`, `app.js`, `logic.js`, `styles.css`, `data/` lên hosting. Font Google có font hệ thống dự phòng. Chưa có backend hoặc đồng bộ nhiều thiết bị.

## Deploy Vercel

`npm run build` tạo `dist/` chỉ chứa các file phục vụ web. Cấu hình `vercel.json` chọn static site, build command `npm run build`, output `dist`. Không cần biến môi trường.
