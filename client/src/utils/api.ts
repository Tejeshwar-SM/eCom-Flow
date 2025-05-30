import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { ApiResponse } from '../types/index';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    const errorMessage = getErrorMessage(error);
    
    // Log errors
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    });

    // Show toast for specific errors
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 404) {
      toast.error('Requested resource not found.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error messages
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.message || data.error || 'An error occurred';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network connection error';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout';
  }
  
  return error.message || 'Unknown error occurred';
}

// API utility functions
export const apiUtils = {
  // Generic GET request
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  },

  // Generic POST request
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  },

  // Generic PUT request
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  },

  // Generic DELETE request
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  },

  // Error handler
  handleError(error: AxiosError): Error {
    const message = getErrorMessage(error);
    const customError = new Error(message);
    (customError as any).status = error.response?.status;
    (customError as any).data = error.response?.data;
    return customError;
  }
};

export default api;
