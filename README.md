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

## Đưa website lên Render

Dự án có sẵn `render.yaml`. Render sẽ build React rồi dùng Express phục vụ cả giao diện và API trên cùng tên miền. Nhờ vậy cookie đăng nhập tiếp tục hoạt động cùng miền.

1. Đưa dự án lên một **repo GitHub Private**. `.env` và các biến môi trường `server/.env.*` đã bị loại khỏi Git; không đưa chuỗi MongoDB hoặc khóa bí mật vào mã nguồn.
2. Trong Render, chọn **New → Blueprint**, kết nối repo GitHub và chọn `render.yaml`.
3. Khi Render hỏi `MONGODB_URI`, nhập chuỗi kết nối Atlas trong ô bí mật. Blueprint tự tạo `AUTH_SECRET`.
4. Trong MongoDB Atlas, cho phép kết nối từ Render theo hướng dẫn IP access list của Atlas. Dùng tài khoản database riêng cho ứng dụng, không dùng tài khoản quản trị Atlas.
5. Deploy xong, mở URL `onrender.com` do Render cấp. Endpoint `/api/health` cho biết API đang chạy và MongoDB có kết nối hay không.

Blueprint hiện đặt một máy chủ `0.5c-512mb` (giá Render đang niêm yết là **7 USD/tháng**, chưa gồm phí workspace, băng thông vượt mức hoặc thuế). Đây là điểm bắt đầu luôn hoạt động, không phải cấu hình tự mở rộng. Muốn tự tăng số máy khi CPU/RAM tăng, Render yêu cầu workspace Pro **25 USD/tháng**, cộng chi phí từng máy chủ. Khi cần, có thể đặt autoscale từ 1 đến 3 máy và theo dõi hóa đơn trước khi tăng giới hạn.

API giới hạn kích thước JSON, giới hạn tốc độ yêu cầu theo IP, và giữ MongoDB pool tối đa 20 kết nối trên mỗi máy chủ. Bộ giới hạn hiện lưu trong bộ nhớ của từng máy; nó giúp chặn tải bất thường cơ bản, còn bảo vệ ở quy mô lớn cần thêm CDN/WAF hoặc bộ giới hạn dùng chung. Không có cấu hình hosting nào bảo đảm website không bao giờ gián đoạn; cần theo dõi log, cảnh báo và tình trạng Atlas sau khi deploy.

**Lưu ý trước khi nhận đơn thật:** tài liệu hiện mô tả một số chức năng vẫn ở chế độ demo. Hãy kiểm tra thanh toán, bảo mật dữ liệu và quy trình sao lưu Atlas trước khi bán hàng thực tế.

## Cấu trúc chính

- `client/src/App.jsx`: điều hướng và trạng thái frontend.
- `client/src/pages/`: các màn hình cửa hàng, tài khoản và quản trị.
- `client/src/utils/api.js`: yêu cầu API và đồng bộ danh sách sản phẩm.
- `server/src/models/`: schema MongoDB cho sản phẩm và người dùng.
- `server/src/routes/`: API tài khoản và sản phẩm.
- `server/src/middleware/auth.js`: xác minh phiên đăng nhập và quyền Admin.
