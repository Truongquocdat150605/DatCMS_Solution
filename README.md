# 🚀 CMS BACKEND PROJECT - QUẢN TRỊ NỘI DUNG & BÁN HÀNG

### 👤 Thông tin sinh viên thực hiện
* **Họ và tên:** Trương Quốc Đạt
* **MSSV:** 2123110209
* **Chuyên ngành:** An ninh mạng (Cyber Security)
* **Học phần:** Phát triển ứng dụng Web (Buổi 03)

---

## 📝 Giới thiệu dự án
Dự án được xây dựng bằng framework **ASP.NET Core MVC**, mục tiêu là xây dựng hệ thống quản trị (Backend) cho một website tích hợp cả tin tức và bán hàng. Hệ thống cho phép quản lý danh mục, bài viết, sản phẩm và khách hàng một cách tối ưu.

## 📂 Cấu trúc dự án (Project Structure)
Dự án được tổ chức theo mô hình MVC (Model-View-Controller) chuẩn:

* **`CMS.Backend/Controllers/`**: Chứa các bộ điều khiển xử lý logic nghiệp vụ (Product, Category, Order...).
* **`CMS.Backend/Views/`**: Chứa giao diện người dùng (Razor Pages).
* **`CMS.Data/Entities/`**: Chứa các thực thể Database (Customer, Product, Post...).
* **`CMS.Data/CMSDbContext.cs`**: Cấu hình kết nối cơ sở dữ liệu thông qua Entity Framework Core.
* **`wwwroot/`**: Chứa các file tĩnh như CSS (Giao diện Admin Sidebar), JS, và thư viện Bootstrap.

## 🛠 Tính năng nổi bật
- [x] **Giao diện Admin hiện đại:** Sử dụng Sidebar điều hướng chuyên nghiệp.
- [x] **CRUD Toàn diện:** Thêm, sửa, xóa, liệt kê cho hơn 5 bảng dữ liệu.
- [x] **Xử lý ràng buộc:** Chặn xóa danh mục khi đang có dữ liệu con để bảo vệ Database.
- [x] **Chống trùng lặp:** Tự động kiểm tra tên danh mục/sản phẩm khi thêm mới.
- [x] **Validation:** Kiểm tra dữ liệu đầu vào phía Server-side.

## ⚙️ Hướng dẫn cài đặt
1. Clone dự án: `git clone [Link-Git-Cua-Dat]`
2. Cấu hình chuỗi kết nối trong `appsettings.json`.
3. Chạy lệnh Migration để tạo Database:
   ```bash
   dotnet ef database update
