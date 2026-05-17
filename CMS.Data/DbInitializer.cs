using CMS.Data.Entities;

namespace CMS.Data
{
    public static class DbInitializer  // ← THÊM DÒNG NÀY
    {
        public static void Initialize(CMSDbContext context)
        {
            context.Database.EnsureCreated();

            // Chỉ thêm Category nếu chưa có
            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Công nghệ" },
                    new Category { Name = "Đời sống" },
                    new Category { Name = "Du lịch" }
                );
                context.SaveChanges();
            }

            // Lấy Category đã có
            var techCat = context.Categories.FirstOrDefault(c => c.Name == "Công nghệ");
            var lifeCat = context.Categories.FirstOrDefault(c => c.Name == "Đời sống");

            // Thêm Posts (KHÔNG kiểm tra Any nữa)
            if (techCat != null)
            {
                context.Posts.AddRange(
                    new Post { Title = "Bài viết đầu tiên", Content = "Nội dung 1", ImageUrl = "https://picsum.photos/200/1", CategoryId = techCat.Id, CreatedDate = DateTime.Now },
                    new Post { Title = "Bài viết thứ hai", Content = "Nội dung 2", ImageUrl = "https://picsum.photos/200/2", CategoryId = techCat.Id, CreatedDate = DateTime.Now }
                );
            }

            if (lifeCat != null)
            {
                context.Posts.AddRange(
                    new Post { Title = "Bài viết thứ ba", Content = "Nội dung 3", ImageUrl = "https://picsum.photos/200/3", CategoryId = lifeCat.Id, CreatedDate = DateTime.Now }
                );
            }

            context.SaveChanges();
        }
    }  // ← ĐÓNG CLASS
}