const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7048';

export function buildImageUrl(path) {
  if (!path) return '';

  // Ảnh đã có URL đầy đủ (http/https)
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');

  // Các đường dẫn tĩnh từ backend: phải ghép host backend
  // để React (chạy ở port 3000) vẫn truy cập đúng file.
  if (path.startsWith('/uploads/') || path.startsWith('/images/') || path.startsWith('/assets/')) {
    return `${normalizedBase}${path}`;
  }

  // Trường hợp ảnh nằm trong public/ của React
  // (ví dụ: /assets/banners/banner.png)
  if (path.startsWith('/assets/')) {
    return path;
  }

  // Ảnh trên backend dạng không có dấu '/' đầu
  // Ví dụ: uploads/product.jpg
  return `${normalizedBase}/${path}`;
}

