import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { convertGatewayNamesToIds, convertGatewayIdsToNames, getGatewayNameFromId } from '../utils/gatewayMapping';

export interface User {
  id: string;
  name: string; // Mapped from fullName (now Brand Name)
  username: string;
  telegram: string; // Mapped from telegramId
  commision: number; // Note: keeping the typo from server response (commission) - DEPRECATED, use gatewaySettings
  shopUrl: string; // Mapped from merchantUrl
  paymentGateways: string[]; // Gateway IDs (0001, 0010, etc.) - mapped from gateways
  payoutDelay: number; // DEPRECATED, use gatewaySettings
  publicKey: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  email?: string;
  role?: 'admin' | 'user';
  balance?: number;
  lastLogin?: string;
  // New fields for gateway-specific settings
  gatewaySettings?: {
    [gatewayId: string]: { // Gateway IDs as keys
      commission: number;
      payoutDelay: number;
    };
  };
  // New wallets field
  wallets?: {
    usdtPolygonWallet?: string | null;
    usdtTrcWallet?: string | null;
    usdtErcWallet?: string | null;
    usdcPolygonWallet?: string | null;
  };
}

export interface GatewaySettings {
  [gatewayId: string]: { // Gateway IDs as keys
    commission: number;
    payoutDelay: number;
  };
}

export interface AddUserFormData {
  brandName: string; // Changed from fullName
  username: string;
  password: string;
  telegramId: string;
  merchantUrl: string;
  gateways: string[]; // Gateway IDs
  gatewaySettings: GatewaySettings; // Gateway-specific settings (required)
  wallets?: {
    usdtPolygonWallet?: string;
    usdtTrcWallet?: string;
    usdtErcWallet?: string;
    usdcPolygonWallet?: string;
  };
}

export interface CreateUserData {
  name: string;
  username: string;
  password: string;
  telegram: string;
  shopUrl: string;
  paymentGateways: string[]; // Gateway IDs
  gatewaySettings: GatewaySettings;
  wallets?: {
    usdtPolygonWallet?: string;
    usdtTrcWallet?: string;
    usdtErcWallet?: string;
    usdcPolygonWallet?: string;
  };
}

export interface UpdateUserData {
  name?: string;
  username?: string;
  password?: string;
  telegram?: string;
  merchantUrl?: string;
  paymentGateways?: string[]; // Gateway IDs
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  gatewaySettings?: GatewaySettings;
  wallets?: {
    usdtPolygonWallet?: string;
    usdtTrcWallet?: string;
    usdtErcWallet?: string;
    usdcPolygonWallet?: string;
  };
}

export interface EditUserFormData {
  name: string;
  username: string;
  password?: string;
  telegram: string;
  merchantUrl: string;
  paymentGateways: string[]; // Gateway IDs
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  gatewaySettings: GatewaySettings; // Required
  wallets?: {
    usdtPolygonWallet?: string;
    usdtTrcWallet?: string;
    usdtErcWallet?: string;
    usdcPolygonWallet?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  result?: T; // Add result field for users list
}

// ✅ NEW: Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ✅ NEW: Users list response interface
export interface UsersListResponse {
  success: boolean;
  users: any[]; // Raw user data from server
  pagination: Pagination;
}

// ✅ NEW: User filters interface
export interface UserFilters {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
}

// Transform server response to UI format
const transformUser = (serverUser: any): User => {
  console.log('Transforming user:', serverUser); // Debug log
  
  // Safely handle gateways array
  const gateways = Array.isArray(serverUser.gateways) ? serverUser.gateways : [];
  console.log('Server gateways:', gateways); // Debug log
  
  const transformedGateways = convertGatewayNamesToIds(gateways);
  console.log('Transformed gateways:', transformedGateways); // Debug log
  
  return {
    id: serverUser.id,
    name: serverUser.fullName || '', // Map fullName to name (Brand Name)
    username: serverUser.username || '',
    telegram: serverUser.telegramId || '', // Map telegramId to telegram
    commision: serverUser.commission || 0, // Map commission to commision (keeping typo) - DEPRECATED
    shopUrl: serverUser.merchantUrl || '', // Map merchantUrl to shopUrl
    paymentGateways: transformedGateways, // Map gateways to paymentGateways and convert to IDs
    payoutDelay: serverUser.payoutDelay || 0, // DEPRECATED
    publicKey: serverUser.publicKey || '',
    status: serverUser.status || 'PENDING',
    createdAt: serverUser.createdAt || new Date().toISOString(),
    // Convert gateway settings keys from names to IDs if they exist
    gatewaySettings: serverUser.gatewaySettings ? (() => {
      const gatewaySettingsWithIds: Record<string, any> = {};
      Object.entries(serverUser.gatewaySettings).forEach(([gatewayName, settings]) => {
        const gatewayId = convertGatewayNamesToIds([gatewayName])[0];
        if (gatewayId) {
          gatewaySettingsWithIds[gatewayId] = settings;
        }
      });
      return gatewaySettingsWithIds;
    })() : undefined,
    // Include wallet information
    wallets: serverUser.wallets
  };
};

// Validation functions
export const validateUserData = (data: EditUserFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Name validation (Brand Name)
  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Brand name must be at least 2 characters long' });
  }
  if (data.name && data.name.length > 100) {
    errors.push({ field: 'name', message: 'Brand name must not exceed 100 characters' });
  }

  // Username validation
  if (!data.username || data.username.trim().length < 3) {
    errors.push({ field: 'username', message: 'Username must be at least 3 characters long' });
  }
  if (data.username && data.username.length > 50) {
    errors.push({ field: 'username', message: 'Username must not exceed 50 characters' });
  }

  // Password validation (only if provided)
  if (data.password && data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }
  if (data.password && data.password.length > 100) {
    errors.push({ field: 'password', message: 'Password must not exceed 100 characters' });
  }

  // Telegram validation
  if (data.telegram && data.telegram.length > 0 && data.telegram.length < 3) {
    errors.push({ field: 'telegram', message: 'Telegram must be at least 3 characters long or empty' });
  }
  if (data.telegram && data.telegram.length > 50) {
    errors.push({ field: 'telegram', message: 'Telegram must not exceed 50 characters' });
  }

  // Merchant URL validation
  if (!data.merchantUrl || data.merchantUrl.trim().length === 0) {
    errors.push({ field: 'merchantUrl', message: 'Merchant URL is required' });
  } else {
    try {
      new URL(data.merchantUrl);
    } catch {
      errors.push({ field: 'merchantUrl', message: 'Please enter a valid URL' });
    }
  }

  // Payment gateways validation
  if (!data.paymentGateways || data.paymentGateways.length === 0) {
    errors.push({ field: 'paymentGateways', message: 'At least one payment gateway must be selected' });
  }

  // Gateway settings validation (now required)
  if (!data.gatewaySettings || Object.keys(data.gatewaySettings).length === 0) {
    errors.push({ field: 'gatewaySettings', message: 'Gateway settings are required for all selected gateways' });
  } else {
    // Validate that all selected gateways have settings
    data.paymentGateways.forEach(gatewayId => {
      if (!data.gatewaySettings[gatewayId]) {
        errors.push({ 
          field: `gatewaySettings.${gatewayId}`, 
          message: `Settings required for Gateway ${gatewayId}` 
        });
      }
    });

    // Validate gateway settings values
    Object.entries(data.gatewaySettings).forEach(([gatewayId, settings]) => {
      if (settings.commission < 0 || settings.commission > 100) {
        errors.push({ 
          field: `gatewaySettings.${gatewayId}.commission`, 
          message: `Commission for Gateway ${gatewayId} must be between 0 and 100` 
        });
      }
      if (settings.payoutDelay < 0 || settings.payoutDelay > 365) {
        errors.push({ 
          field: `gatewaySettings.${gatewayId}.payoutDelay`, 
          message: `Payout delay for Gateway ${gatewayId} must be between 0 and 365 days` 
        });
      }
    });
  }

  // Status validation
  const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
  if (!validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid status value' });
  }

  return errors;
};

// Query keys
export const userKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Create User Hook - Updated to use admin API
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (user: AddUserFormData) => {
      // Validate that gateway settings exist for all selected gateways
      if (!user.gatewaySettings || Object.keys(user.gatewaySettings).length === 0) {
        throw new Error('Gateway settings are required');
      }

      // Validate that all selected gateways have settings
      for (const gatewayId of user.gateways) {
        if (!user.gatewaySettings[gatewayId]) {
          throw new Error(`Settings required for Gateway ${gatewayId}`);
        }
      }

      // Convert gateway IDs to names for API request
      const gatewayNames = convertGatewayIdsToNames(user.gateways);
      
      // Convert gateway settings keys from IDs to names
      const gatewaySettingsForApi: Record<string, any> = {};
      Object.entries(user.gatewaySettings).forEach(([gatewayId, settings]) => {
        const gatewayName = convertGatewayIdsToNames([gatewayId])[0];
        if (gatewayName) {
          gatewaySettingsForApi[gatewayName] = settings;
        }
      });
      
      const requestData: any = {
        fullName: user.brandName, // ✅ Send brandName as fullName
        username: user.username,
        password: user.password,
        telegramId: user.telegramId, // Send as telegramId
        merchantUrl: user.merchantUrl, // Send as merchantUrl
        gateways: gatewayNames, // Send as gateways (not paymentGateways)
        gatewaySettings: gatewaySettingsForApi
      };

      // Add wallets if provided
      if (user.wallets) {
        requestData.wallets = user.wallets;
      }
      
      const response = await api.post<ApiResponse<any>>('/admin/users', requestData);
      return response;
    },
    onSuccess: (response) => {
      console.log('User created successfully:', response);
      
      // Invalidate the users list to refetch it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Set the new user data directly in the cache
      if (response.result) {
        queryClient.setQueryData(userKeys.detail(response.result.id), transformUser(response.result));
      }
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      throw new Error('User creation failed');
    }
  });
}

// ✅ UPDATED: Get Users Hook - Updated to handle pagination response
export function useGetUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.page) {
          params.append('page', filters.page.toString());
        }
        
        if (filters.limit) {
          params.append('limit', filters.limit.toString());
        }
        
        if (filters.status) {
          params.append('status', filters.status);
        }
        
        const queryString = params.toString();
        const response = await api.get<UsersListResponse>(
          `/admin/users${queryString ? `?${queryString}` : ''}`
        );
        
        console.log('API Response:', response); // Debug log
        
        if (!response.users || !Array.isArray(response.users)) {
          throw new Error('Invalid response format: users array not found');
        }
        
        console.log('Raw users data:', response.users); // Debug log
        
        // Transform server response to UI format
        const transformedUsers = response.users.map(transformUser);
        
        console.log('Transformed users:', transformedUsers); // Debug log
        
        return {
          users: transformedUsers,
          pagination: response.pagination
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }
    },
    keepPreviousData: true, // Keep previous data while loading new page
  });
}

// Alternative hook name to match your current usage (without pagination)
export function useUsers(filters?: UserFilters) {
  const result = useGetUsers(filters);
  
  return {
    ...result,
    data: result.data?.users, // Return just the users array for backward compatibility
  };
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>(`/admin/users/${id}`);
      const user = response.result || response.data;
      
      if (user) {
        return transformUser(user);
      }
      
      return user;
    },
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditUserFormData }) => {
      // Validate data before sending
      const validationErrors = validateUserData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
      }

      // Convert gateway IDs to names for API request
      const gatewayNames = convertGatewayIdsToNames(data.paymentGateways);
      
      // Convert gateway settings keys from IDs to names
      const gatewaySettingsForApi: Record<string, any> = {};
      if (data.gatewaySettings) {
        Object.entries(data.gatewaySettings).forEach(([gatewayId, settings]) => {
          const gatewayName = convertGatewayIdsToNames([gatewayId])[0];
          if (gatewayName) {
            gatewaySettingsForApi[gatewayName] = settings;
          }
        });
      }

      // Prepare data for API (remove password if empty)
      const updateData: any = {
        fullName: data.name, // ✅ Send name as fullName (Brand Name)
        username: data.username,
        telegramId: data.telegram, // Send as telegramId
        merchantUrl: data.merchantUrl, // Send as merchantUrl
        gateways: gatewayNames, // Send as gateways
        status: data.status,
        gatewaySettings: gatewaySettingsForApi
      };

      // Only include password if it's provided
      if (data.password && data.password.trim().length > 0) {
        updateData.password = data.password;
      }

      // Add wallets if provided
      if (data.wallets) {
        updateData.wallets = data.wallets;
      }

      const response = await api.put<ApiResponse<any>>(`/admin/users/${id}`, updateData);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      if (response.result) {
        queryClient.setQueryData(userKeys.detail(variables.id), transformUser(response.result));
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete<ApiResponse<void>>(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.post<ApiResponse<any>>(`/admin/users/${id}/suspend`),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      if (response.result) {
        queryClient.setQueryData(userKeys.detail(id), transformUser(response.result));
      }
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.post<ApiResponse<any>>(`/admin/users/${id}/activate`),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      if (response.result) {
        queryClient.setQueryData(userKeys.detail(id), transformUser(response.result));
      }
    },
  });
}