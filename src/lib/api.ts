import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = 'https://api.trapay.uk/api';

export class ApiError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = (data as any)?.message || error.message || `HTTP ${status}`;
      const code = (data as any)?.code;
      
      if (message === "Invalid or expired token"){
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }

      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
      
      throw new ApiError(message, status, code);
    } else if (error.request) {
      throw new ApiError('Network error - please check your connection', 0, 'NETWORK_ERROR');
    } else {
      throw new ApiError(error.message || 'An unexpected error occurred', 0, 'UNKNOWN_ERROR');
    }
  }
);

export const api = {
  get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    const response = await axiosInstance.get<T>(endpoint, { params });
    return response.data;
  },

  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await axiosInstance.post<T>(endpoint, data);
    return response.data;
  },

  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await axiosInstance.put<T>(endpoint, data);
    return response.data;
  },

  patch: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await axiosInstance.patch<T>(endpoint, data);
    return response.data;
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await axiosInstance.delete<T>(endpoint);
    return response.data;
  },

  upload: async <T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<T>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },
};

export { axiosInstance };