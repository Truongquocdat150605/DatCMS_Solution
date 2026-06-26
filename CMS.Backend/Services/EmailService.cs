using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace CMS.Backend.Services
{
    // Interface định nghĩa các hàm gửi Mail
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlMessage);
    }

    // Class thực thi gửi Mail thông qua cấu hình SMTP
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            // Lấy thông tin cấu hình từ appsettings.json
            var emailSettings = _config.GetSection("EmailSettings");
            string host = emailSettings["Host"] ?? "smtp.gmail.com";
            int port = int.Parse(emailSettings["Port"] ?? "587");
            string email = emailSettings["Username"]!;
            string password = emailSettings["Password"]!;

            var mailMessage = new MailMessage
            {
                From = new MailAddress(email, "CMS Store"),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true // Chấp nhận nội dung là HTML
            };
            mailMessage.To.Add(toEmail);

            using var smtpClient = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(email, password),
                EnableSsl = true // Bảo mật khi dùng Gmail
            };

            // Tiến hành gửi email bất đồng bộ
            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
