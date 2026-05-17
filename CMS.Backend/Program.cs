/* * Tên file: Program.cs
 * Dự án: CMS_Project - Backend
 * Mô tả: File cấu hình chính của ứng dụng ASP.NET Core MVC.
 * Chức năng: Thiết lập các dịch vụ (Services), cấu hình Middleware, 
 * định tuyến (Routing) và là điểm khởi động của hệ thống.
 */

using CMS.Data; // Thêm dòng này để nó hiểu CMSDbContext
using Microsoft.EntityFrameworkCore; // Thêm dòng này để dùng lệnh UseSqlServer

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình các dịch vụ cho Container (Dependency Injection)
builder.Services.AddControllersWithViews();

// --- THÊM ĐOẠN NÀY ĐỂ KẾT NỐI DATABASE ---
builder.Services.AddDbContext<CMSDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
// ----------------------------------------

var app = builder.Build();

// 2. Cấu hình HTTP request pipeline (Middleware)
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CMSDbContext>();
    DbInitializer.Initialize(context);
}

// 3. Định nghĩa cấu hình Route mặc định
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();