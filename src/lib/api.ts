import axios from "axios";
import { User, UserManager } from "oidc-client-ts";
import { oidcConfig } from "../auth/authConfig";

// Read API base URL from environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const userManager = new UserManager(oidcConfig);

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  async (config) => {
    const user: User | null = await userManager.getUser();

    if (user && user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
