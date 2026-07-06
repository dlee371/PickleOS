import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true, // sends the httpOnly auth cookie
});

// Surface a consistent error message shape to callers
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.error?.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);
