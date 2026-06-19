Đồ án: Hệ thống quản trị Nội dung & Bán hàng (CMS Backend)
Dự án được xây dựng nhằm đáp ứng yêu cầu của học phần Phát triển ứng dụng Web. Mục tiêu chính là xây dựng một hệ thống backend kết hợp giữa trang tin tức và bán hàng, cho phép quản lý dữ liệu một cách chặt chẽ và tối ưu bằng mô hình MVC.

1. Thông tin sinh viên thực hiện
Họ và tên: Trương Quốc Đạt
MSSV: 2123110209
Chuyên ngành: An ninh mạng (Cyber Security)
Học phần: Phát triển ứng dụng Web (Buổi 03)
2. Danh sách các tính năng nổi bật
Giao diện Quản trị: Xây dựng Dashboard cho Admin với Sidebar điều hướng rõ ràng để quản lý hệ thống.
Thao tác CRUD toàn diện: Thực hiện các chức năng Thêm, Đọc, Sửa, Xóa cho hơn 5 bảng dữ liệu trong CSDL (Danh mục, Sản phẩm, Bài viết, Khách hàng, Đơn hàng).
Kiểm soát ràng buộc dữ liệu: Chặn việc xóa danh mục nếu danh mục đó vẫn đang chứa sản phẩm hoặc bài viết con, tránh tình trạng rác hoặc lỗi dữ liệu.
Kiểm tra trùng lặp (Unique constraint): Tự động phát hiện và cảnh báo nếu người dùng nhập trùng tên danh mục hoặc sản phẩm đã tồn tại.
Server-side Validation: Validate chặt chẽ dữ liệu gửi lên từ người dùng ở phía Server trước khi thực thi lệnh lưu vào CSDL.
3. Công nghệ sử dụng (Tech Stack)
Ngôn ngữ & Framework: C#, ASP.NET Core MVC
Cơ sở dữ liệu: Microsoft SQL Server
ORM: Entity Framework Core (Code-First)
Frontend (Giao diện Admin): Razor Pages, HTML/CSS, JavaScript, Bootstrap 5
4. Cấu trúc thư mục dự án
Dự án tuân thủ mô hình kiến trúc phân lớp và MVC. Cấu trúc thư mục chính (rút gọn) bao gồm:

text

DatCMS_Solution/
├── CMS.Backend/                   # Project chính xử lý logic Web và API
│   ├── Controllers/               # Các Controller tiếp nhận và xử lý request
│   ├── Views/                     # Các file giao diện Razor Pages (.cshtml)
│   ├── wwwroot/                   # Nơi chứa các tài nguyên tĩnh (CSS, JS, Images)
│   └── appsettings.json           # File cấu hình hệ thống (Chuỗi kết nối CSDL)
├── CMS.Data/                      # Class Library chuyên trách truy xuất dữ liệu
│   ├── Entities/                  # Khai báo các thực thể (Models) tương ứng CSDL
│   ├── Migrations/                # Lịch sử và các bản cập nhật cấu trúc CSDL
│   └── CMSDbContext.cs            # Cấu hình kết nối Entity Framework Core
└── README.md                      # Tài liệu mô tả và hướng dẫn dự án
5. Hướng dẫn cài đặt chi tiết
Dưới đây là các bước để tải và cài đặt dự án lên máy cá nhân.

Bước 1: Tải source code Mở terminal và gõ lệnh sau để clone dự án từ Github:

bash

git clone https://github.com/Truongquocdat150605/DatCMS_Solution.git
cd DatCMS_Solution
Bước 2: Cấu hình kết nối CSDL Mở file appsettings.json trong dự án CMS.Backend và thay đổi chuỗi DefaultConnection cho phù hợp với máy của bạn:

json

"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=CMS_Database;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
Bước 3: Khởi tạo Cơ sở dữ liệu (Migration) Mở Terminal tại thư mục gốc, chạy lệnh sau để Entity Framework tự động tạo cấu trúc các bảng trong SQL Server:

bash

dotnet ef database update --project CMS.Data --startup-project CMS.Backend
(Nếu máy chưa cài EF Core tool, hãy chạy lệnh dotnet tool install --global dotnet-ef trước).

6. Hướng dẫn chạy dự án
Bước 1: Khởi động server Mở Terminal ở thư mục CMS.Backend và gõ:

bash

dotnet run
Hoặc bạn có thể mở dự án bằng Visual Studio 2022 và bấm nút Run (F5).

Bước 2: Truy cập ứng dụng Mở trình duyệt web và điền vào thanh địa chỉ:

https://localhost:7048
(Lưu ý cổng 7048 có thể thay đổi tùy theo cấu hình hiển thị trên terminal của bạn).

Tại đây, bạn có thể sử dụng thanh điều hướng bên trái để thao tác Thêm, Sửa, Xóa trên các danh mục và sản phẩm.
