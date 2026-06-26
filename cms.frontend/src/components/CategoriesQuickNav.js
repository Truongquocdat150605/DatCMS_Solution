import React from 'react';
import { useNavigate } from 'react-router-dom';
import { buildImageUrl } from '../utils/imageUrl';

const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  if (name.includes('cpu')) return '🖥️';
  if (name.includes('vga') || name.includes('graphic')) return '🎮';
  if (name.includes('ram')) return '💾';
  if (name.includes('mainboard') || name.includes('main')) return '🔧';
  if (name.includes('ssd') || name.includes('hdd') || name.includes('storage')) return '📀';
  if (name.includes('nguồn') || name.includes('psu') || name.includes('power')) return '⚡';
  if (name.includes('tản') || name.includes('cooler') || name.includes('fan')) return '❄️';
  if (name.includes('phím') || name.includes('chuột') || name.includes('keyboard') || name.includes('mouse')) return '🖱️';
  return '📦';
};

const CategoriesQuickNav = ({ categories }) => {
  const navigate = useNavigate();
  
  if (!categories || categories.length === 0) return null;

  return (
    <section className="premium-section categories-quicknav">
      <div className="categories-pills">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="cat-pill"
            onClick={() => navigate(`/products?categoryId=${cat.id}`)}
          >
            {cat.imageUrl ? (
              <img
                src={buildImageUrl(cat.imageUrl)}
                alt={cat.name}
                className="cat-pill-image"
              />
            ) : (
              <span className="cat-pill-icon">{getCategoryIcon(cat.name)}</span>
            )}
            <span className="cat-pill-name">{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesQuickNav;
