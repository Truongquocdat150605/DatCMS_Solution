/* * Tên file: Program.cs
 * Dự án: CMS_Project - Backend
 * Mô tả: File cấu hình chính của ứng dụng ASP.NET Core MVC.
 * Chức năng: Thiết lập các dịch vụ (Services), cấu hình Middleware, 
 * định tuyến (Routing) và là điểm khởi động của hệ thống.
 */

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình các dịch vụ cho Container (Dependency Injection)
builder.Services.AddControllersWithViews();

// Sau này bạn sẽ thêm cấu hình Database (DbContext) tại đây:
// builder.Services.AddDbContext<CMSDbContext>(...);

var app = builder.Build();

// 2. Cấu hình HTTP request pipeline (Middleware)
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection(); // Tự động chuyển hướng sang HTTPS
app.UseStaticFiles();      // Cho phép sử dụng các file tĩnh (css, js, images)

app.UseRouting();          // Kích hoạt hệ thống định tuyến

app.UseAuthorization();    // Kích hoạt hệ thống phân quyền

// 3. Định nghĩa cấu hình Route mặc định
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run(); // Bắt đầu chạy ứng dụng