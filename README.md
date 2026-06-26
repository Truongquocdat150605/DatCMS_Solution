# 🔥 CMS Store E-Commerce - Hệ Thống Bán Hàng Trực Tuyến

Chào mừng đến với **CMS Store**, một hệ thống quản lý nội dung và bán hàng trực tuyến được phát triển trên kiến trúc 3 phân tầng chuẩn mực, kết hợp giữa sức mạnh của .NET Core (Backend) và ReactJS (Frontend).

---

## 🛠️ Công Nghệ Sử Dụng

- **Backend:** ASP.NET Core MVC & Web API (.NET 8)
- **Frontend:** ReactJS (Component-based, React Router, Context API)
- **Cơ sở dữ liệu:** SQL Server (sử dụng Entity Framework Core)
- **Giao diện:** Bootstrap 5, Vanilla CSS
- **Bảo mật:** Cookie Authentication, CORS (AllowReactApp), [Authorize] Roles
- **Công cụ:** Visual Studio 2022, VS Code, Git/GitHub

---

## 📁 Cấu Trúc Thư Mục (Tree Structure)

Dự án được tuân thủ nghiêm ngặt theo mô hình 3 lớp (3-Tiers Architecture):

```text
CMS_Project/
│
├── 📂 CMS.Data/                 # (Tầng 1: Data Access Layer)
│   ├── CMSDbContext.cs          # File kết nối Entity Framework Core với CSDL
│   └── Entities/                # Chứa 8+ thực thể Database (Product, Order, User...)
│
├── 📂 CMS.Backend/              # (Tầng 2: Business Logic & API)
│   ├── Controllers/             # Quản lý giao diện MVC Admin (Render Views)
│   ├── Controllers/Api/         # Cung cấp dữ liệu (JSON) cho Frontend ReactJS
│   ├── Views/                   # Giao diện Admin bằng Razor (.cshtml)
│   ├── appsettings.json         # Chứa chuỗi kết nối SQL Server, Secret Keys
│   └── Program.cs               # Cấu hình Middleware, lai giữa MVC và Web API
│
└── 📂 cms.frontend/             # (Tầng 3: Presentation Layer)
    ├── public/                  # Chứa file tĩnh (ảnh, index.html)
    ├── src/                     # Toàn bộ mã nguồn ReactJS
    │   ├── components/          # Giao diện dùng chung (Header, Footer, Chatbot...)
    │   ├── core_modules/        # Xử lý Logic: Gọi API (axios), Context API
    │   ├── pages/               # Chứa các giao diện trang (Home, Cart, Checkout...)
    │   ├── styles/              # Các file CSS tự thiết kế, giao diện hiện đại
    │   └── App.js               # Khai báo định tuyến (Routes)
    └── package.json             # Khai báo thư viện NPM
```

---

## 🌟 Chức Năng Nổi Bật

### 🖥️ Màn hình Khách hàng (Frontend - ReactJS)
- Hiển thị danh sách Sản phẩm và Bài viết với tính năng Phân trang mượt mà.
- Tìm kiếm sản phẩm thông minh và Lọc sản phẩm theo danh mục.
- Hiển thị Banner động, đồng bộ trực tiếp từ Database.
- Giỏ hàng (Cart) lưu trữ Local, tính tổng tiền tự động, tự thay đổi số lượng.
- Luồng thanh toán Checkout an toàn, validate form kỹ càng.
- Hệ thống tạo Đơn hàng tự động qua API.

### ⚙️ Màn hình Quản trị (Admin - .NET MVC)
- Đăng nhập bảo mật (Session/Cookie) với tính năng Role-based (Admin).
- Giao diện Layout Sidebar thông minh, linh hoạt.
- Quản lý toàn diện dữ liệu (CRUD) cho 8 bảng: User, Post, Category, Product, Customer, Order...
- Tính năng **Quản lý Banner**: Thêm/Sửa/Xóa ảnh quảng cáo ngoài trang chủ.
- Chi tiết Đơn hàng hiện đại: Cho phép **Xóa từng món hoặc Xóa tất cả sản phẩm** trực tiếp trong đơn.
- Tích hợp CKEditor viết bài chuyên nghiệp.

---

## 🚀 Hướng Dẫn Cài Đặt Và Khởi Chạy

### Yêu cầu hệ thống:
- SQL Server Management Studio (SSMS)
- Visual Studio 2022 (cho Backend)
- NodeJS (cho Frontend)

### Bước 1: Khởi động Backend (API & Admin)
1. Mở Solution bằng Visual Studio.
2. Thiết lập dự án `CMS.Backend` làm **Startup Project**.
3. Cập nhật Connection String trong file `appsettings.json` cho phù hợp với máy của bạn.
4. Chạy lệnh Migration nếu chưa có database: `Update-Database`.
5. Nhấn **F5** để chạy dự án. Mặc định Backend sẽ chạy ở cổng `https://localhost:7048`.

### Bước 2: Khởi động Frontend (ReactJS)
1. Mở thư mục `cms.frontend` bằng Terminal (hoặc VS Code).
2. Chạy lệnh cài đặt thư viện: 
   ```bash
   npm install
   ```
3. Khởi động máy chủ phát triển React:
   ```bash
   npm start
   ```
4. Website mua sắm sẽ được tự động bật lên tại `http://localhost:3000`.

---
*Developed with ♥ by Trương Quốc Đạt.*
