import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Replace with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = async (data: { username: string; password: string }) => {
  try {
    const response = await api.post("/user/login", data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(error.response.data.message || "Login failed");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response received from the server");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || "An unknown error occurred");
    }
  }
};

export const register = (data: {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: number;
  role?: string;
}) => api.post("/user/register", data);

export const refreshToken = (data: { refreshToken: string }) =>
  api.post("/user/refresh", data);

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    // Token expired or invalid, try to refresh
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry the original request with new token
      return authenticatedFetch(url, options);
    } else {
      // Refresh failed, redirect to login
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
};

// Match your existing refresh token endpoint
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const { accessToken } = await response.json();
      localStorage.setItem("accessToken", accessToken);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

export default api;
