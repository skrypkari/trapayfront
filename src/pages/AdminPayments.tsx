import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  Globe,
  MoreHorizontal,
  CreditCard,
  Building2,
  Bitcoin,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  X,
  User,
  Mail,
  Wallet,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import DatePicker from '../components/DatePicker';
import CustomSelect from '../components/CustomSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAdmin, type AdminPayment, type AdminPaymentFilters } from '../hooks/useAdmin';
import { formatCurrency, formatCurrencyCompact } from '../utils/currency';

const PaymentDetailsModal: React.FC<{
  payment: AdminPayment;
  onClose: () => void;
  onUpdateStatus: (id: string, status: AdminPayment['status'], notes?: string, chargebackAmount?: number) => void;
}> = ({ payment, onClose, onUpdateStatus }) => {
  const [showCopied, setShowCopied] = useState<string | null>(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<AdminPayment['status']>(payment.status);
  const [notes, setNotes] = useState('');
  const [chargebackAmount, setChargebackAmount] = useState<string>('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

  const handleStatusUpdate = () => {
    if (newStatus !== payment.status) {
      // Validate chargeback amount if status is CHARGEBACK
      if (newStatus === 'CHARGEBACK') {
        const amount = parseFloat(chargebackAmount);
        if (!chargebackAmount || isNaN(amount) || amount <= 0) {
          toast.error('Please enter a valid chargeback amount');
          return;
        }
        onUpdateStatus(payment.id, newStatus, notes, amount);
      } else {
        onUpdateStatus(payment.id, newStatus, notes);
      }
      setIsEditingStatus(false);
    }
  };

  // ✅ UPDATED: Added CHARGEBACK and REFUND status options
  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'PAID', label: 'Paid', color: 'text-green-600 bg-green-50' },
    { value: 'EXPIRED', label: 'Expired', color: 'text-orange-600 bg-orange-50' },
    { value: 'FAILED', label: 'Failed', color: 'text-red-600 bg-red-50' },
    { value: 'CHARGEBACK', label: 'Chargeback', color: 'text-purple-600 bg-purple-50' },
    { value: 'REFUND', label: 'Refund', color: 'text-blue-600 bg-blue-50' }
  ];

  // Определяем способ оплаты по наличию полей
  const getPaymentMethodInfo = () => {
    if (payment.sourceCurrency) {
      return {
        type: 'crypto',
        icon: <Bitcoin className="h-5 w-5 text-orange-500" />,
        label: 'Cryptocurrency',
        details: `Paid with ${payment.sourceCurrency}`,
        color: 'bg-orange-50 border-orange-200'
      };
    }
    
    if (payment.remitterIban) {
      return {
        type: 'bank',
        icon: <Building2 className="h-5 w-5 text-blue-500" />,
        label: 'Bank Transfer',
        details: `IBAN: ${payment.remitterIban}`,
        color: 'bg-blue-50 border-blue-200'
      };
    }
    
    if (payment.cardLast4) {
      return {
        type: 'card',
        icon: <CreditCard className="h-5 w-5 text-purple-500" />,
        label: 'Credit/Debit Card',
        details: `Card ending in ${payment.cardLast4}`,
        color: 'bg-purple-50 border-purple-200'
      };
    }

    return null;
  };

  const paymentMethodInfo = getPaymentMethodInfo();

  // Check if we have any payment method details to show
  const hasPaymentMethodDetails = payment.paymentMethod || payment.cardLast4 || payment.bankId || 
                                  payment.remitterIban || payment.remitterName;

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
        className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                <p className="text-sm text-gray-500">{payment.id}</p>
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

        <div className="p-6 space-y-8">
          {/* Payment Method Highlight - Only show if we have payment method info */}
          {paymentMethodInfo && (
            <div className={`p-6 rounded-xl border-2 ${paymentMethodInfo.color}`}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  {paymentMethodInfo.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{paymentMethodInfo.label}</h4>
                  <p className="text-gray-600">{paymentMethodInfo.details}</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Payment Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Payment ID</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-900 font-mono break-all mr-2">{payment.id}</div>
                  <button
                    onClick={() => handleCopy(payment.id, 'payment-id')}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    {showCopied === 'payment-id' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Gateway Order ID</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-900 break-all mr-2">{payment.gatewayOrderId || 'N/A'}</div>
                  {payment.gatewayOrderId && (
                    <button
                      onClick={() => handleCopy(payment.gatewayOrderId!, 'gateway-order-id')}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      {showCopied === 'gateway-order-id' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Gateway</div>
                <div className="text-sm text-gray-900 capitalize">{payment.gateway}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Amount</div>
                <div className="text-lg font-semibold text-gray-900">
                  {payment.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Currency</div>
                <div className="text-lg font-semibold text-gray-900">
                  {payment.currency}
                </div>
                {payment.sourceCurrency && (
                  <div className="text-sm text-gray-500">Source: {payment.sourceCurrency}</div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                {isEditingStatus ? (
                  <div className="space-y-3">
                    <CustomSelect
                      value={newStatus}
                      onChange={(value) => setNewStatus(value as AdminPayment['status'])}
                      options={statusOptions.map(opt => ({
                        value: opt.value,
                        label: opt.label
                      }))}
                      placeholder="Select status"
                    />
                    
                    {/* ✅ NEW: Chargeback amount input */}
                    {newStatus === 'CHARGEBACK' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chargeback Amount (USDT) *
                        </label>
                        <input
                          type="number"
                          value={chargebackAmount}
                          onChange={(e) => setChargebackAmount(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes {newStatus === 'CHARGEBACK' || newStatus === 'REFUND' ? '*' : '(Optional)'}
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder={
                          newStatus === 'CHARGEBACK' ? 'Reason for chargeback...' :
                          newStatus === 'REFUND' ? 'Reason for refund...' :
                          'Optional notes...'
                        }
                        rows={3}
                        required={newStatus === 'CHARGEBACK' || newStatus === 'REFUND'}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={handleStatusUpdate}
                        className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingStatus(false)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${
                      statusOptions.find(opt => opt.value === payment.status)?.color || 'bg-gray-50 text-gray-600'
                    }`}>
                      {payment.status === 'PAID' && <CheckCircle2 className="h-4 w-4" />}
                      {payment.status === 'PENDING' && <Clock className="h-4 w-4" />}
                      {payment.status === 'EXPIRED' && <AlertTriangle className="h-4 w-4" />}
                      {payment.status === 'FAILED' && <XCircle className="h-4 w-4" />}
                      {payment.status === 'CHARGEBACK' && <RotateCcw className="h-4 w-4" />}
                      {payment.status === 'REFUND' && <AlertCircle className="h-4 w-4" />}
                      <span className="text-sm font-medium">{payment.status}</span>
                    </div>
                    <button
                      onClick={() => setIsEditingStatus(true)}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Usage</div>
                <div className="text-sm text-gray-900 uppercase">{payment.usage}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Created At</div>
                <div className="text-sm text-gray-900">
                  {format(new Date(payment.createdAt), 'PPpp')}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Updated At</div>
                <div className="text-sm text-gray-900">
                  {format(new Date(payment.updatedAt), 'PPpp')}
                </div>
              </div>

              {payment.expiresAt && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Expires At</div>
                  <div className="text-sm text-gray-900">
                    {format(new Date(payment.expiresAt), 'PPpp')}
                  </div>
                </div>
              )}

              {/* ✅ NEW: Show chargeback amount if status is CHARGEBACK */}
              {payment.status === 'CHARGEBACK' && payment.chargebackAmount && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-sm font-medium text-purple-700 mb-1">Chargeback Amount</div>
                  <div className="text-lg font-semibold text-purple-900">
                    ${payment.chargebackAmount.toFixed(2)} USDT
                  </div>
                </div>
              )}

              {/* ✅ NEW: Show notes if available */}
              {payment.notes && (
                <div className="p-4 bg-gray-50 rounded-xl md:col-span-2 lg:col-span-3">
                  <div className="text-sm font-medium text-gray-500 mb-1">Notes</div>
                  <div className="text-sm text-gray-900">{payment.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Shop Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Shop Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Shop Name</div>
                <div className="text-sm text-gray-900">{payment.shopName}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Username</div>
                <div className="text-sm text-gray-900">@{payment.shopUsername}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Shop ID</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-900 font-mono break-all mr-2">{payment.shopId}</div>
                  <button
                    onClick={() => handleCopy(payment.shopId, 'shop-id')}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    {showCopied === 'shop-id' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {(payment.customerEmail || payment.customerName) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payment.customerName && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-500 mb-1">Customer Name</div>
                    <div className="text-sm text-gray-900">{payment.customerName}</div>
                  </div>
                )}

                {payment.customerEmail && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-500 mb-1">Customer Email</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-900 break-all mr-2">{payment.customerEmail}</div>
                      <button
                        onClick={() => handleCopy(payment.customerEmail!, 'customer-email')}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        {showCopied === 'customer-email' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Only show Payment Method Details section if we have data */}
          {hasPaymentMethodDetails && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payment.paymentMethod && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-500 mb-1">Payment Method</div>
                    <div className="text-sm text-gray-900 capitalize">{payment.paymentMethod}</div>
                  </div>
                )}

                {payment.cardLast4 && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-500 mb-1">Card Last 4 Digits</div>
                    <div className="text-sm text-gray-900 font-mono">****{payment.cardLast4}</div>
                  </div>
                )}

                {payment.bankId && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-500 mb-1">Bank ID</div>
                    <div className="text-sm text-gray-900">{payment.bankId}</div>
                  </div>
                )}

                {payment.remitterIban && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-500 mb-1">Remitter IBAN</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-900 font-mono break-all mr-2">{payment.remitterIban}</div>
                      <button
                        onClick={() => handleCopy(payment.remitterIban!, 'remitter-iban')}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        {showCopied === 'remitter-iban' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {payment.remitterName && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-500 mb-1">Remitter Name</div>
                    <div className="text-sm text-gray-900">{payment.remitterName}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gateway Information */}
          {(payment.gatewayPaymentId || payment.externalPaymentUrl) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Gateway Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payment.gatewayPaymentId && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-500 mb-1">Gateway Payment ID</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-900 font-mono break-all mr-2">{payment.gatewayPaymentId}</div>
                      <button
                        onClick={() => handleCopy(payment.gatewayPaymentId!, 'gateway-payment-id')}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        {showCopied === 'gateway-payment-id' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {payment.externalPaymentUrl && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-500 mb-1">External Payment URL</div>
                    <div className="flex items-center justify-between">
                      <a
                        href={payment.externalPaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary-dark break-all mr-2"
                      >
                        {payment.externalPaymentUrl}
                      </a>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleCopy(payment.externalPaymentUrl!, 'external-url')}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {showCopied === 'external-url' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <a
                          href={payment.externalPaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Webhook Logs */}
          {payment.webhookLogs && payment.webhookLogs.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Webhook Logs</h4>
              <div className="space-y-3">
                {payment.webhookLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        log.statusCode >= 200 && log.statusCode < 300 ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.event}</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        log.statusCode >= 200 && log.statusCode < 300 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.statusCode}
                      </span>
                      {log.retryCount > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          Retry: {log.retryCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminPayments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [merchantFilter, setMerchantFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { usePayments, useUpdatePaymentStatus } = useAdmin();
  const updateStatusMutation = useUpdatePaymentStatus();

  // Build filters for API
  const filters: AdminPaymentFilters = useMemo(() => {
    const apiFilters: AdminPaymentFilters = {
      page: currentPage,
      limit: pageSize,
    };

    if (statusFilter !== 'all') {
      apiFilters.status = statusFilter as AdminPayment['status'];
    }

    if (gatewayFilter !== 'all') {
      apiFilters.gateway = gatewayFilter;
    }

    if (startDate) {
      apiFilters.dateFrom = format(startDate, 'yyyy-MM-dd');
    }

    if (endDate) {
      apiFilters.dateTo = format(endDate, 'yyyy-MM-dd');
    }

    if (searchTerm.trim()) {
      apiFilters.search = searchTerm.trim();
    }

    return apiFilters;
  }, [currentPage, pageSize, statusFilter, gatewayFilter, startDate, endDate, searchTerm]);

  const { data: paymentsData, isLoading, error } = usePayments(filters);

  // Extract unique currencies and merchants from payments data for filter options
  const { currencyOptions, merchantOptions } = useMemo(() => {
    if (!paymentsData?.payments) {
      return { currencyOptions: [], merchantOptions: [] };
    }

    // Extract unique currencies
    const currencies = [...new Set(paymentsData.payments.map(p => p.currency))].sort();
    const currencyOpts = [
      { value: 'all', label: 'All Currencies' },
      ...currencies.map(currency => ({ value: currency, label: currency }))
    ];

    // Extract unique merchants
    const merchants = [...new Set(paymentsData.payments.map(p => p.shopName))].sort();
    const merchantOpts = [
      { value: 'all', label: 'All Merchants' },
      ...merchants.map(merchant => ({ value: merchant, label: merchant }))
    ];

    return { currencyOptions: currencyOpts, merchantOptions: merchantOpts };
  }, [paymentsData?.payments]);

  // Client-side filtering for currency and merchant (since API doesn't support these filters yet)
  const filteredPayments = useMemo(() => {
    if (!paymentsData?.payments) return [];

    return paymentsData.payments.filter(payment => {
      // Currency filter
      if (currencyFilter !== 'all' && payment.currency !== currencyFilter) {
        return false;
      }

      // Merchant filter
      if (merchantFilter !== 'all' && payment.shopName !== merchantFilter) {
        return false;
      }

      return true;
    });
  }, [paymentsData?.payments, currencyFilter, merchantFilter]);

  // ✅ UPDATED: Added CHARGEBACK and REFUND status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending', icon: <Clock className="h-4 w-4 text-yellow-600" /> },
    { value: 'PAID', label: 'Paid', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    { value: 'EXPIRED', label: 'Expired', icon: <AlertTriangle className="h-4 w-4 text-orange-600" /> },
    { value: 'FAILED', label: 'Failed', icon: <XCircle className="h-4 w-4 text-red-600" /> },
    { value: 'CHARGEBACK', label: 'Chargeback', icon: <RotateCcw className="h-4 w-4 text-purple-600" /> },
    { value: 'REFUND', label: 'Refund', icon: <AlertCircle className="h-4 w-4 text-blue-600" /> }
  ];

  const gatewayOptions = [
    { value: 'all', label: 'All Gateways' },
    { value: 'plisio', label: 'Plisio' },
    { value: 'rapyd', label: 'Rapyd' },
    { value: 'cointopay', label: 'CoinToPay' },
    { value: 'noda', label: 'Noda' },
    { value: 'klyme_eu', label: 'KLYME EU' },
    { value: 'klyme_gb', label: 'KLYME GB' },
    { value: 'klyme_de', label: 'KLYME DE' }
  ];

  const pageSizeOptions = [
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' }
  ];

  const handleUpdatePaymentStatus = async (id: string, status: AdminPayment['status'], notes?: string, chargebackAmount?: number) => {
    try {
      const updateData: any = { status, notes };
      
      // Add chargeback amount if status is CHARGEBACK
      if (status === 'CHARGEBACK' && chargebackAmount) {
        updateData.chargebackAmount = chargebackAmount;
      }
      
      await updateStatusMutation.mutateAsync({
        id,
        data: updateData
      });
      toast.success(`Payment status updated to ${status}`);
      setSelectedPayment(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  // Определяем способ оплаты для отображения в таблице
  const getPaymentMethodDisplay = (payment: AdminPayment) => {
    if (payment.sourceCurrency) {
      return {
        icon: <Bitcoin className="h-4 w-4 text-orange-500" />,
        text: payment.sourceCurrency,
        color: 'text-orange-600'
      };
    }
    
    if (payment.remitterIban) {
      return {
        icon: <Building2 className="h-4 w-4 text-blue-500" />,
        text: `IBAN: ${payment.remitterIban.slice(-4)}`,
        color: 'text-blue-600'
      };
    }
    
    if (payment.cardLast4) {
      return {
        icon: <CreditCard className="h-4 w-4 text-purple-500" />,
        text: `****${payment.cardLast4}`,
        color: 'text-purple-600'
      };
    }

    return {
      icon: <Wallet className="h-4 w-4 text-gray-500" />,
      text: payment.paymentMethod || 'Other',
      color: 'text-gray-600'
    };
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">
          <AlertTriangle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-600">Failed to load payments. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Admin Payments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage all platform payments
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </motion.button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Filters Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Filter by status"
                className="w-full"
              />
              <CustomSelect
                value={gatewayFilter}
                onChange={setGatewayFilter}
                options={gatewayOptions}
                placeholder="Filter by gateway"
                className="w-full"
              />
              <CustomSelect
                value={currencyFilter}
                onChange={setCurrencyFilter}
                options={currencyOptions}
                placeholder="Filter by currency"
                className="w-full"
              />
              <CustomSelect
                value={merchantFilter}
                onChange={setMerchantFilter}
                options={merchantOptions}
                placeholder="Filter by merchant"
                className="w-full"
              />
            </div>

            {/* Date Filters Row 2 */}
            <div className="flex gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsStartDatePickerOpen(true)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-left flex items-center space-x-3 hover:border-primary transition-all duration-200"
                >
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className={startDate ? 'text-gray-900' : 'text-gray-500'}>
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
                  </span>
                </button>
                <AnimatePresence>
                  {isStartDatePickerOpen && (
                    <DatePicker
                      value={startDate}
                      onChange={(date) => {
                        setStartDate(date);
                        setIsStartDatePickerOpen(false);
                      }}
                      onClose={() => setIsStartDatePickerOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsEndDatePickerOpen(true)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-left flex items-center space-x-3 hover:border-primary transition-all duration-200"
                >
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className={endDate ? 'text-gray-900' : 'text-gray-500'}>
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
                  </span>
                </button>
                <AnimatePresence>
                  {isEndDatePickerOpen && (
                    <DatePicker
                      value={endDate}
                      onChange={(date) => {
                        setEndDate(date);
                        setIsEndDatePickerOpen(false);
                      }}
                      onClose={() => setIsEndDatePickerOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4">
                    <button className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                      <span>Date</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Gateway Order ID</span>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Shop</span>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Gateway</span>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                      <span>Amount</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Currency</span>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Payment Method</span>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Customer</span>
                  </th>
                  <th className="w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const paymentMethodDisplay = getPaymentMethodDisplay(payment);
                  
                  return (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900">{payment.orderId || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.shopName}</div>
                          <div className="text-xs text-gray-500">@{payment.shopUsername}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 capitalize">{payment.gateway}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {payment.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{payment.currency}</span>
                          {payment.sourceCurrency && (
                            <div className="text-xs text-gray-500">via {payment.sourceCurrency}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center space-x-2 ${paymentMethodDisplay.color}`}>
                          {paymentMethodDisplay.icon}
                          <span className="text-sm font-medium">{paymentMethodDisplay.text}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {payment.status === 'PAID' && (
                          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">Paid</span>
                          </div>
                        )}
                        {payment.status === 'PENDING' && (
                          <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg w-fit">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Pending</span>
                          </div>
                        )}
                        {payment.status === 'EXPIRED' && (
                          <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg w-fit">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Expired</span>
                          </div>
                        )}
                        {payment.status === 'FAILED' && (
                          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg w-fit">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Failed</span>
                          </div>
                        )}
                        {/* ✅ NEW: CHARGEBACK status */}
                        {payment.status === 'CHARGEBACK' && (
                          <div className="flex items-center space-x-2 text-purple-600 bg-purple-50 px-3 py-1 rounded-lg w-fit">
                            <RotateCcw className="h-4 w-4" />
                            <span className="text-sm font-medium">Chargeback</span>
                          </div>
                        )}
                        {/* ✅ NEW: REFUND status */}
                        {payment.status === 'REFUND' && (
                          <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Refund</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {payment.customerEmail ? (
                          <div>
                            <div className="text-sm text-gray-900">{payment.customerName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{payment.customerEmail}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No customer info</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                }) || []}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {paymentsData?.pagination && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Showing {((paymentsData.pagination.page - 1) * paymentsData.pagination.limit) + 1} to{' '}
                {Math.min(paymentsData.pagination.page * paymentsData.pagination.limit, paymentsData.pagination.total)} of{' '}
                {paymentsData.pagination.total} results
                {(currencyFilter !== 'all' || merchantFilter !== 'all') && (
                  <span className="text-primary"> (filtered: {filteredPayments.length})</span>
                )}
              </div>
              <CustomSelect
                value={pageSize.toString()}
                onChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
                options={pageSizeOptions}
                placeholder="Page size"
                className="w-[160px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, paymentsData.pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {paymentsData.pagination.totalPages > 5 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(paymentsData.pagination.totalPages)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        currentPage === paymentsData.pagination.totalPages
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {paymentsData.pagination.totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(paymentsData.pagination.totalPages, currentPage + 1))}
                disabled={currentPage === paymentsData.pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPayment && (
          <PaymentDetailsModal
            payment={selectedPayment}
            onClose={() => setSelectedPayment(null)}
            onUpdateStatus={handleUpdatePaymentStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPayments;