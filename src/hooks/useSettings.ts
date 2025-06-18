import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Settings Interface
export interface ShopSettings {
  id: string;
  shopId: string;
  fullName: string;
  brand: string;
  merchantUrl: string;
  telegramUsername: string;
  telegramBotApiKey?: string; // Masked in response
  telegramChatId?: string;
  // Notification preferences
  payment_success: boolean;
  payment_failed: boolean;
  refund: boolean;
  payout: boolean;
  login: boolean;
  api_error: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateNotificationsData {
  payment_success?: boolean;
  payment_failed?: boolean;
  refund?: boolean;
  payout?: boolean;
  login?: boolean;
  api_error?: boolean;
}

export interface UpdateTelegramData {
  botApiKey: string;
  chatId: string;
}

export interface DeleteAccountData {
  passwordConfirmation: string;
}

// Query Keys
export const settingsKeys = {
  all: ['settings'] as const,
  shop: () => [...settingsKeys.all, 'shop'] as const,
};

// Get Shop Settings Hook
export function useShopSettings() {
  return useQuery({
    queryKey: settingsKeys.shop(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ShopSettings>>('/shop/settings');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Update Password Hook
export function useUpdatePassword() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      const response = await api.post<ApiResponse<void>>('/shop/settings/password', data);
      return response;
    },
    onSuccess: () => {
      // Optionally invalidate auth or other relevant queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

// Update Notifications Hook
export function useUpdateNotifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateNotificationsData) => {
      const response = await api.put<ApiResponse<ShopSettings>>('/shop/settings/notifications', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the settings cache with new data
      queryClient.setQueryData(settingsKeys.shop(), data);
      queryClient.invalidateQueries({ queryKey: settingsKeys.shop() });
    },
  });
}

// Update Telegram Settings Hook
export function useUpdateTelegramSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateTelegramData) => {
      const response = await api.put<ApiResponse<ShopSettings>>('/shop/settings/telegram', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the settings cache with new data
      queryClient.setQueryData(settingsKeys.shop(), data);
      queryClient.invalidateQueries({ queryKey: settingsKeys.shop() });
    },
  });
}

// Revoke All API Keys Hook
export function useRevokeApiKeys() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {}) => {
      const response = await api.post<ApiResponse<void>>('/shop/settings/api-keys/revoke', data);
      return response;
    },
    onSuccess: () => {
      // Invalidate shop profile to refresh API keys
      queryClient.invalidateQueries({ queryKey: ['shop', 'profile'] });
      // Optionally redirect to login since API keys are revoked
    },
  });
}

// Delete Account Hook
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DeleteAccountData) => {
      const response = await api.post<ApiResponse<void>>('/shop/settings/account/delete', data);
      return response;
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Remove auth token
      localStorage.removeItem('auth_token');
    },
  });
}