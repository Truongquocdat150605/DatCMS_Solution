

/* * Tên file: Customer.cs
 * Mô tả: Thực thể lưu trữ thông tin khách hàng mua hàng.
 * Chức năng: Quản lý thông tin cá nhân, email và lịch sử mua hàng của khách.
 */
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }
        public string? Address { get; set; }

        [Required]
        public string Password { get; set; } = string.Empty;

        public virtual ICollection<Order>? Orders { get; set; }
    }
}