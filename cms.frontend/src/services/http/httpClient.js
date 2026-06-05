// services/http/httpClient.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7048';

function buildUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const p = (path || '').replace(/^\/+/, '');
  // AuthApiController route là api/AuthApi/xxx
  return `${base}/api/${p}`;
}

async function request(method, path, body) {
  const url = buildUrl(path);
  console.log('🚀 Request URL:', url); // Debug

  const headers = {
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    // Cookie auth => luôn gửi cookie
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    console.log('HTTP error', { status: res.status, path, data });
    const message =
      (isJson && data && (data.message || data.title || data.error)) ||
      (typeof data === 'string' ? data : JSON.stringify(data));
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const httpClient = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export default httpClient;
