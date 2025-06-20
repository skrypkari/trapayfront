import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useShopProfile } from './useShop';
import { convertGatewayNamesToIds, convertGatewayIdsToNames, getGatewayNameFromId } from '../utils/gatewayMapping';

export interface PaymentLink {
  id: string;
  shopId: string;
  amount: number | null;
  currency: string;
  sourceCurrency?: string | null; // Для Plisio
  gateway: string; // Gateway name from server (plisio, noda, etc.)
  maxPayments?: number;
  currentPayments?: number;
  status: string; // 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  expiresAt?: string | null;
  successUrl?: string | null;
  failUrl?: string | null;
  country?: string | null;
  language?: string;
  linkUrl: string;
  createdAt: string;
  updatedAt: string;
  shop?: {
    name: string;
    username: string;
  };
  payments?: any[];
}

export interface CreatePaymentLinkData {
  amount?: number;
  currency: string;
  sourceCurrency?: string; // Для Plisio (Gateway 0001)
  gateway: string; // Gateway ID (0001, 0010, etc.)
  maxPayments?: number;
  expiresAt?: string;
}

export interface UpdatePaymentLinkData {
  amount?: number;
  currency?: string;
  sourceCurrency?: string;
  gateway?: string; // Gateway ID
  maxPayments?: number;
  expiresAt?: string;
}

export interface PaymentLinkFilters {
  status?: string;
  gateway?: string; // Gateway name for API
  search?: string;
  page?: number;
  limit?: number;
}

// Query keys
export const paymentLinkKeys = {
  all: ['paymentLinks'] as const,
  lists: () => [...paymentLinkKeys.all, 'list'] as const,
  list: (filters: PaymentLinkFilters) => [...paymentLinkKeys.lists(), { filters }] as const,
  details: () => [...paymentLinkKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentLinkKeys.details(), id] as const,
  shopGateways: () => [...paymentLinkKeys.all, 'shopGateways'] as const,
};

// Transform server response to UI format
const transformPaymentLink = (serverLink: any): PaymentLink => {
  return {
    id: serverLink.id,
    shopId: serverLink.shopId,
    amount: serverLink.amount,
    currency: serverLink.currency,
    sourceCurrency: serverLink.sourceCurrency,
    gateway: serverLink.gateway, // Keep gateway name from server
    maxPayments: serverLink.maxPayments,
    currentPayments: serverLink.currentPayments,
    status: serverLink.status,
    expiresAt: serverLink.expiresAt,
    successUrl: serverLink.successUrl,
    failUrl: serverLink.failUrl,
    country: serverLink.country,
    language: serverLink.language,
    linkUrl: serverLink.linkUrl,
    createdAt: serverLink.createdAt,
    updatedAt: serverLink.updatedAt,
    shop: serverLink.shop,
    payments: serverLink.payments || []
  };
};

// Hooks
export function usePaymentLinks(filters?: PaymentLinkFilters) {
  return useQuery({
    queryKey: paymentLinkKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.gateway && filters.gateway !== 'all') {
        // Convert gateway ID to name for API request
        const gatewayName = getGatewayNameFromId(filters.gateway);
        params.append('gateway', gatewayName.toLowerCase());
      }
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString();
      const response = await api.get<{ 
        success: boolean; 
        links: any[]; // Server returns 'links' not 'result'
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/payment-links${queryString ? `?${queryString}` : ''}`);
      
      // Transform server response to UI format
      const transformedPayments = (response.links || []).map(transformPaymentLink);
      
      return {
        paymentLinks: transformedPayments,
        total: response.pagination?.total || transformedPayments.length,
        pagination: response.pagination
      };
    },
  });
}

export function useShopGateways() {
  const { data: profile } = useShopProfile();
  
  return useQuery({
    queryKey: paymentLinkKeys.shopGateways(),
    queryFn: async () => {
      // Return gateway IDs from profile (already converted in useShopProfile)
      return profile?.paymentGateways || [];
    },
    enabled: !!profile,
  });
}

export function usePaymentLink(id: string) {
  return useQuery({
    queryKey: paymentLinkKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; result: any }>(`/payment-links/${id}`);
      return transformPaymentLink(response.result);
    },
    enabled: !!id,
  });
}

export function useCreatePaymentLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePaymentLinkData) => {
      console.log('Creating payment link with data:', data); // Debug log

      // ✅ FIXED: Send gateway ID directly, not name
      const requestData: any = {
        amount: data.amount,
        currency: data.currency,
        gateway: data.gateway, // Send gateway ID directly (0001, 0010, etc.)
        maxPayments: data.maxPayments
      };

      // Add sourceCurrency for Plisio (Gateway 0001)
      if (data.sourceCurrency) {
        requestData.sourceCurrency = data.sourceCurrency;
      }

      // Add expiresAt if provided
      if (data.expiresAt) {
        requestData.expiresAt = data.expiresAt;
      }

      console.log('Final request data (sending gateway ID):', requestData); // Debug log

      // Execute POST request to create payment link
      const response = await api.post<{ 
        success: boolean; 
        message: string;
        result: any;
      }>('/payment-links', requestData);
      
      // Transform response to PaymentLink format for UI
      return transformPaymentLink(response.result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentLinkKeys.lists() });
    },
  });
}

export function useUpdatePaymentLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePaymentLinkData }) => {
      // ✅ FIXED: Send gateway ID directly, not name
      const dataForApi = {
        ...data,
        gateway: data.gateway // Send gateway ID directly if provided
      };
      
      const response = await api.patch<{ success: boolean; result: any }>(`/payment-links/${id}`, dataForApi);
      return transformPaymentLink(response.result);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentLinkKeys.lists() });
      queryClient.setQueryData(paymentLinkKeys.detail(variables.id), data);
    },
  });
}

export function useDeletePaymentLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payment-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentLinkKeys.lists() });
    },
  });
}

export function useTogglePaymentLinkStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) => {
      const response = await api.patch<{ success: boolean; result: any }>(`/payment-links/${id}/status`, { status });
      return transformPaymentLink(response.result);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentLinkKeys.lists() });
      queryClient.setQueryData(paymentLinkKeys.detail(variables.id), data);
    },
  });
}

export function usePublicPaymentLink(id: string) {
  return useQuery({
    queryKey: ['publicPaymentLink', id],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; result: any }>(`/public/payment-links/${id}`);
      return transformPaymentLink(response.result);
    },
    enabled: !!id,
  });
}