# Vịtiu — cửa hàng mỹ phẩm React + MongoDB

## Mở trong VS Code

Chọn **File → Open Folder...** và mở thư mục `vitiu-store`.

## Cài đặt lần đầu

Cần Node.js LTS. Mở Terminal tại thư mục dự án:

```powershell
npm install
npm --prefix client install
npm --prefix server install
```

Trong MongoDB Atlas, tạo database rồi lưu connection string vào `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://...connection-string...
CLIENT_ORIGIN=http://localhost:5173
AUTH_SECRET=...chuỗi bí mật ngẫu nhiên...
```

Có thể tạo chuỗi bí mật bằng lệnh PowerShell:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Không chia sẻ `server/.env` hoặc đưa tệp này lên Git. Tệp đã có trong `.gitignore`.

## Tạo tài khoản Admin đầu tiên

Sau khi cấu hình Atlas, chạy:

```powershell
npm --prefix server run create:admin
```

Nhập tên, email và mật khẩu theo hướng dẫn. Mật khẩu được băm trước khi lưu; người đăng ký trên website chỉ có quyền khách hàng. Lệnh chỉ tạo Admin đầu tiên và từ chối tạo thêm nếu đã có Admin.

## Chạy website

```powershell
npm run dev
```

Frontend thường mở tại `http://localhost:5173`; API chạy tại `http://localhost:5000`. Vite chuyển tiếp các yêu cầu `/api` tới backend. Nếu Atlas chưa cho phép địa chỉ IP của bạn hoặc connection string chưa đúng, backend sẽ báo lỗi kết nối.

## Đã kết nối

- Đăng ký và đăng nhập khách hàng qua API, với phiên trong cookie `HttpOnly`.
- Trang Admin yêu cầu tài khoản có vai trò `admin`.
- Thêm, sửa, ẩn và hiện sản phẩm qua MongoDB.
- Có thể nhập danh mục mẫu từ Admin khi database chưa có sản phẩm.
- Checkout yêu cầu đăng nhập; đơn hàng, lịch sử và trạng thái được lưu trong MongoDB.
- Admin xem tất cả đơn và cập nhật trạng thái; đơn đặt hàng trừ tồn kho trong cùng transaction.
- API sản phẩm công khai chỉ trả về sản phẩm đang bán.

## Còn ở chế độ demo

Giỏ hàng và yêu thích vẫn được lưu trên trình duyệt. Chuyển khoản/ví điện tử chưa kết nối cổng thanh toán; địa chỉ chưa được lưu vào hồ sơ; khôi phục mật khẩu, vận chuyển và đánh giá thật chưa được tích hợp. Trước khi triển khai công khai, hãy dùng HTTPS và đặt `AUTH_SECRET` ổn định, đủ dài trong môi trường production.

## Đưa bản demo lên Vercel

Dự án có `vercel.json` để Vercel build giao diện React, phục vụ tệp tĩnh qua CDN và chạy Express cho API trên cùng tên miền. Cookie đăng nhập vì vậy vẫn cùng miền.

1. Trong Vercel, chọn **Add New → Project**, import repo GitHub `nghiatran112333/vitiucuaanh` và giữ Root Directory là thư mục repo.
2. Thêm hai biến môi trường cho Production (và Preview nếu muốn): `MONGODB_URI` lấy từ Atlas, `AUTH_SECRET` là chuỗi ngẫu nhiên dài. Không commit các giá trị này vào Git.
3. Để Vercel dùng thiết lập trong `vercel.json`, build và deploy nhánh `main`.
4. Mở URL `.vercel.app` được cấp. `/api/health` hiển thị trạng thái API và kết nối MongoDB.

Gói Vercel Hobby miễn phí phù hợp cho bản demo cá nhân/phi thương mại; khi Vịtiu bắt đầu bán hàng thật, hãy nâng lên Pro trước khi nhận đơn.

API giới hạn kích thước JSON, giới hạn tốc độ yêu cầu theo IP và dùng MongoDB pool nhỏ hơn trên Vercel để giảm số kết nối đồng thời. Bộ giới hạn tốc độ lưu trong bộ nhớ từng instance; nó giúp hạn chế lạm dụng cơ bản nhưng không phải bộ giới hạn dùng chung toàn hệ thống.

**Lưu ý:** Vercel Hobby chỉ dành cho dự án phi thương mại theo điều khoản của Vercel. Một số chức năng vẫn đang ở chế độ demo; trước khi bán hàng thật, hãy nâng gói, kiểm tra thanh toán, bảo mật dữ liệu và quy trình sao lưu Atlas.

## Cấu trúc chính

- `client/src/App.jsx`: điều hướng và trạng thái frontend.
- `client/src/pages/`: các màn hình cửa hàng, tài khoản và quản trị.
- `client/src/utils/api.js`: yêu cầu API và đồng bộ danh sách sản phẩm.
- `server/src/models/`: schema MongoDB cho sản phẩm và người dùng.
- `server/src/routes/`: API tài khoản và sản phẩm.
- `server/src/middleware/auth.js`: xác minh phiên đăng nhập và quyền Admin.
