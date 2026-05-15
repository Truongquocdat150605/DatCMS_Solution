//Truong Quoc Dat
//MSSV:2123110209

/* * Tên file: User.cs
 * Mô tả: Thực thể lưu trữ thông tin nhân viên quản trị (Admin/Editor).
 * Chức năng: Phục vụ chức năng đăng nhập và phân quyền trong hệ thống quản lý.
 */

namespace CMS.Data.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
    }
}