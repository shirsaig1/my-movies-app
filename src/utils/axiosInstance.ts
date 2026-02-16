import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_TIMEOUT_MS = 10000;
const BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

if (!BEARER_TOKEN) {
  console.error(
    "Missing VITE_TMDB_BEARER_TOKEN environment variable. Please check your .env file.",
  );
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Authorization: `Bearer ${BEARER_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.code === "ECONNABORTED") {
      console.error("API request timeout after", API_TIMEOUT_MS, "ms");
    } else if (error.response?.status === 401) {
      console.error("Unauthorized: Invalid API token");
    } else if (error.response?.status === 404) {
      console.error("Resource not found");
    } else if (error.message === "Network Error") {
      console.error("Network error: Check internet connection");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
