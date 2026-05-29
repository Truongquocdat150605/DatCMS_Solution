/* 
 * Người thực hiện: Trương Quốc Đạt - 2123110209
 * Nội dung: Cấu hình chuẩn cho Buổi 06 - Swagger & API
 */

using CMS.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models; // Dùng cho Swagger UI

var builder = WebApplication.CreateBuilder(args);

// 1. CẤU HÌNH DỊCH VỤ (SERVICES)
// Fix lỗi vòng lặp dữ liệu JSON cho Đạt
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Cấu hình Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CMS API PC Store",
        Version = "v1",
        Description = "API quản lý CMS - Đồ án Trương Quốc Đạt",
        Contact = new OpenApiContact
        {
            Name = "Trương Quốc Đạt",
            Email = "2123110209@student.edu.vn"
        }
    });
});

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// Kết nối DB
builder.Services.AddDbContext<CMSDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication & Authorization (Buổi 05) - Phiên bản đầy đủ
builder.Services.AddAuthentication("CookieAuth")
    .AddCookie("CookieAuth", options =>
    {
        options.Cookie.Name = "UserLoginCookie";
        options.LoginPath = "/Account/Login";
        options.AccessDeniedPath = "/Account/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromDays(14);
        options.SlidingExpiration = true;
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// 2. CẤU HÌNH PIPELINE (MIDDLEWARE)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CMS API V1");
        c.RoutePrefix = "swagger"; // Truy cập tại /swagger
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors("AllowAll"); // Bật CORS ở đây

app.UseAuthentication();
app.UseAuthorization();

// Seed Data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CMSDbContext>();
    DbInitializer.Initialize(context);
}

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Account}/{action=Login}/{id?}");

app.Run();