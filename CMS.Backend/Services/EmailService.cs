using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace CMS.Backend.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");

            string host = emailSettings["Host"] ?? "smtp.gmail.com";
            int port = int.Parse(emailSettings["Port"] ?? "587");
            string username = emailSettings["Username"] ?? throw new InvalidOperationException("Email Username is not configured.");
            string password = emailSettings["Password"] ?? throw new InvalidOperationException("Email Password is not configured.");
            bool enableSSL = bool.Parse(emailSettings["EnableSSL"] ?? "true");

            var mailMessage = new MailMessage
            {
                From = new MailAddress(username, "CMS PC Store"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            using var smtpClient = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = enableSSL
            };

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
