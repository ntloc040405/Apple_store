import axios from 'axios';

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  withCredentials: true // Send cookies with requests
});

let tokenRefreshPromise = null;

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('apple_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      if (!tokenRefreshPromise) {
        tokenRefreshPromise = API.post('/auth/refresh')
          .then(res => {
            localStorage.setItem('apple_token', res.data.token);
            tokenRefreshPromise = null;
            return res.data.token;
          })
          .catch(() => {
            localStorage.removeItem('apple_token');
            localStorage.removeItem('apple_user');
            tokenRefreshPromise = null;
            window.location.href = '/login';
          });
      }
      
      const token = await tokenRefreshPromise;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return API(original);
      }
    }
    return Promise.reject(err);
  }
);

export default API;
