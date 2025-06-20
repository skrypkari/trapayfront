import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  Plus,
  Calendar,
  Link2,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import DatePicker from '../components/DatePicker';
import CustomSelect from '../components/CustomSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import { getGatewayInfo, convertGatewayNamesToIds } from '../utils/gatewayMapping';
import { 
  usePaymentLinks, 
  useCreatePaymentLink, 
  useUpdatePaymentLink, 
  useDeletePaymentLink, 
  useTogglePaymentLinkStatus,
  useShopGateways,
  type PaymentLink,
  type CreatePaymentLinkData,
  type PaymentLinkFilters 
} from '../hooks/usePaymentLinks';

const CreateLinkModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<CreatePaymentLinkData>({
    amount: undefined,
    currency: 'USD',
    gateway: '',
    maxPayments: 1
  });
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const createMutation = useCreatePaymentLink();
  const { data: shopGateways, isLoading: gatewaysLoading } = useShopGateways();

  // Криптовалюты для sourceCurrency в Gateway 0001 (Plisio)
  const cryptoCurrencyOptions = [
    { value: 'USDT', label: 'USDT' },
    { value: 'TON', label: 'TON' },
    { value: 'BTC', label: 'BTC' },
    { value: 'ETH', label: 'ETH' },
    { value: 'LTC', label: 'LTC' },
    { value: 'BCH', label: 'BCH' },
    { value: 'DOGE', label: 'DOGE' }
  ];

  // Фиатные валюты для currency (для всех гейтвеев)
  const fiatCurrencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'RUB', label: 'RUB' }
  ];

  // Создаем опции гейтвеев на основе данных шопа
  const gatewayOptions = shopGateways?.map(gatewayId => {
    const gatewayInfo = getGatewayInfo(gatewayId);
    return {
      value: gatewayId,
      label: gatewayInfo ? gatewayInfo.displayName : `Gateway ${gatewayId}`
    };
  }) || [];

  // Устанавливаем первый доступный гейтвей по умолчанию
  useEffect(() => {
    if (shopGateways && shopGateways.length > 0 && !formData.gateway) {
      const firstGateway = shopGateways[0];
      setFormData(prev => ({ 
        ...prev, 
        gateway: firstGateway,
        currency: 'USD', // Всегда фиат для currency
        // Для Gateway 0001 (Plisio) устанавливаем sourceCurrency по умолчанию
        ...(firstGateway === '0001' ? { sourceCurrency: 'USDT' } : {})
      }));
    }
  }, [shopGateways, formData.gateway]);

  // Обновляем настройки при смене гейтвея
  useEffect(() => {
    if (formData.gateway === '0001') {
      // Для Gateway 0001 (Plisio) устанавливаем sourceCurrency если его нет
      if (!formData.sourceCurrency) {
        setFormData(prev => ({ 
          ...prev, 
          sourceCurrency: 'USDT'
        }));
      }
    } else {
      // Для других гейтвеев убираем sourceCurrency
      if (formData.sourceCurrency) {
        const { sourceCurrency, ...rest } = formData;
        setFormData(rest);
      }
    }
  }, [formData.gateway]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData: CreatePaymentLinkData = {
        ...formData,
        expiresAt: expiryDate ? expiryDate.toISOString() : undefined
      };

      await createMutation.mutateAsync(submitData);
      toast.success('Payment link created successfully!');
      onClose();
      
      // Reset form
      setFormData({
        amount: undefined,
        currency: 'USD',
        gateway: shopGateways?.[0] || '',
        maxPayments: 1
      });
      setExpiryDate(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment link');
    }
  };

  const isGateway0001 = formData.gateway === '0001'; // Plisio

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create Payment Link</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Основные параметры */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Required Parameters
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gateway *
                  </label>
                  {gatewaysLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    <CustomSelect
                      value={formData.gateway}
                      onChange={(value) => setFormData({ ...formData, gateway: value })}
                      options={gatewayOptions}
                      placeholder="Select gateway"
                    />
                  )}
                  {shopGateways && shopGateways.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">No payment gateways available. Please contact support.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency *
                    </label>
                    <CustomSelect
                      value={formData.currency}
                      onChange={(value) => setFormData({ ...formData, currency: value })}
                      options={fiatCurrencyOptions}
                      placeholder="Currency"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Payments
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxPayments || ''}
                    onChange={(e) => setFormData({ ...formData, maxPayments: e.target.value ? parseInt(e.target.value) : 1 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum number of payments allowed (1 = single use)
                  </p>
                </div>
              </div>

              {/* Параметры специфичные для Gateway 0001 (Plisio) */}
              {isGateway0001 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center space-x-2">
                    <span>Gateway 0001 Specific Parameters</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Required</span>
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source Currency *
                    </label>
                    <CustomSelect
                      value={formData.sourceCurrency || 'USDT'}
                      onChange={(value) => setFormData({ 
                        ...formData, 
                        sourceCurrency: value 
                      })}
                      options={cryptoCurrencyOptions}
                      placeholder="Select source currency"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The cryptocurrency that customers will use to pay
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Gateway 0001 Currency Setup</h4>
                        <div className="mt-2 text-sm text-blue-700 space-y-1">
                          <p>• <strong>Currency:</strong> Fiat currency for pricing (USD, EUR, GBP, RUB)</p>
                          <p>• <strong>Source Currency:</strong> Cryptocurrency for actual payment (USDT, BTC, etc.)</p>
                          <p>• Customer sees price in fiat but pays with crypto</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Дополнительные настройки */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Optional Parameters
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires At
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(true)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-left flex items-center space-x-2 hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className={`text-sm ${expiryDate ? 'text-gray-900' : 'text-gray-500'}`}>
                        {expiryDate ? expiryDate.toLocaleDateString() : 'Optional'}
                      </span>
                    </button>
                    <AnimatePresence>
                      {isDatePickerOpen && (
                        <DatePicker
                          value={expiryDate}
                          onChange={(date) => {
                            setExpiryDate(date);
                            setIsDatePickerOpen(false);
                          }}
                          onClose={() => setIsDatePickerOpen(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !formData.gateway || !formData.currency}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {createMutation.isPending && <LoadingSpinner size="sm" />}
                  <span>{createMutation.isPending ? 'Creating...' : 'Create Link'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LinkPreviewModal: React.FC<{
  link: PaymentLink;
  onClose: () => void;
}> = ({ link, onClose }) => {
  const [showCopied, setShowCopied] = useState<string | null>(null);
  
  // Convert gateway name to ID for display
  const gatewayId = convertGatewayNamesToIds([link.gateway])[0];
  const gatewayInfo = getGatewayInfo(gatewayId);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Link</h3>
                <p className="text-sm text-gray-500">{link.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Payment Link URL</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-900 font-mono truncate mr-2">{link.linkUrl}</div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(link.linkUrl, 'link-url')}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showCopied === 'link-url' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={link.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Amount</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {link.amount === null ? 'Variable' : link.amount.toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Currency</div>
                <div className="text-lg font-semibold text-gray-900">
                  {link.currency}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Gateway</div>
                <div className="text-sm text-gray-900">
                  {gatewayInfo ? gatewayInfo.displayName : `Gateway ${gatewayId || link.gateway}`}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                <div className="mt-1">
                  {link.status === 'ACTIVE' && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  )}
                  {link.status === 'INACTIVE' && (
                    <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-lg w-fit">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Inactive</span>
                    </div>
                  )}
                  {link.status === 'EXPIRED' && (
                    <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg w-fit">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Expired</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Usage</div>
                <div className="text-lg font-semibold text-gray-900">
                  {link.currentPayments || 0} / {link.maxPayments || 'Unlimited'}
                </div>
              </div>

              {link.sourceCurrency && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Source Currency</div>
                  <div className="text-lg font-semibold text-gray-900">{link.sourceCurrency}</div>
                </div>
              )}

              {link.expiresAt && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Expires At</div>
                  <div className="text-sm text-gray-900">
                    {new Date(link.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Created At</div>
                <div className="text-sm text-gray-900">
                  {new Date(link.createdAt).toLocaleDateString()}
                </div>
              </div>

              {link.shop && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Shop</div>
                  <div className="text-sm text-gray-900">{link.shop.name}</div>
                  <div className="text-xs text-gray-500">@{link.shop.username}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PaymentLinks: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [showCopied, setShowCopied] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const filters: PaymentLinkFilters = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    gateway: gatewayFilter !== 'all' ? gatewayFilter : undefined,
    search: searchTerm || undefined,
    page: currentPage,
    limit: pageSize
  };

  const { data: paymentLinksData, isLoading, error } = usePaymentLinks(filters);
  const { data: shopGateways } = useShopGateways();
  const deletePaymentLinkMutation = useDeletePaymentLink();
  const toggleStatusMutation = useTogglePaymentLinkStatus();

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    { value: 'INACTIVE', label: 'Inactive', icon: <XCircle className="h-4 w-4 text-gray-600" /> },
    { value: 'EXPIRED', label: 'Expired', icon: <AlertTriangle className="h-4 w-4 text-orange-600" /> }
  ];

  // Создаем опции фильтра гейтвеев на основе доступных гейтвеев шопа
  const gatewayOptions = [
    { value: 'all', label: 'All Gateways' },
    ...(shopGateways?.map(gatewayId => {
      const gatewayInfo = getGatewayInfo(gatewayId);
      return {
        value: gatewayId,
        label: gatewayInfo ? gatewayInfo.displayName : `Gateway ${gatewayId}`
      };
    }) || [])
  ];

  const handleCopyLink = (linkUrl: string, id: string) => {
    navigator.clipboard.writeText(linkUrl);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
    toast.success('Link copied to clipboard!');
  };

  const handleDeleteLink = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment link?')) {
      try {
        await deletePaymentLinkMutation.mutateAsync(id);
        toast.success('Payment link deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete payment link');
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await toggleStatusMutation.mutateAsync({ id, status: newStatus as any });
      toast.success(`Payment link ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment link status');
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">
          <AlertTriangle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-600">Failed to load payment links. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Links</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Link</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payment links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Filter by status"
              />
              <CustomSelect
                value={gatewayFilter}
                onChange={setGatewayFilter}
                options={gatewayOptions}
                placeholder="Filter by gateway"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Link ID</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Currency</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Gateway</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Usage</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Created</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentLinksData?.paymentLinks?.map((link) => {
                  // Convert gateway name to ID for display
                  const gatewayId = convertGatewayNamesToIds([link.gateway])[0];
                  const gatewayInfo = getGatewayInfo(gatewayId);
                  
                  return (
                    <tr key={link.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {link.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-gray-900">
                          {link.amount === null ? 'Variable' : link.amount.toLocaleString()}
                        </span>
                        {link.sourceCurrency && (
                          <div className="text-xs text-gray-500">via {link.sourceCurrency}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-gray-900">
                          {link.currency}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-900">
                          {gatewayInfo ? gatewayInfo.displayName : `Gateway ${gatewayId || link.gateway}`}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          {link.currentPayments || 0} / {link.maxPayments || '∞'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${
                          link.status === 'ACTIVE' ? 'bg-green-50 text-green-600' :
                          link.status === 'INACTIVE' ? 'bg-gray-50 text-gray-600' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                          {link.status === 'ACTIVE' && <CheckCircle2 className="h-4 w-4" />}
                          {link.status === 'INACTIVE' && <XCircle className="h-4 w-4" />}
                          {link.status === 'EXPIRED' && <AlertTriangle className="h-4 w-4" />}
                          <span className="text-sm font-medium">{link.status}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleCopyLink(link.linkUrl, link.id)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg"
                          >
                            {showCopied === link.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedLink(link)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }) || []}
              </tbody>
            </table>
            
            {/* Empty state */}
            {!isLoading && (!paymentLinksData?.paymentLinks || paymentLinksData.paymentLinks.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No payment links found</p>
                <p className="text-gray-400 text-xs mt-1">Create your first payment link to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {paymentLinksData?.pagination && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((paymentLinksData.pagination.page - 1) * paymentLinksData.pagination.limit) + 1} to{' '}
              {Math.min(paymentLinksData.pagination.page * paymentLinksData.pagination.limit, paymentLinksData.pagination.total)} of{' '}
              {paymentLinksData.pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {paymentLinksData.pagination.page} of {paymentLinksData.pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(paymentLinksData.pagination.totalPages, currentPage + 1))}
                disabled={currentPage === paymentLinksData.pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateLinkModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
        {selectedLink && (
          <LinkPreviewModal
            link={selectedLink}
            onClose={() => setSelectedLink(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentLinks;