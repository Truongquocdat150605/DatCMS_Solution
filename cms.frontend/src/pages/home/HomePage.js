/**
 * File: HomePage.js
 * Chức năng: Component Trang chủ (Home). Chứa 5 phân khu kiến trúc: Hero Banner, Danh mục, Sản phẩm nổi bật, Sản phẩm mới, Tin tức.
 * Được dùng trong: App.js (Route "/")
 */
import React, { useEffect, useMemo, useState } from 'react';
import postApi from '../../core_modules/api/postApi';
import categoryApi from '../../core_modules/api/categoryApi';
import HeroBanner from '../../components/HeroBanner';
import NewArrivals from '../../components/NewArrivals';
import { BestSellers } from '../../components/NewArrivals';
import CategoriesQuickNav from '../../components/CategoriesQuickNav';
import MagazineSection from '../../components/MagazineSection';
import PremiumPolicy from '../../components/PremiumPolicy';
import '../../styles/HomePage.css';
export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  const latestPosts = useMemo(() => (posts || []), [posts]); // Dữ liệu đã được lấy 3 bài từ backend

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const [postsRes, categoriesRes] = await Promise.all([
          postApi.getLatest(3),
          categoryApi.getAll(),
        ]);

        if (!mounted) return;

        setPosts(Array.isArray(postsRes) ? postsRes : postsRes?.data || []);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data || []);
      } catch (e) {
        if (mounted) setError(e.message || 'Lỗi khi tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải trải nghiệm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">⚠️ {error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  const displayCategories = categories.length > 0 ? categories : [];

  return (
    <div className="home-container">
      <div className="carousel-wrapper">
        <HeroBanner />
      </div>

      <div className="content-wrapper">

        {/* Quick Categories Navigation */}
        <CategoriesQuickNav categories={displayCategories} />

        {/* --- DYNAMIC COMPONENTS --- */}
        <BestSellers />
        <NewArrivals />

        {/* Magazine Style Posts Section */}
        <MagazineSection latestPosts={latestPosts} />

        {/* Chính sách Premium */}
        <PremiumPolicy />

      </div>
    </div>
  );
}
