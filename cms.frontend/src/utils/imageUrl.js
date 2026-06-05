const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7048';

export function buildImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const normalizedBase = API_BASE_URL.replace(/\/+$|\/+$/g, '');
  return `${normalizedBase}${path.startsWith('/') ? '' : '/'}${path}`;
}
