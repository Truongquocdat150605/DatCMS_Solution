/* 
 * Người thực hiện: Trương Quốc Đạt - 2123110209
 * Nội dung: Cấu hình chuẩn cho Buổi 06 - Swagger & API
 */

using CMS.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
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
    options.AddPolicy("AllowReactFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Rất quan trọng để truyền Cookie giữa 2 port khác nhau
    });
});

// Kết nối DB
builder.Services.AddDbContext<CMSDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký Memory Cache cho OTP
builder.Services.AddMemoryCache();

// Đăng ký Email Service
builder.Services.AddScoped<CMS.Backend.Services.IEmailService, CMS.Backend.Services.EmailService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "CookieAuth";
    options.DefaultChallengeScheme = "CookieAuth";
})
.AddCookie("CookieAuth", options =>
{
    options.Cookie.Name = "CookieAuth";
    options.Cookie.HttpOnly = true;

    // SecurePolicy: Bắt buộc dùng HTTPS để cho phép gửi cookie cross-origin
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

    // None: Cho phép gửi cookie cross-site giữa React (3000) và Backend (7048)
    options.Cookie.SameSite = SameSiteMode.None;

    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Account/AccessDenied";

    options.SlidingExpiration = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
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

app.UseCors("AllowReactFrontend"); // Bật CORS hỗ trợ Cookie cho React

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