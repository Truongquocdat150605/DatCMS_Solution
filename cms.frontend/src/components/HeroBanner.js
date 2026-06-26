import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../styles/HeroBanner.css';

// Hàm xác định URL ảnh banner
// - Nếu bắt đầu bằng /assets/ thì là ảnh local trong public/ của React → dùng nguyên
// - Nếu là URL đầy đủ → dùng nguyên
// - Ngược lại → ghép với backend URL
const getBannerImageUrl = (path) => {
  if (!path) return '';

  // URL đầy đủ
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // Đã là path tuyệt đối
  if (path.startsWith('/assets/') || path.startsWith('/images/') || path.startsWith('/uploads/')) {
    return `https://localhost:7048${path}`;
  }

  // path kiểu: uploads/xxx.jpg (không có dấu / đầu)
  if (path.startsWith('assets/') || path.startsWith('images/') || path.startsWith('uploads/')) {
    return `https://localhost:7048/${path}`;
  }

  // case: chỉ là tên file (vd: banner_pc.png) -> mặc định coi là trong /wwwroot/ (hoặc /images tùy project)
  // Ở project này file banner thường đặt trong wwwroot/ nên ghép thẳng.
  if (!path.includes('/') && !path.includes('\\')) {
    return `https://localhost:7048/${path}`;
  }

  // fallback: ghép với backend nếu không nhận diện được
  return `https://localhost:7048/${path}`;
};



const HeroBanner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                // Gọi đúng port HTTPS của .NET backend
                const response = await axios.get('https://localhost:7048/api/AdvertisementApi/banners', {
                    withCredentials: true
                });
                setBanners(response.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu banner:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    if (loading) {
        return (
            <div className="hero-banner-skeleton">
                <div className="skeleton-shimmer"></div>
                <div className="skeleton-text">Đang tải Banner...</div>
            </div>
        );
    }

    if (banners.length === 0) {
        return null;
    }

    return (
        <div className="hero-banner-container">
            <Swiper
                modules={[Pagination, Navigation, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{ clickable: true }}
                navigation
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                className="hero-swiper"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        {banner.linkUrl ? (
                            <Link to={banner.linkUrl} className="hero-slide-link">
                                <div className="hero-slide-content">
                                    <img
                                        src={getBannerImageUrl(banner.imageUrl)}
                                        alt={banner.title}
                                        className="hero-slide-image"
                                        loading="eager"
                                    />
                                    <div className="hero-slide-overlay">
                                        <h2 className="hero-slide-title">{banner.title}</h2>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="hero-slide-content">
                                <img
                                    src={getBannerImageUrl(banner.imageUrl)}
                                    alt={banner.title}
                                    className="hero-slide-image"
                                    loading="eager"
                                />
                                <div className="hero-slide-overlay">
                                    <h2 className="hero-slide-title">{banner.title}</h2>
                                </div>
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HeroBanner;
