using System;

namespace CMS.Backend.Helpers
{
    /// <summary>
    /// Lớp tiện ích hỗ trợ mã hoá mật khẩu một chiều (One-way Hashing)
    /// Đảm bảo không lưu mật khẩu thô (raw password) xuống database theo tiêu chuẩn bảo mật.
    /// Sử dụng thư viện BCrypt.Net-Next
    /// </summary>
    public static class PasswordHelper
    {
        /// <summary>
        /// Mã hoá mật khẩu với chuỗi Salt ngẫu nhiên được tự động sinh ra bởi BCrypt.
        /// WorkFactor mặc định là 11 (Cân bằng giữa tốc độ và độ bảo mật).
        /// </summary>
        /// <param name="rawPassword">Mật khẩu người dùng nhập vào</param>
        /// <returns>Chuỗi hash bảo mật để lưu vào DB</returns>
        public static string HashPassword(string rawPassword)
        {
            if (string.IsNullOrWhiteSpace(rawPassword))
                throw new ArgumentException("Mật khẩu không được để trống.");

            // BCrypt tự động sinh Salt và nhúng kèm vào chuỗi Hash kết quả
            return BCrypt.Net.BCrypt.HashPassword(rawPassword, workFactor: 11);
        }

        /// <summary>
        /// So sánh mật khẩu người dùng nhập lúc Đăng nhập với chuỗi Hash trong DB
        /// </summary>
        /// <param name="rawPassword">Mật khẩu lúc đăng nhập</param>
        /// <param name="hashedPassword">Mật khẩu đã mã hoá lấy từ DB</param>
        /// <returns>True nếu trùng khớp, False nếu sai</returns>
        public static bool VerifyPassword(string rawPassword, string hashedPassword)
        {
            if (string.IsNullOrWhiteSpace(rawPassword) || string.IsNullOrWhiteSpace(hashedPassword))
                return false;

            try
            {
                // Verify tự động tách Salt từ chuỗi hashedPassword để kiểm tra
                return BCrypt.Net.BCrypt.Verify(rawPassword, hashedPassword);
            }
            catch (Exception)
            {
                // Nếu chuỗi hash trong DB không phải là chuẩn BCrypt thì trả về false
                return false; 
            }
        }
    }
}
