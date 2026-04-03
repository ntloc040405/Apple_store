# 🍎 Apple Store Website Clone - Enterprise Edition

Dự án mô phỏng cửa hàng trực tuyến của Apple với đầy đủ tính năng cho người dùng (Client) và quản trị viên (Admin Dashboard). Dự án được tối ưu hóa hiệu suất, hỗ trợ tiếng Việt toàn diện và tích hợp hệ thống báo cáo kinh doanh chuyên sâu.

## 🚀 Tính năng chính

### 🛒 Dành cho Khách hàng (Client)
- **Giao diện chuẩn Apple**: Thiết kế tối giản, sang trọng với các hiệu ứng chuyển cảnh mượt mà.
- **Tìm kiếm thông minh**: Tìm kiếm sản phẩm theo tên với tốc độ cực nhanh.
- **So sánh sản phẩm**: Bảng so sánh thông số chi tiết giữa các dòng máy Mac, iPhone, iPad.
- **Quản lý giỏ hàng & Yêu thích**: Thêm, sửa, xóa sản phẩm và lưu lại các sản phẩm yêu thích.
- **Tài khoản cá nhân**: Xem lịch sử đơn hàng và quản lý thông tin cá nhân.
- **Đa dạng tùy chọn**: Chọn màu sắc, dung lượng và xem giá thay đổi tương ứng.

### 📊 Dành cho Quản trị viên (Admin Dashboard)
- **Bảng điều khiển (Dashboard)**: Biểu đồ doanh thu (Area Chart), doanh thu theo danh mục (Bar Chart), và phân bổ trạng thái đơn hàng (Pie Chart).
- **Quản lý Sản phẩm**: Thêm, sửa, xóa và quản lý tồn kho sản phẩm.
- **Quản lý Đơn hàng**: Theo dõi và cập nhật trạng thái đơn hàng (Chờ xử lý, Đã xác nhận, Đang giao, Đã giao, Đã hủy).
- **Quản lý Người dùng**: Xem danh sách khách hàng và phân quyền quản trị.
- **Quản lý Banner**: Tùy chỉnh các banner quảng cáo trên trang chủ.
- **Báo cáo chuyên sâu**: Xuất dữ liệu kinh doanh ra file Excel (CSV) và tự động lưu trữ bản sao tại thư mục `excel/` của dự án.

## 🏗️ Cấu trúc thư mục

```text
Apple/
├── client/        # Giao diện người dùng (React + Vite)
├── admin/         # Trang quản trị (React + Vite)
├── server/        # API và Logic máy chủ (Node.js + Express)
├── excel/         # Thư mục lưu trữ các báo cáo đã xuất
└── README.md      # Tài liệu dự án
```

## 🛠️ Công nghệ sử dụng

- **Frontend**: React.js, Lucide Icons, Recharts (Biểu đồ), Tailwind/CSS.
- **Backend**: Node.js, Express, MongoDB.
- **State Management**: React Context API.
- **Tools**: Vite, pnpm/npm.

## 🏁 Hướng dẫn cài đặt và chạy

### 1. Khởi động Server (API)
```bash
cd server
pnpm install
pnpm run dev
```
*Lưu ý: Bạn cần cấu hình file `.env` với `MONGO_URI` và `JWT_SECRET`.*

### 2. Khởi động Client
```bash
cd client
pnpm install
pnpm dev
```

### 3. Khởi động Admin Dashboard
```bash
cd admin
pnpm install
pnpm dev
```

## 📈 Tối ưu hóa gần đây
- **Localization**: Chuyển đổi toàn bộ giao diện và báo cáo sang tiếng Việt 100%.
- **Performance**: Khắc phục lỗi "Cascading Render" bằng cách tối ưu hóa `useEffect` và đồng bộ hóa state trong render-phase.
- **Fast Refresh**: Tách rời Reducer và Context để đảm bảo tính năng Hot Reload hoạt động ổn định.
- **Local Archiving**: Tự động lưu bản sao báo cáo Excel vào local folder giúp truy xuất nhanh chóng.

---
*Dự án được thực hiện bởi Team Apple Store Clone.*