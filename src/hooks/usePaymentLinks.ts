import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useShopProfile } from './useShop';
import { convertGatewayNamesToIds, convertGatewayIdsToNames, getGatewayNameFromId } from '../utils/gatewayMapping';

export interface PaymentLink {
  id: string;
  gateway: string; // Gateway ID (0001, 0010, etc.)
  amount: number | null;
  currency: string;
  usage: string; // 'ONCE' | 'REUSABLE'
  status: string; // 'pending' | 'failed' | 'completed'
  payment_url: string | null;
  success_url: string | null;
  fail_url: string | null;
  expires_at: string | null;
  order_id: string;
  created_at: string;
  updated_at: string;
  // Computed fields for UI compatibility
  type: 'single' | 'multi' | 'subscription' | 'donation';
  linkUrl: string;
  successUrl: string | null;
  failUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentLinkData {
  amount?: number;
  currency: string;
  type: 'single' | 'multi' | 'subscription' | 'donation';
  gateway: string; // Gateway ID
  expiresAt?: string;
  successUrl?: string;
  failUrl?: string;
  customFields?: Record<string, any>;
}

export interface UpdatePaymentLinkData {
  amount?: number;
  currency?: string;
  type?: 'single' | 'multi' | 'subscription' | 'donation';
  gateway?: string; // Gateway ID
  expiresAt?: string;
  successUrl?: string;
  failUrl?: string;
  customFields?: Record<string, any>;
}

export interface PaymentLinkFilters {
  status?: string;
  type?: string;
  gateway?: string; // Gateway ID
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
    ...serverLink,
    // Convert gateway name to ID
    gateway: convertGatewayNamesToIds([serverLink.gateway])[0],
    // Map server fields to UI fields
    type: serverLink.usage === 'ONCE' ? 'single' : 'multi',
    linkUrl: serverLink.payment_url || '',
    successUrl: serverLink.success_url,
    failUrl: serverLink.fail_url,
    expiresAt: serverLink.expires_at,
    createdAt: serverLink.created_at,
    updatedAt: serverLink.updated_at,
  };
};

// Hooks
export function usePaymentLinks(filters?: PaymentLinkFilters) {
  return useQuery({
    queryKey: paymentLinkKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters?.gateway && filters.gateway !== 'all') {
        // Convert gateway ID to name for API request
        const gatewayName = getGatewayNameFromId(filters.gateway);
        params.append('gateway', gatewayName);
      }
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString();
      const response = await api.get<{ 
        success: boolean; 
        payments: any[]; // Server returns 'payments' not 'paymentLinks'
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/payment-links${queryString ? `?${queryString}` : ''}`);
      
      // Transform server response to UI format
      const transformedPayments = (response.payments || []).map(transformPaymentLink);
      
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
      const response = await api.get<{ success: boolean; data: any }>(`/payment-links/${id}`);
      return transformPaymentLink(response.data);
    },
    enabled: !!id,
  });
}

export function useCreatePaymentLink() {
  const queryClient = useQueryClient();
  const { data: profile } = useShopProfile();
  
  return useMutation({
    mutationFn: async (data: CreatePaymentLinkData) => {
      if (!profile?.publicKey) {
        throw new Error('Public key not found. Please ensure you are logged in.');
      }

      // Convert gateway ID to name for API request
      const gatewayName = getGatewayNameFromId(data.gateway);
      console.log('Gateway ID:', data.gateway, 'Gateway Name:', gatewayName); // Debug log

      // Generate unique order_id
      const orderId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare base required parameters for all gateways
      const requestData: any = {
        public_key: profile.publicKey,
        gateway: data.gateway, // Use real gateway name for API
        order_id: orderId,
        amount: data.amount,
        currency: data.currency,
        usage: data.type === 'single' ? 'ONCE' : 'REUSABLE'
      };

      // Add general optional parameters
      if (data.expiresAt) {
        requestData.expires_at = data.expiresAt;
      }
      
      if (data.successUrl) {
        requestData.success_url = data.successUrl;
      }
      
      if (data.failUrl) {
        requestData.fail_url = data.failUrl;
      }

      // Add customer fields only if usage = ONCE
      if (requestData.usage === 'ONCE') {
        if (data.customFields?.customer_email) {
          requestData.customer_email = data.customFields.customer_email;
        }
        if (data.customFields?.customer_name) {
          requestData.customer_name = data.customFields.customer_name;
        }
      }

      // Add gateway-specific parameters
      if (gatewayName === 'Plisio') {
        // ✅ FIXED: For Plisio required parameters
        if (data.customFields?.source_currency) {
          requestData.source_currency = data.customFields.source_currency;
          console.log('Adding source_currency for Plisio:', data.customFields.source_currency); // Debug log
        } else {
          throw new Error('Source currency is required for Gateway 0001 (Plisio)');
        }
        // Force ONCE for Plisio
        requestData.usage = 'ONCE';
      } else if (gatewayName === 'Rapyd') {
        // For Rapyd required parameters
        if (data.customFields?.country) {
          requestData.country = data.customFields.country;
        } else {
          throw new Error('Country is required for Gateway 0010 (Rapyd)');
        }
        
        // Optional parameters for Rapyd
        if (data.customFields?.language) {
          requestData.language = data.customFields.language;
        }
        if (data.customFields?.amount_is_editable !== undefined) {
          requestData.amount_is_editable = data.customFields.amount_is_editable;
        }
        if (data.customFields?.max_payments) {
          requestData.max_payments = data.customFields.max_payments;
        }
        if (data.customFields?.customer) {
          requestData.customer = data.customFields.customer;
        }
      } else if (gatewayName === 'Noda') {
        // For Noda currency already added in base parameters
        // Optional parameters for Noda
        if (data.customFields?.expiryDate) {
          requestData.expiryDate = data.customFields.expiryDate;
        }
      }

      console.log('Final request data:', requestData); // Debug log

      // Execute POST request to create payment
      const response = await api.post<{ 
        success: boolean; 
        message: string;
        result: {
          id: string;
          gateway_payment_id: string;
          payment_url: string;
          status: string;
        }
      }>('/payments/create', requestData);
      
      // Transform response to PaymentLink format for UI
      const paymentLink: PaymentLink = {
        id: response.result.id,
        gateway: data.gateway, // Keep gateway ID for frontend
        amount: data.amount || null,
        currency: data.currency,
        usage: requestData.usage,
        status: response.result.status.toLowerCase(),
        payment_url: response.result.payment_url,
        success_url: data.successUrl || null,
        fail_url: data.failUrl || null,
        expires_at: data.expiresAt || null,
        order_id: orderId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // UI compatibility fields
        type: data.type,
        linkUrl: response.result.payment_url,
        successUrl: data.successUrl || null,
        failUrl: data.failUrl || null,
        expiresAt: data.expiresAt || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return paymentLink;
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
      // Convert gateway ID to name if provided
      const dataForApi = {
        ...data,
        gateway: data.gateway ? getGatewayNameFromId(data.gateway) : undefined
      };
      
      const response = await api.patch<{ success: boolean; data: any }>(`/payment-links/${id}`, dataForApi);
      return transformPaymentLink(response.data);
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
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'disabled' }) => {
      const response = await api.patch<{ success: boolean; data: any }>(`/payment-links/${id}/status`, { status });
      return transformPaymentLink(response.data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentLinkKeys.lists() });
      queryClient.setQueryData(paymentLinkKeys.detail(variables.id), data);
    },
  });
}

export function usePublicPaymentLink(linkUrl: string) {
  return useQuery({
    queryKey: ['publicPaymentLink', linkUrl],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any }>(`/public/payment-links/${linkUrl}`);
      return transformPaymentLink(response.data);
    },
    enabled: !!linkUrl,
  });
}