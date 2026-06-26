/* * Người thực hiện: Trương Quốc Đạt - MSSV: 2123110209
 * Tên file: DbInitializer.cs
 * Mô tả: Khởi tạo dữ liệu mẫu phong phú cho cửa hàng thiết bị máy tính.
 * Bao gồm: VGA, CPU, RAM, SSD, Mainboard, Tản nhiệt, Nguồn, Case, Màn hình, Bàn phím, Chuột
 */

using CMS.Data.Entities;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace CMS.Data
{
    public static class DbInitializer
    {
        public static void Initialize(CMSDbContext context)
        {
            context.Database.EnsureCreated();

            context.Database.ExecuteSqlRaw(@"
                IF COL_LENGTH('Users', 'Email') IS NULL
                BEGIN
                    ALTER TABLE Users ADD Email NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Users_Email DEFAULT('');
                END

                UPDATE Users
                SET Email = CASE
                    WHEN Username = 'admin' AND (Email IS NULL OR Email = '') THEN 'admin@cms.local'
                    WHEN Username = 'editor' AND (Email IS NULL OR Email = '') THEN 'editor@cms.local'
                    ELSE Email
                END
                WHERE Email IS NULL OR Email = '';
            ");

            // Nếu đã có dữ liệu thì bỏ qua (tránh seed trùng)
            if (context.Users.Any()) return;

            // =============================================
            // 1. BẢNG USER (Quản trị viên hệ thống)
            // =============================================
            var users = new User[]
            {
                new User { Username = "admin", Email = "admin@cms.local", PasswordHash = "123456", FullName = "Trương Quốc Đạt - Admin", Role = "Admin" },
                new User { Username = "editor", Email = "editor@cms.local", PasswordHash = "123456", FullName = "Nguyễn Văn Biên Tập", Role = "Editor" }
            };
            context.Users.AddRange(users);

            // =============================================
            // 2. BẢNG CATEGORY (Danh mục bài viết)
            // =============================================
            var categories = new Category[]
            {
                new Category { Name = "Tin Công Nghệ", Description = "Cập nhật xu hướng phần cứng và công nghệ mới nhất" },
                new Category { Name = "Hướng Dẫn Build PC", Description = "Cách lắp ráp, nâng cấp và tối ưu hiệu năng máy tính" },
                new Category { Name = "Review & Đánh Giá", Description = "Đánh giá chi tiết linh kiện và thiết bị máy tính" },
                new Category { Name = "Khuyến Mãi & Sự Kiện", Description = "Chương trình giảm giá và sự kiện của cửa hàng" }
            };
            context.Categories.AddRange(categories);
            context.SaveChanges();

            // =============================================
            // 3. BẢNG POST (Bài viết)
            // =============================================
            var posts = new Post[]
            {
                new Post
                {
                    Title = "RTX 5090 chính thức ra mắt: Hiệu năng khủng, giá 'chát'",
                    Content = "<p>NVIDIA vừa chính thức công bố dòng card đồ họa RTX 5090 với kiến trúc Blackwell thế hệ mới. Card được trang bị 32GB GDDR7, băng thông 1792 GB/s và hiệu năng ray-tracing vượt trội so với thế hệ trước đến 70%.</p><p>Dự kiến ra mắt Q1/2025 với mức giá khởi điểm 1999 USD tại thị trường quốc tế.</p>",
                    CategoryId = categories[0].Id,
                    CreatedDate = DateTime.Now.AddDays(-10),
                    ImageUrl = "https://placehold.co/800x400/1a1a2e/00d4ff?text=RTX+5090"
                },
                new Post
                {
                    Title = "Intel Core Ultra 9 285K vs AMD Ryzen 9 9950X: Ai mạnh hơn?",
                    Content = "<p>Cuộc chiến CPU đầu bảng năm 2025 giữa hai ông lớn Intel và AMD ngày càng gay cấn hơn. Trong bài test tổng hợp Cinebench R24, Ryzen 9 9950X ghi điểm cao hơn 15% đơn nhân, trong khi Core Ultra 9 285K lại chiếm ưu thế trong các tác vụ đa luồng nhờ kiến trúc P-core / E-core hybrid.</p>",
                    CategoryId = categories[2].Id,
                    CreatedDate = DateTime.Now.AddDays(-7),
                    ImageUrl = "https://placehold.co/800x400/0f3460/ffffff?text=CPU+Battle"
                },
                new Post
                {
                    Title = "Hướng dẫn Build PC Gaming 30 triệu đồng năm 2025",
                    Content = "<p>Với ngân sách 30 triệu đồng, bạn hoàn toàn có thể sở hữu một bộ PC Gaming hiệu năng cao để chiến mọi tựa game AAA ở độ phân giải 1440p, 144Hz mượt mà.</p><h3>Cấu hình gợi ý:</h3><ul><li>CPU: AMD Ryzen 7 7800X3D</li><li>VGA: RTX 4070 Ti Super</li><li>RAM: 32GB DDR5 6000MHz</li><li>SSD: 1TB NVMe Gen4</li></ul>",
                    CategoryId = categories[1].Id,
                    CreatedDate = DateTime.Now.AddDays(-5),
                    ImageUrl = "https://placehold.co/800x400/533483/ffffff?text=Build+PC+30tr"
                },
                new Post
                {
                    Title = "Review DDR5 Kingston Fury Beast 32GB: Xứng đáng nâng cấp?",
                    Content = "<p>Kingston Fury Beast DDR5 6000MHz CL30 là một trong những bộ RAM DDR5 được yêu thích nhất hiện nay nhờ mức giá hợp lý và hiệu năng ổn định. Trong bài review hôm nay, chúng tôi sẽ test thực tế trên nền tảng Intel LGA1700 và AMD AM5.</p>",
                    CategoryId = categories[2].Id,
                    CreatedDate = DateTime.Now.AddDays(-3),
                    ImageUrl = "https://placehold.co/800x400/16213e/64ffda?text=DDR5+Review"
                },
                new Post
                {
                    Title = "Sale cuối năm: Giảm đến 25% toàn bộ linh kiện PC",
                    Content = "<p>Nhân dịp năm mới 2025, TechPC Store triển khai chương trình giảm giá lớn nhất trong năm với hàng trăm sản phẩm VGA, CPU, RAM, SSD được giảm giá từ 10% đến 25%. Chương trình kéo dài từ 25/12 đến 31/12/2024.</p>",
                    CategoryId = categories[3].Id,
                    CreatedDate = DateTime.Now.AddDays(-1),
                    ImageUrl = "https://placehold.co/800x400/e94560/ffffff?text=SALE+25%25"
                }
            };
            context.Posts.AddRange(posts);

            // =============================================
            // 4. BẢNG CUSTOMER (Khách hàng)
            // =============================================
            var customers = new Customer[]
            {
                new Customer { FullName = "Trần Văn Mạnh", Email = "manh.tran@gmail.com", Phone = "0901234567", Address = "123 Lê Lợi, Q.1, TP.HCM", Password = "123456" },
                new Customer { FullName = "Nguyễn Thị Hoa", Email = "hoa.nguyen@gmail.com", Phone = "0912345678", Address = "456 Nguyễn Huệ, Q.1, TP.HCM", Password = "123456" },
                new Customer { FullName = "Lê Hoàng Nam", Email = "nam.le@gmail.com", Phone = "0987654321", Address = "789 Hai Bà Trưng, Q.3, TP.HCM", Password = "123456" }
            };
            context.Customers.AddRange(customers);
            context.SaveChanges();

            // =============================================
            // 5. DANH MỤC SẢN PHẨM (CategoryProduct)
            // =============================================
            var catProducts = new CategoryProduct[]
            {
                new CategoryProduct { Name = "VGA - Card Màn Hình", Description = "NVIDIA GeForce, AMD Radeon" },
                new CategoryProduct { Name = "CPU - Bộ Vi Xử Lý", Description = "Intel Core, AMD Ryzen" },
                new CategoryProduct { Name = "RAM - Bộ Nhớ", Description = "DDR4, DDR5 các thương hiệu" },
                new CategoryProduct { Name = "SSD - Ổ Cứng Thể Rắn", Description = "NVMe Gen3, Gen4, Gen5, SATA SSD" },
                new CategoryProduct { Name = "Mainboard - Bo Mạch Chủ", Description = "ASUS, MSI, Gigabyte, ASRock" },
                new CategoryProduct { Name = "Tản Nhiệt - Cooling", Description = "Tản nhiệt khí, tản nhiệt nước AIO" },
                new CategoryProduct { Name = "Nguồn Máy Tính - PSU", Description = "80+ Gold, Platinum, Titanium" },
                new CategoryProduct { Name = "Case - Vỏ Máy Tính", Description = "Mid Tower, Full Tower, ITX" },
                new CategoryProduct { Name = "Màn Hình - Monitor", Description = "IPS, VA, OLED, 144Hz, 240Hz" },
                new CategoryProduct { Name = "Bàn Phím & Chuột", Description = "Cơ học, gaming, không dây" }
            };
            context.CategoryProducts.AddRange(catProducts);
            context.SaveChanges();

            // =============================================
            // 6. BẢNG PRODUCT (Sản phẩm - 30 sản phẩm)
            // =============================================
            var products = new Product[]
            {
                // --- VGA ---
                new Product { Name = "ASUS ROG Strix RTX 4090 OC 24GB", Description = "<p>Card đồ họa flagship NVIDIA Ada Lovelace, 24GB GDDR6X, phù hợp 4K gaming và AI workloads.</p>", Price = 52000000, StockQuantity = 8, CategoryProductId = catProducts[0].Id, ImageUrl = "https://placehold.co/600x400/1a1a2e/00d4ff?text=RTX+4090" },
                new Product { Name = "MSI Gaming X Trio RTX 4080 Super 16GB", Description = "<p>RTX 4080 Super với 16GB GDDR6X, hiệu năng 4K gaming tuyệt vời với mức giá dễ tiếp cận hơn 4090.</p>", Price = 28500000, StockQuantity = 12, CategoryProductId = catProducts[0].Id, ImageUrl = "https://placehold.co/600x400/1a1a2e/00d4ff?text=RTX+4080S" },
                new Product { Name = "Sapphire Pulse RX 7900 XTX 24GB", Description = "<p>Card đồ họa AMD RDNA 3 cao cấp, 24GB GDDR6, hiệu năng cạnh tranh trực tiếp với RTX 4080.</p>", Price = 24000000, StockQuantity = 6, CategoryProductId = catProducts[0].Id, ImageUrl = "https://placehold.co/600x400/d62828/ffffff?text=RX+7900+XTX" },
                new Product { Name = "ASUS Dual RTX 4070 Ti Super OC 16GB", Description = "<p>RTX 4070 Ti Super 16GB GDDR6X - Lựa chọn vàng cho gaming 1440p và 4K nhẹ nhàng.</p>", Price = 19800000, StockQuantity = 15, CategoryProductId = catProducts[0].Id, ImageUrl = "https://placehold.co/600x400/1a1a2e/64ffda?text=RTX+4070Ti+S" },
                new Product { Name = "Gigabyte Windforce RTX 4060 Ti 8GB", Description = "<p>RTX 4060 Ti 8GB GDDR6, tản nhiệt 3 quạt, phù hợp gaming 1080p và 1440p.</p>", Price = 10500000, StockQuantity = 20, CategoryProductId = catProducts[0].Id, ImageUrl = "https://placehold.co/600x400/1a1a2e/ffffff?text=RTX+4060Ti" },

                // --- CPU ---
                new Product { Name = "Intel Core i9-14900K (3.2GHz, 24 nhân)", Description = "<p>CPU Intel thế hệ 14 flagship, 24 nhân (8P+16E), TDP 125W, socket LGA1700, hỗ trợ DDR5 7200MHz+.</p>", Price = 14500000, StockQuantity = 10, CategoryProductId = catProducts[1].Id, ImageUrl = "https://placehold.co/600x400/0f3460/64ffda?text=i9-14900K" },
                new Product { Name = "AMD Ryzen 9 7950X3D (4.2GHz, 16 nhân)", Description = "<p>Ryzen 9 7950X3D với AMD 3D V-Cache, 16 nhân 32 luồng, vua hiệu năng đơn luồng và đa luồng.</p>", Price = 18500000, StockQuantity = 5, CategoryProductId = catProducts[1].Id, ImageUrl = "https://placehold.co/600x400/d62828/ffffff?text=R9+7950X3D" },
                new Product { Name = "Intel Core i7-14700K (3.4GHz, 20 nhân)", Description = "<p>CPU tầm trung cao cấp Intel, 20 nhân (8P+12E), hiệu năng xuất sắc cho cả gaming và làm việc.</p>", Price = 9800000, StockQuantity = 18, CategoryProductId = catProducts[1].Id, ImageUrl = "https://placehold.co/600x400/0f3460/ffffff?text=i7-14700K" },
                new Product { Name = "AMD Ryzen 7 7800X3D (4.5GHz, 8 nhân)", Description = "<p>Vua gaming CPU nhờ 3D V-Cache, 8 nhân 16 luồng, hiệu năng gaming đánh bại mọi CPU trên thị trường.</p>", Price = 11200000, StockQuantity = 15, CategoryProductId = catProducts[1].Id, ImageUrl = "https://placehold.co/600x400/d62828/64ffda?text=R7+7800X3D" },
                new Product { Name = "Intel Core i5-14600K (3.5GHz, 14 nhân)", Description = "<p>CPU gaming tầm trung phổ biến nhất của Intel, 14 nhân, giá hợp lý cho các build gaming phổ thông.</p>", Price = 7200000, StockQuantity = 25, CategoryProductId = catProducts[1].Id, ImageUrl = "https://placehold.co/600x400/0f3460/ffffff?text=i5-14600K" },

                // --- RAM ---
                new Product { Name = "Kingston Fury Beast DDR5 32GB (2x16GB) 6000MHz", Description = "<p>RAM DDR5 tốc độ 6000MHz CL30, tối ưu cho Intel XMP 3.0 và AMD EXPO, tản nhiệt nhôm sang trọng.</p>", Price = 2850000, StockQuantity = 30, CategoryProductId = catProducts[2].Id, ImageUrl = "https://placehold.co/600x400/533483/ffffff?text=DDR5+32GB" },
                new Product { Name = "Corsair Vengeance DDR5 64GB (2x32GB) 5600MHz", Description = "<p>Kit RAM DDR5 dung lượng lớn 64GB, phù hợp workstation, render video và đa nhiệm nặng.</p>", Price = 5200000, StockQuantity = 12, CategoryProductId = catProducts[2].Id, ImageUrl = "https://placehold.co/600x400/533483/ffffff?text=DDR5+64GB" },
                new Product { Name = "G.Skill Trident Z5 RGB DDR5 32GB 7200MHz", Description = "<p>RAM DDR5 tốc độ cực cao 7200MHz, LED RGB đẹp mắt, dành cho người dùng muốn ép xung tối đa.</p>", Price = 3600000, StockQuantity = 8, CategoryProductId = catProducts[2].Id, ImageUrl = "https://placehold.co/600x400/533483/64ffda?text=Trident+Z5" },

                // --- SSD ---
                new Product { Name = "Samsung 990 Pro 2TB NVMe Gen4", Description = "<p>SSD NVMe Gen4 hàng đầu của Samsung với tốc độ đọc 7450MB/s, ghi 6900MB/s. Bảo hành 5 năm.</p>", Price = 3200000, StockQuantity = 40, CategoryProductId = catProducts[3].Id, ImageUrl = "https://placehold.co/600x400/16213e/64ffda?text=Samsung+990Pro" },
                new Product { Name = "WD Black SN850X 1TB NVMe Gen4", Description = "<p>SSD cao cấp dành cho PS5 và PC, tốc độ đọc 7300MB/s, có tản nhiệt gắn sẵn, lý tưởng cho gaming.</p>", Price = 2400000, StockQuantity = 22, CategoryProductId = catProducts[3].Id, ImageUrl = "https://placehold.co/600x400/16213e/ffffff?text=WD+SN850X" },
                new Product { Name = "Crucial P5 Plus 500GB NVMe Gen4", Description = "<p>SSD tầm trung giá tốt, Gen4 NVMe, tốc độ đọc 6600MB/s, phù hợp nâng cấp từ HDD hoặc SATA SSD.</p>", Price = 1150000, StockQuantity = 50, CategoryProductId = catProducts[3].Id, ImageUrl = "https://placehold.co/600x400/16213e/ffffff?text=Crucial+P5" },

                // --- MAINBOARD ---
                new Product { Name = "ASUS ROG Maximus Z790 Hero (LGA1700, DDR5)", Description = "<p>Bo mạch chủ cao cấp Z790 cho Intel Gen 13/14, 20+1 phase VRM, WiFi 6E, Thunderbolt 4, PCIe 5.0.</p>", Price = 16500000, StockQuantity = 5, CategoryProductId = catProducts[4].Id, ImageUrl = "https://placehold.co/600x400/1a1a2e/e94560?text=ROG+Z790" },
                new Product { Name = "MSI MEG X670E Ace (AM5, DDR5)", Description = "<p>Flagship mainboard AMD AM5 hỗ trợ Ryzen 7000 series, 22+2 phase VRM, WiFi 6E, PCIe 5.0 cho SSD.</p>", Price = 14800000, StockQuantity = 4, CategoryProductId = catProducts[4].Id, ImageUrl = "https://placehold.co/600x400/d62828/ffffff?text=X670E+Ace" },
                new Product { Name = "Gigabyte B760M Aorus Elite (LGA1700, DDR5)", Description = "<p>Bo mạch chủ tầm trung B760 cho Intel Gen 12/13/14, DDR5, 4 khe M.2, giá tốt cho build phổ thông.</p>", Price = 3800000, StockQuantity = 20, CategoryProductId = catProducts[4].Id, ImageUrl = "https://placehold.co/600x400/1a1a2e/ffffff?text=B760M+Aorus" },

                // --- TẢN NHIỆT ---
                new Product { Name = "Noctua NH-D15 Chromax Black (Dual Tower)", Description = "<p>Tản nhiệt khí đôi Noctua huyền thoại, 2 quạt NF-A15, TDP 250W+, phù hợp mọi CPU cao cấp hiện nay.</p>", Price = 2200000, StockQuantity = 15, CategoryProductId = catProducts[5].Id, ImageUrl = "https://placehold.co/600x400/2d2d2d/ffffff?text=Noctua+NH-D15" },
                new Product { Name = "Corsair H150i Elite LCD AIO 360mm", Description = "<p>Tản nhiệt nước AIO 360mm với màn hình LCD tích hợp, 3 quạt 120mm, làm mát vượt trội cho CPU flagship.</p>", Price = 5800000, StockQuantity = 8, CategoryProductId = catProducts[5].Id, ImageUrl = "https://placehold.co/600x400/0d1b2a/64ffda?text=H150i+LCD" },
                new Product { Name = "DeepCool AK620 Digital (Dual Tower)", Description = "<p>Tản nhiệt khí đôi với màn hình hiển thị nhiệt độ tích hợp, TDP 260W, cực kỳ yên tĩnh.</p>", Price = 1650000, StockQuantity = 25, CategoryProductId = catProducts[5].Id, ImageUrl = "https://placehold.co/600x400/2d2d2d/64ffda?text=AK620+Digital" },

                // --- NGUỒN ---
                new Product { Name = "Seasonic Prime TX-1000W 80+ Titanium", Description = "<p>Nguồn máy tính 1000W chuẩn 80+ Titanium, hiệu suất >94%, hoàn toàn modular, bảo hành 12 năm.</p>", Price = 6200000, StockQuantity = 10, CategoryProductId = catProducts[6].Id, ImageUrl = "https://placehold.co/600x400/333/gold?text=Seasonic+TX-1000" },
                new Product { Name = "Corsair RM850x Shift 850W 80+ Gold", Description = "<p>Nguồn 850W chuẩn Gold hoàn toàn modular với cổng cắm xoay ngang độc đáo, tiện lắp đặt trong case.</p>", Price = 3200000, StockQuantity = 18, CategoryProductId = catProducts[6].Id, ImageUrl = "https://placehold.co/600x400/333/ffffff?text=RM850x+Shift" },

                // --- CASE ---
                new Product { Name = "Lian Li O11 Dynamic EVO (Mid Tower, kính cường lực)", Description = "<p>Case gaming iconic của Lian Li, panel kính hai mặt, hỗ trợ tới 3 radiator 360mm, không gian quản lý cáp rộng rãi.</p>", Price = 3500000, StockQuantity = 10, CategoryProductId = catProducts[7].Id, ImageUrl = "https://placehold.co/600x400/111/ffffff?text=O11+Dynamic+EVO" },
                new Product { Name = "Fractal Design Torrent Compact (Mid Tower)", Description = "<p>Case thiết kế tập trung vào luồng khí với lưới thoáng rộng phía trước, 2 quạt 180mm kèm theo.</p>", Price = 2800000, StockQuantity = 7, CategoryProductId = catProducts[7].Id, ImageUrl = "https://placehold.co/600x400/222/ffffff?text=Torrent+Compact" },

                // --- MÀN HÌNH ---
                new Product { Name = "ASUS ROG Swift OLED PG32UCDM 32\" 4K 240Hz", Description = "<p>Màn hình OLED 4K 32 inch, 240Hz, 0.03ms, màu sắc cực kỳ trung thực, HDR True Black 400 - Đỉnh cao gaming display.</p>", Price = 28500000, StockQuantity = 4, CategoryProductId = catProducts[8].Id, ImageUrl = "https://placehold.co/600x400/000/64ffda?text=OLED+4K+240Hz" },
                new Product { Name = "LG 27GP850-B 27\" QHD 165Hz IPS Nano", Description = "<p>Màn hình 27\" QHD 2560x1440, IPS Nano 165Hz, 1ms GTG, DisplayHDR 400 - Bestseller gaming tầm trung.</p>", Price = 7200000, StockQuantity = 20, CategoryProductId = catProducts[8].Id, ImageUrl = "https://placehold.co/600x400/1a1a2e/ffffff?text=LG+27GP850" },

                // --- BÀN PHÍM & CHUỘT ---
                new Product { Name = "Keychron Q3 Pro QMK Wireless (Gasket mount, Gateron G Pro Red)", Description = "<p>Bàn phím cơ tenkeyless không dây Bluetooth 5.1/2.4GHz, gasket mount giảm rung, switch Gateron Pro Red mượt mà.</p>", Price = 3800000, StockQuantity = 15, CategoryProductId = catProducts[9].Id, ImageUrl = "https://placehold.co/600x400/2d2d2d/ffffff?text=Keychron+Q3+Pro" },
                new Product { Name = "Logitech G Pro X Superlight 2 (Chuột gaming không dây, 32K DPI)", Description = "<p>Chuột gaming không dây nhẹ nhất của Logitech, 63g, HERO 2 32K DPI, pin 95 giờ, cảm biến xuất sắc nhất hiện tại.</p>", Price = 3200000, StockQuantity = 22, CategoryProductId = catProducts[9].Id, ImageUrl = "https://placehold.co/600x400/111/ffffff?text=G+Pro+X+SL2" }
            };
            for (var i = 0; i < products.Length; i++)
            {
                products[i].CreatedAt = DateTime.UtcNow.AddMinutes(-i);
            }
            context.Products.AddRange(products);
            context.SaveChanges();

            // =============================================
            // 7. ĐƠN HÀNG MẪU (Order)
            // =============================================
            var order1 = new Order
            {
                CustomerId = customers[0].Id,
                OrderDate = DateTime.Now.AddDays(-3),
                Status = 2,
                PaymentMethod = "COD",
                PaymentStatus = "Paid",
                Notes = "Giao giờ hành chính | Giao đến: Trần Văn Mạnh - SĐT: 0901234567"
            };
            var order2 = new Order
            {
                CustomerId = customers[1].Id,
                OrderDate = DateTime.Now.AddDays(-1),
                Status = 0,
                PaymentMethod = "PayOS",
                PaymentStatus = "Pending",
                Notes = "Giao buổi chiều | Giao đến: Nguyễn Thị Hoa - SĐT: 0912345678"
            };
            context.Orders.AddRange(order1, order2);
            context.SaveChanges();

            // =============================================
            // 8. CHI TIẾT ĐƠN HÀNG (OrderDetail)
            // =============================================
            var orderDetails = new OrderDetail[]
            {
                new OrderDetail { OrderId = order1.Id, ProductId = products[7].Id, Quantity = 1, UnitPrice = products[7].Price }, // Ryzen 7 7800X3D
                new OrderDetail { OrderId = order1.Id, ProductId = products[10].Id, Quantity = 1, UnitPrice = products[10].Price }, // RAM DDR5 32GB
                new OrderDetail { OrderId = order1.Id, ProductId = products[13].Id, Quantity = 1, UnitPrice = products[13].Price }, // Samsung 990 Pro
                new OrderDetail { OrderId = order2.Id, ProductId = products[3].Id, Quantity = 1, UnitPrice = products[3].Price },  // RTX 4070 Ti Super
                new OrderDetail { OrderId = order2.Id, ProductId = products[19].Id, Quantity = 1, UnitPrice = products[19].Price } // Corsair H150i
            };
            context.OrderDetails.AddRange(orderDetails);
            context.SaveChanges();

            // =============================================
            // 9. QUẢNG CÁO (Advertisements)
            // =============================================
            if (!context.Advertisements.Any())
            {
                var ads = new Advertisement[]
                {
                    new Advertisement { Title = "Sale Lớn Mùa Hè - Giảm Đến 50%", ImageUrl = "/assets/banners/banner_summer.png", LinkUrl = "/products", DisplayOrder = 1, IsActive = true, CreatedAt = DateTime.Now },
                    new Advertisement { Title = "RTX 40 Series - Sức Mạnh Tối Thượng", ImageUrl = "/assets/banners/banner_rtx40.png", LinkUrl = "/products/category/1", DisplayOrder = 2, IsActive = true, CreatedAt = DateTime.Now },
                    new Advertisement { Title = "Build PC Cực Chất - Tặng Bàn Phím Cơ", ImageUrl = "/assets/banners/banner_pc.png", LinkUrl = "/products", DisplayOrder = 3, IsActive = true, CreatedAt = DateTime.Now }
                };
                context.Advertisements.AddRange(ads);
                context.SaveChanges();
            }
        }
    }
}
