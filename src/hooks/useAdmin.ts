import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// ===== TYPES =====

export interface AdminDashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalPayments: number;
  averagePayment: number;
  dailyRevenue: { date: string; amount: number }[];
}

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: 'admin';
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  user: AdminUser;
}

export interface AdminStatsResponse {
  success: boolean;
  result: AdminDashboardStats;
}

// Admin Payment Types - ✅ UPDATED: Added PROCESSING, CHARGEBACK and REFUND statuses
export interface AdminPayment {
  id: string;
  shopId: string;
  shopName: string;
  shopUsername: string;
  gateway: string;
  orderId: string;
  amount: number;
  currency: string;
  sourceCurrency?: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'CHARGEBACK' | 'REFUND';
  usage: 'ONCE' | 'REUSABLE';
  externalPaymentUrl?: string;
  gatewayPaymentId?: string;
  customerEmail?: string;
  customerName?: string;
  cardLast4?: string;
  paymentMethod?: string;
  bankId?: string;
  remitterIban?: string;
  remitterName?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  webhookLogs?: WebhookLog[];
  gatewayOrderId?: string;
  // ✅ NEW: Chargeback specific fields
  chargebackAmount?: number;
  notes?: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  statusCode: number;
  retryCount: number;
  createdAt: string;
}

export interface AdminPaymentFilters {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'PROCESSING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'CHARGEBACK' | 'REFUND';
  gateway?: string;
  shopId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AdminPaymentsResponse {
  success: boolean;
  payments: AdminPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminPaymentResponse {
  success: boolean;
  result: AdminPayment;
}

// ✅ UPDATED: Added chargeback and refund specific fields
export interface UpdatePaymentStatusData {
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'CHARGEBACK' | 'REFUND';
  notes?: string;
  chargebackAmount?: number; // Required for CHARGEBACK status
}

// ===== NEW: Admin Payout Stats Types =====
export interface AdminPayoutStats {
  totalPayout: number;      // Сумма всех оплаченных мерчанту транзакций, с вычетом комиссии, в USDT
  awaitingPayout: number;   // Сумма всех ожидающих выплат (eligible for payout), с вычетом комиссии, в USDT  
  thisMonth: number;        // Сумма всех выплат в текущем месяце, с учетом комиссии, в USDT
  availableBalance: number; // Сумма всех ожидающих выплат без вычета комиссии, в USDT
}

export interface AdminPayoutStatsResponse {
  success: boolean;
  result: AdminPayoutStats;
}

// ===== NEW: Admin Payout Merchants Types =====
export interface AdminPayoutMerchant {
  id: string;
  fullName: string;
  username: string;
  telegramId: string;
  merchantUrl: string;
  wallets: {
    usdtPolygonWallet?: string;
    usdtTrcWallet?: string;
    usdtErcWallet?: string;
    usdcPolygonWallet?: string;
  };
  totalAmountUSDT: number;
  totalAmountAfterCommissionUSDT: number;
  paymentsCount: number;
  oldestPaymentDate: string;
  gatewayBreakdown: {
    gateway: string;
    count: number;
    amountUSDT: number;
    amountAfterCommissionUSDT: number;
    commission: number;
  }[];
}

export interface AdminPayoutMerchantsFilters {
  page?: number;
  limit?: number;
  minAmount?: number;
  search?: string;
}

export interface AdminPayoutMerchantsResponse {
  success: boolean;
  merchants: AdminPayoutMerchant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalMerchants: number;
    totalAmountUSDT: number;
    totalAmountAfterCommissionUSDT: number;
  };
}

// ===== NEW: Admin Payout Types =====
export interface AdminPayout {
  id: string;
  shopId: string;
  shopName: string;
  shopUsername: string;
  amount: number;
  network: string;
  walletAddress: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  notes?: string;
  txid?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface CreatePayoutData {
  shopId: string;
  amount: number;
  network: string;
  notes?: string;
}

export interface AdminPayoutFilters {
  page?: number;
  limit?: number;
  network?: string;
  search?: string;
  status?: 'PENDING' | 'COMPLETED' | 'REJECTED';
}

export interface AdminPayoutsResponse {
  success: boolean;
  payouts: AdminPayout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminPayoutResponse {
  success: boolean;
  result: AdminPayout;
}

// ===== QUERY KEYS =====

export const adminKeys = {
  all: ['admin'] as const,
  auth: () => [...adminKeys.all, 'auth'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  statsList: (period?: string) => [...adminKeys.stats(), 'list', period] as const,
  payments: () => [...adminKeys.all, 'payments'] as const,
  paymentsList: (filters?: AdminPaymentFilters) => [...adminKeys.payments(), 'list', filters] as const,
  payment: (id: string) => [...adminKeys.payments(), 'detail', id] as const,
  payouts: () => [...adminKeys.all, 'payouts'] as const,
  payoutStats: () => [...adminKeys.payouts(), 'stats'] as const,
  payoutMerchants: () => [...adminKeys.payouts(), 'merchants'] as const,
  payoutMerchantsList: (filters?: AdminPayoutMerchantsFilters) => [...adminKeys.payoutMerchants(), 'list', filters] as const,
  payoutsList: (filters?: AdminPayoutFilters) => [...adminKeys.payouts(), 'list', filters] as const,
  payout: (id: string) => [...adminKeys.payouts(), 'detail', id] as const,
};

// ===== ADMIN AUTH HOOKS =====

// Hook to check admin authentication
export function useAdminAuth() {
  const query = useQuery({
    queryKey: adminKeys.auth(),
    queryFn: async () => {
      try {
        console.log('🔍 Checking admin auth...');
        const response = await api.get<AdminAuthResponse>('/admin/auth');
        console.log('✅ Admin auth successful:', response);
        return response.user;
      } catch (error: any) {
        console.error('❌ Admin auth failed:', error);
        throw error;
      }
    },
    retry: false, // Don't retry on auth failure
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    ...query,
    isAuthenticated: query.isSuccess && !!query.data,
    adminUser: query.data,
  };
}

// ===== ADMIN DASHBOARD STATS HOOKS =====

// Hook to get admin dashboard statistics
export function useAdminDashboardStats(period: string = '30d') {
  return useQuery({
    queryKey: adminKeys.statsList(period),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) {
        params.append('period', period);
      }
      
      const queryString = params.toString();
      const response = await api.get<AdminStatsResponse>(
        `/admin/statistics${queryString ? `?${queryString}` : ''}`
      );
      
      return response.result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ===== ADMIN PAYMENTS HOOKS =====

// Hook to get admin payments with filters and pagination
export function useAdminPayments(filters?: AdminPaymentFilters) {
  return useQuery({
    queryKey: adminKeys.paymentsList(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.gateway) params.append('gateway', filters.gateway);
      if (filters?.shopId) params.append('shopId', filters.shopId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      const response = await api.get<AdminPaymentsResponse>(
        `/admin/payments${queryString ? `?${queryString}` : ''}`
      );
      
      return response;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to get single admin payment by ID
export function useAdminPayment(id: string) {
  return useQuery({
    queryKey: adminKeys.payment(id),
    queryFn: async () => {
      const response = await api.get<AdminPaymentResponse>(`/admin/payments/${id}`);
      return response.result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to update payment status
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePaymentStatusData }) => {
      const response = await api.put<AdminPaymentResponse>(`/admin/payments/${id}`, data);
      return response.result;
    },
    onSuccess: (data, variables) => {
      // Invalidate payments list
      queryClient.invalidateQueries({ queryKey: adminKeys.payments() });
      // Update specific payment cache
      queryClient.setQueryData(adminKeys.payment(variables.id), data);
    },
  });
}

// ===== NEW: ADMIN PAYOUT STATS HOOKS =====

// Hook to get admin payout statistics
export function useAdminPayoutStats() {
  return useQuery({
    queryKey: adminKeys.payoutStats(),
    queryFn: async () => {
      const response = await api.get<AdminPayoutStatsResponse>('/admin/payout/stats');
      return response.result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ===== NEW: ADMIN PAYOUT MERCHANTS HOOKS =====

// Hook to get merchants awaiting payout
export function useAdminPayoutMerchants(filters?: AdminPayoutMerchantsFilters) {
  return useQuery({
    queryKey: adminKeys.payoutMerchantsList(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters?.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      const response = await api.get<AdminPayoutMerchantsResponse>(
        `/admin/payout/merchants${queryString ? `?${queryString}` : ''}`
      );
      
      return response;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ===== NEW: ADMIN PAYOUTS HOOKS =====

// Hook to get admin payouts with filters and pagination
export function useAdminPayouts(filters?: AdminPayoutFilters) {
  return useQuery({
    queryKey: adminKeys.payoutsList(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.network) params.append('network', filters.network);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      
      const queryString = params.toString();
      const response = await api.get<AdminPayoutsResponse>(
        `/admin/payouts${queryString ? `?${queryString}` : ''}`
      );
      
      return response;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to get single admin payout by ID
export function useAdminPayout(id: string) {
  return useQuery({
    queryKey: adminKeys.payout(id),
    queryFn: async () => {
      const response = await api.get<AdminPayoutResponse>(`/admin/payouts/${id}`);
      return response.result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to create admin payout
export function useCreateAdminPayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePayoutData) => {
      const response = await api.post<AdminPayoutResponse>('/admin/payout', data);
      return response.result;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: adminKeys.payouts() });
      queryClient.invalidateQueries({ queryKey: adminKeys.payoutMerchants() });
      queryClient.invalidateQueries({ queryKey: adminKeys.payoutStats() });
    },
  });
}

// Hook to delete admin payout
export function useDeleteAdminPayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/payouts/${id}`);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: adminKeys.payouts() });
      queryClient.invalidateQueries({ queryKey: adminKeys.payoutMerchants() });
      queryClient.invalidateQueries({ queryKey: adminKeys.payoutStats() });
    },
  });
}

// ===== MAIN ADMIN HOOK =====

// Main hook that provides all admin functionality
export function useAdmin() {
  const auth = useAdminAuth();
  
  return {
    // Auth
    ...auth,
    
    // Stats
    useStats: useAdminDashboardStats,
    usePayoutStats: useAdminPayoutStats,
    
    // Payments
    usePayments: useAdminPayments,
    usePayment: useAdminPayment,
    useUpdatePaymentStatus: useUpdatePaymentStatus,
    
    // Payouts
    usePayoutMerchants: useAdminPayoutMerchants,
    usePayouts: useAdminPayouts,
    usePayout: useAdminPayout,
    useCreatePayout: useCreateAdminPayout,
    useDeletePayout: useDeleteAdminPayout,
    
    // Query keys for external use
    queryKeys: adminKeys,
  };
}

// Export individual hooks for specific use cases
export { useAdminAuth as useAdminAuthOnly };
export { useAdminDashboardStats as useAdminStatsOnly };
export { useAdminPayments as useAdminPaymentsOnly };
export { useAdminPayment as useAdminPaymentOnly };
export { useUpdatePaymentStatus as useUpdatePaymentStatusOnly };
export { useAdminPayoutStats as useAdminPayoutStatsOnly };
export { useAdminPayoutMerchants as useAdminPayoutMerchantsOnly };
export { useAdminPayouts as useAdminPayoutsOnly };
export { useAdminPayout as useAdminPayoutOnly };
export { useCreateAdminPayout as useCreateAdminPayoutOnly };
export { useDeleteAdminPayout as useDeleteAdminPayoutOnly };