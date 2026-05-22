import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // 🛡️ Fix: Check both common keys. 
  // Your backend returns 'token', but some parts of your app look for 'auth_token'.
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🛡️ Session expired or invalid - Clearing storage");
      
      // 🛡️ Fix: When a 401 happens, clear the "Ghost Token" so 
      // the user is forced to actually log in again.
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      
      // Optional: Redirect to login page if you aren't already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;