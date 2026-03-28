import axios from 'axios';

/**
 * Global API Orchestrator: Axios Instance
 * Configures the base communication layer with the backend identity 
 * provider and manages automated JWT lifecycle interceptors.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Security Interceptor: Request Authorization
 * Automatically injects the active JWT 'access_token' into the header 
 * of every outgoing transaction to verify identity.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Resilience Interceptor: Response & Silent Refresh
 * Managed Failover Mechanism:
 * 1. Identifies 401 Unauthorized errors from expired tokens.
 * 2. Attempts a silent background refresh using the 'refresh_token'.
 * 3. Transparently retries the original request upon successful refresh.
 * 4. Force-logs the user out if the session is unrecoverable.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest.url === '/api/auth/token/refresh/';

    // Logic: Only retry if it's an unauthorized error and not already a retry attempt
    if (isUnauthorized && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('Persistence Alert: Refresh token absent.');
        
        // Execute: Silent token rotation
        const res = await axios.post(`${baseURL}/api/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        const newAccess = res.data.access;
        localStorage.setItem('access_token', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        
        // Re-attempt: Original transactional intent
        return axios(originalRequest);
      } catch (err) {
        // Security Protocol: Purge credentials and redirect to gateway on total failure
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
