const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Resolves an image URL from the backend.
 * If the URL is relative (e.g. /media/...), it prepends the backend base URL.
 * If it's already absolute or null, it returns it as is.
 */
export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:')) return url; // For base64 previews
  
  // Ensure we don't double slash
  const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  return `${cleanBase}${cleanUrl}`;
};
