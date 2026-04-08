# 🍎 Apple Store Modern Full-Stack - Premium Edition

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer--Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

## 🌟 Tổng quan dự án

Đây là phiên bản nâng cấp toàn diện của hệ thống Apple Store Full-Stack. Dự án không chỉ tập trung vào giao diện chuẩn Apple sang trọng mà còn tích hợp hệ thống quản trị **Real-time** mạnh mẽ và quy trình triển khai **Docker** chuyên nghiệp.

---

## 🚀 Tính năng nổi bật

### ⚡ Real-time Admin Dashboard

- **Đồng bộ tức thì**: Nhận thông báo đơn hàng (Notification Bell), cập nhật sản phẩm và danh mục ngay lập tức qua Socket.io mà không cần tải lại trang.
- **Hiệu ứng Premium**: Các con số thống kê tự động nhảy (Count-up animation) và danh sách hiển thị mượt mà với Framer Motion.
- **Silent Refresh**: Hệ thống tự động cập nhật dữ liệu ngầm, đảm bảo trải nghiệm quản trị không bị gián đoạn bởi các màn hình loading.

### 🎨 Trải nghiệm Người dùng (Client)

- **Thiết kế tinh tế**: Giao diện tối giản, hiệu ứng chuyển cảnh chuẩn Apple.
- **Chức năng đầy đủ**: Giỏ hàng, Yêu thích, Tìm kiếm thông minh và quy trình thanh toán mượt mà.

### 🐳 Triển khai Docker chuyên nghiệp

- **Một lệnh duy nhất**: Khởi chạy toàn bộ hệ thống (Server, Client, Admin, Database) chỉ với `docker-compose`.
- **Nginx Production**: Sử dụng Nginx làm web server cho các ứng dụng React, tối ưu hóa tốc độ và bảo mật.

---

## 🏗️ Cấu trúc thư mục

```text
Apple/
├── server/        # Backend API (Node.js/Express + Socket.io)
├── client/        # Giao diện khách hàng (Vite/React)
├── admin/         # Trang quản trị hiện đại (Vite/React + Framer Motion)
├── docker-compose.yml  # Cấu hình điều phối container
└── .gitignore     # Quản lý mã nguồn monorepo
```

---

## 🏁 Hướng dẫn khởi chạy

### 🐳 Cách 1: Sử dụng Docker (Khuyên dùng - Không cần cài đặt Database)

Yêu cầu: Máy đã cài đặt Docker & Docker Compose. **Đặc biệt: Bạn không cần cài đặt MongoDB Compass vì hệ thống đã tích hợp sẵn giao diện quản trị Web.**

1. **Khởi chạy toàn bộ hệ thống**:

    ```bash
    # Bước 1: Tạo cấu hình từ mẫu
    cp .env.example .env

    # Bước 2: Build và chạy container
    docker-compose up --build -d
    ```

2. **Truy cập các dịch vụ**:
    - **Client (Người mua)**: `http://localhost:3000`
    - **Admin (Quản lý)**: `http://localhost:4001`
    - **API Server**: `http://localhost:5001`
    - **Database UI (Thay thế Compass)**: `http://localhost:8081` (Dùng để xem và sửa dữ liệu trực tiếp trên trình duyệt)

### 🛠️ Cách 2: Khởi chạy thủ công (Dành cho Developer)

1. **Khởi tạo Database**: Đảm bảo MongoDB đang chạy tại cổng 27017.

2. **Setup Server**:

    ```bash
    cd server
    npm install
    npm run dev
    ```

3. **Setup Frontends**:

    ```bash
    # Terminal 1 (Client)
    cd client && npm install && npm run dev

    # Terminal 2 (Admin)
    cd admin && npm install && npm run dev
    ```

---

## 🔑 Biến môi trường (Environment Variables)

Xem chi tiết tại các tệp mẫu:

- [Server .env.example](server/.env.example)
- [Client .env.example](client/.env.example)
- [Admin .env.example](admin/.env.example)

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: React.js, Vite, Framer Motion, Recharts, Lucide React.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io.
- **Infrastructure**: Docker, Docker Compose, Nginx Alpine.

---

*Dự án được hiện đại hóa với ❤️ để mang lại trải nghiệm thương mại điện tử đẳng cấp nhất.*
