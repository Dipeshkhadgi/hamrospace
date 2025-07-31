import axios from "axios";
import { toast } from "react-toastify";

const devEnv = import.meta.env.MODE !== "production";
export const devApiUrl = import.meta.env.VITE_DEV_API;
const prodApiUrl = import.meta.env.VITE_PROD_API;

const validateEnvironment = () => {
  if (devEnv && !devApiUrl) {
    toast.error("Unable to connect development Mode!");
    return false;
  }
  if (!devEnv && !prodApiUrl) {
    toast.error("Unable to connect Production Mode!");
    return false;
  }
  return true;
};

let API;

if (validateEnvironment()) {
  API = axios.create({
    baseURL: devEnv ? devApiUrl : prodApiUrl,
  });

  // Interceptor for adding Authorization header
  API.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("AuthID");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor for handling global error responses
  API.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        console.error(error.request);
      } else {
        console.error("Error", error.message);
      }

      return Promise.reject(error);
    }
  );
} else {
  // Fallback API object to prevent application crash
  API = {
    get: () => Promise.reject(new Error("Invalid environment configuration")),
    post: () => Promise.reject(new Error("Invalid environment configuration")),
    put: () => Promise.reject(new Error("Invalid environment configuration")),
    delete: () =>
      Promise.reject(new Error("Invalid environment configuration")),
    interceptors: {
      request: { use: () => { } },
      response: { use: () => { } },
    },
  };
}

export default API;
