using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace CMS.Backend.Middlewares
{
    /// <summary>
    /// Middleware băt lỗi toàn cục (Global Exception Handler)
    /// Đảm bảo Backend không bao giờ văng ra màn hình trắng hoặc trả về text thô (raw crash)
    /// Luôn trả về cấu trúc JSON chuẩn mực cho Frontend dễ dàng parse lỗi.
    /// </summary>
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Cho phép Request đi tiếp tới các Controllers
                await _next(context);
            }
            catch (Exception ex)
            {
                // Nếu có bất kỳ lỗi nào văng ra (500 Internal Server Error)
                _logger.LogError(ex, "Lỗi hệ thống chưa được xử lý (Unhandled Exception)");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Thiết lập Header là application/json để ReactJS dùng axios.catch parse được
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; // Mặc định là 500

            // Tạo cấu trúc trả về chuẩn mực
            var response = new
            {
                statusCode = context.Response.StatusCode,
                message = "Hệ thống đang gặp sự cố. Vui lòng thử lại sau!",
                detail = exception.Message // Trong môi trường Prod nên ẩn dòng này đi để bảo mật
            };

            var jsonResponse = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(jsonResponse);
        }
    }
}
