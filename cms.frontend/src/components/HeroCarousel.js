import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=1200',
    title: 'PC GAMING Cao Cấp',
    subtitle: 'Trang bị RTX 4090 - Intel i9 thế hệ mới nhất',
    buttonText: 'Mua ngay',
    buttonLink: '/products'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200',
    title: 'Linh Kiện Chính Hãng',
    subtitle: 'CPU, Mainboard, RAM, VGA - Giá tốt nhất thị trường',
    buttonText: 'Xem sản phẩm',
    buttonLink: '/products'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1593642532744-d377ab507dc8?w=1200',
    title: 'Khuyến Mãi Lớn',
    subtitle: 'Giảm giá lên đến 30% cho đơn hàng đầu tiên',
    buttonText: 'Ưu đãi ngay',
    buttonLink: '/products'
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="hero-carousel">
      <div className="carousel-container">
        <div 
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="carousel-slide">
              <div 
                className="slide-bg"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="slide-overlay"></div>
              </div>
              <div className="slide-content">
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-subtitle">{slide.subtitle}</p>
                <a href={slide.buttonLink} className="slide-btn">
                  {slide.buttonText} →
                </a>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-btn prev-btn" onClick={handlePrev}>
          ‹
        </button>
        <button className="carousel-btn next-btn" onClick={handleNext}>
          ›
        </button>

        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}