const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Asset Resolver: resolveImageUrl
 * Normalizes image paths by prepending the backend CDN/Server base 
 * URL for relative media references.
 * @param {string} url - The raw URL or relative path from the database.
 * @returns {string|null} The fully qualified absolute URL for frontend rendering.
 */
export const resolveImageUrl = (url) => {
  if (!url) return null;
  
  // Logic: Bypass normalization for already absolute or data-encoded assets
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:')) return url;
  
  // Guard: Sanitize base and target paths to prevent double-slashing
  const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  return `${cleanBase}${cleanUrl}`;
};
