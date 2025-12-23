import axios from "axios";
import { User, UserManager } from "oidc-client-ts";
import { oidcConfig } from "../auth/authConfig";

const userManager = new UserManager(oidcConfig);

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

client.interceptors.request.use(
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

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors etc
    return Promise.reject(error);
  }
);
