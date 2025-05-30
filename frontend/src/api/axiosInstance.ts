import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers!["Authorization"] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
        window.location.href = "/login";
        return Promise.reject(err);
      }
      try {
        const { data } = await axios.post(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/v1/accounts/auth/token/refresh/`,
          {
            refresh,
          }
        );
        localStorage.setItem("access", data.access);
        // localStorage.setItem("refresh", data.refresh);
        original.headers!["Authorization"] = `Bearer ${data.access}`;
        return axios(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
