import axios from "axios";
import { getOidc } from "../oidc";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

client.interceptors.request.use(
  async (config) => {
    const oidc = await getOidc();

    if (oidc.isUserLoggedIn) {
      const accessToken = await oidc.getAccessToken();
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors etc
    return Promise.reject(error);
  }
);
