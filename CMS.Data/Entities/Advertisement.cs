using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    /// <summary>
    /// Bảng lưu trữ thông tin Banner/Quảng cáo hiển thị trên giao diện
    /// </summary>
    public class Advertisement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? LinkUrl { get; set; }

        public int DisplayOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
