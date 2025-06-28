import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ChevronDown,
  Download,
  FileText,
  Share2,
  Printer,
  Wallet,
  CreditCard,
  Receipt,
  AlertCircle,
  Copy,
  DollarSign,
  TrendingUp,
  ArrowRight,
  MoreHorizontal,
  Globe,
  Building2,
  Bitcoin,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import CustomSelect from '../components/CustomSelect';
import DatePicker from '../components/DatePicker';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatCurrencyCompact } from '../utils/currency';
import { 
  useShopPayments, 
  useShopStatistics,
  type ShopPayment,
  type PaymentFilters 
} from '../hooks/useShop';
import { getGatewayInfo, getGatewayDisplayName, getGatewayIdSafe } from '../utils/gatewayMapping';

const PaymentDetailsModal: React.FC<{
  payment: ShopPayment;
  onClose: () => void;
}> = ({ payment, onClose }) => {
  const [showCopied, setShowCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

  // ✅ FIXED: Use safe gateway display function
  const gatewayDisplayName = getGatewayDisplayName(payment.gateway);

  // Helper function to render field if value exists
  const renderField = (label: string, value: any, copyable = false, copyId?: string) => {
    if (value === null || value === undefined || value === '') return null;
    
    return (
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-900 break-all mr-2">
            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
          </div>
          {copyable && copyId && (
            <button
              onClick={() => handleCopy(value.toString(), copyId)}
              className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              {showCopied === copyId ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
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
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
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

        <div className="p-6 space-y-4">
          {/* All fields in a single grid without section headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Information */}
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
              <div className="text-sm font-medium text-gray-500 mb-1">Gateway</div>
              <div className="text-sm text-gray-900">
                {gatewayDisplayName}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-medium text-gray-500 mb-1">Amount</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(payment.amount, payment.currency)}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
              <div className="mt-1">
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
                {payment.status === 'PROCESSING' && (
                  <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Processing</span>
                  </div>
                )}
                {payment.status === 'FAILED' && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg w-fit">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Failed</span>
                  </div>
                )}
                {payment.status === 'EXPIRED' && (
                  <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-lg w-fit">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Expired</span>
                  </div>
                )}
                {/* ✅ NEW: CHARGEBACK status */}
                {(payment.status as any) === 'CHARGEBACK' && (
                  <div className="flex items-center space-x-2 text-purple-600 bg-purple-50 px-3 py-1 rounded-lg w-fit">
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-sm font-medium">Chargeback</span>
                  </div>
                )}
                {/* ✅ NEW: REFUND status */}
                {(payment.status as any) === 'REFUND' && (
                  <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Refund</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-medium text-gray-500 mb-1">Created At</div>
              <div className="text-sm text-gray-900">
                {format(new Date(payment.createdAt), 'PPpp')}
              </div>
            </div>

            {payment.updatedAt && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Updated At</div>
                <div className="text-sm text-gray-900">
                  {format(new Date(payment.updatedAt), 'PPpp')}
                </div>
              </div>
            )}

            {/* Product and Order Information */}
            {renderField('Product Name', payment.productName)}
            {renderField('Order ID', (payment as any).order_id, true, 'order-id')}
            {renderField('Source Currency', (payment as any).source_currency)}
            {renderField('Invoice Total Sum', (payment as any).invoice_total_sum)}

            {/* Customer Information */}
            {renderField('Customer Name', payment.customerName)}
            {renderField('Customer Email', payment.customerEmail, true, 'customer-email')}

            {/* Payment Method Information */}
            {renderField('Payment Method', (payment as any).payment_method)}
            {renderField('Bank ID', (payment as any).bank_id)}
            {renderField('Card Last 4', (payment as any).card_last4)}
            {renderField('Remitter IBAN', (payment as any).remitter_iban, true, 'remitter-iban')}
            {renderField('Remitter Name', (payment as any).remitter_name)}

            {/* Gateway Specific Information */}
            {renderField('Country', (payment as any).country)}
            {renderField('Language', (payment as any).language)}
            {renderField('Amount is Editable', (payment as any).amount_is_editable)}
            {renderField('Max Payments', (payment as any).max_payments)}
            {renderField('Rapyd Customer', (payment as any).rapyd_customer)}

            {/* Expiry Information */}
            {(payment as any).expires_at && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Expires At</div>
                <div className="text-sm text-gray-900">
                  {format(new Date((payment as any).expires_at), 'PPpp')}
                </div>
              </div>
            )}

            {/* ✅ NEW: Show chargeback amount if status is CHARGEBACK */}
            {(payment.status as any) === 'CHARGEBACK' && (payment as any).chargebackAmount && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-sm font-medium text-purple-700 mb-1">Chargeback Amount</div>
                <div className="text-lg font-semibold text-purple-900">
                  {(payment as any).chargebackAmount.toFixed(2)} USDT
                </div>
              </div>
            )}

            {/* ✅ NEW: Show notes if available */}
            {(payment as any).notes && (
              <div className="p-4 bg-gray-50 rounded-xl md:col-span-2 lg:col-span-3">
                <div className="text-sm font-medium text-gray-500 mb-1">Notes</div>
                <div className="text-sm text-gray-900">{(payment as any).notes}</div>
              </div>
            )}
          </div>

          {/* URLs and Links - Special handling for links */}
          {((payment as any).payment_url || (payment as any).success_url || (payment as any).fail_url || (payment as any).qr_url) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(payment as any).payment_url && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Payment URL</div>
                  <div className="flex items-center justify-between">
                    <a
                      href={(payment as any).payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary-dark break-all mr-2"
                    >
                      {(payment as any).payment_url}
                    </a>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopy((payment as any).payment_url, 'payment-url')}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {showCopied === 'payment-url' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <a
                        href={(payment as any).payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {(payment as any).success_url && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Success URL</div>
                  <div className="text-sm text-gray-900 break-all">{(payment as any).success_url}</div>
                </div>
              )}

              {(payment as any).fail_url && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Fail URL</div>
                  <div className="text-sm text-gray-900 break-all">{(payment as any).fail_url}</div>
                </div>
              )}

              {(payment as any).qr_url && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">QR URL</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900 break-all mr-2">{(payment as any).qr_url}</div>
                    <button
                      onClick={() => handleCopy((payment as any).qr_url, 'qr-url')}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      {showCopied === 'qr-url' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<ShopPayment | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Build filters for API
  const filters: PaymentFilters = useMemo(() => {
    const apiFilters: PaymentFilters = {
      page: currentPage,
      limit: pageSize,
    };

    if (statusFilter !== 'all') {
      apiFilters.status = statusFilter as any;
    }

    if (gatewayFilter !== 'all') {
      apiFilters.gateway = gatewayFilter;
    }

    return apiFilters;
  }, [currentPage, pageSize, statusFilter, gatewayFilter]);

  const { data: paymentsData, isLoading, error } = useShopPayments(filters);
  const { data: statistics } = useShopStatistics('30d');

  // ✅ UPDATED: Added PROCESSING, CHARGEBACK and REFUND status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PAID', label: 'Paid', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    { value: 'PENDING', label: 'Pending', icon: <Clock className="h-4 w-4 text-yellow-600" /> },
    { value: 'PROCESSING', label: 'Processing', icon: <Loader2 className="h-4 w-4 text-blue-600" /> },
    { value: 'FAILED', label: 'Failed', icon: <AlertCircle className="h-4 w-4 text-red-600" /> },
    { value: 'EXPIRED', label: 'Expired', icon: <XCircle className="h-4 w-4 text-gray-600" /> },
    { value: 'CHARGEBACK', label: 'Chargeback', icon: <RotateCcw className="h-4 w-4 text-purple-600" /> },
    { value: 'REFUND', label: 'Refund', icon: <AlertTriangle className="h-4 w-4 text-blue-600" /> },
  ];

  const gatewayOptions = [
    { value: 'all', label: 'All Gateways' },
    { value: '0001', label: 'Gateway 0001' },
    { value: '0010', label: 'Gateway 0010' },
    { value: '0100', label: 'Gateway 0100' },
    { value: '1000', label: 'Gateway 1000' },
    { value: '1001', label: 'Gateway 1001' },
    { value: '1010', label: 'Gateway 1010' },
    { value: '1100', label: 'Gateway 1100' },
  ];

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<ShopPayment>();
    
    return [
      columnHelper.accessor('createdAt', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center space-x-2 group"
          >
            <span className="hidden sm:inline">Date</span>
            <span className="sm:hidden">Date</span>
            <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
        ),
        cell: (info) => (
          <div className="whitespace-nowrap">
            <span className="hidden sm:inline">{format(new Date(info.getValue()), 'MMM d, yyyy')}</span>
            <span className="sm:hidden">{format(new Date(info.getValue()), 'MM/dd')}</span>
          </div>
        ),
      }),
      columnHelper.accessor('id', {
        header: 'Payment ID',
        cell: (info) => (
          <span className="font-mono text-gray-600 text-sm">{info.getValue().slice(0, 8)}...</span>
        ),
      }),
      columnHelper.accessor('gateway', {
        header: 'Gateway',
        cell: (info) => {
          // ✅ FIXED: Use safe gateway display function
          const gatewayName = info.getValue();
          const gatewayDisplayName = getGatewayDisplayName(gatewayName);
          
          return (
            <div className="text-sm font-medium text-gray-900">
              {gatewayDisplayName}
            </div>
          );
        },
      }),
      columnHelper.accessor('amount', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center space-x-2 group"
          >
            <span>Amount</span>
            <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
        ),
        cell: (info) => {
          const amount = info.getValue();
          const payment = info.row.original;
          return (
            <div className="font-medium whitespace-nowrap text-gray-900">
              {formatCurrencyCompact(amount, payment.currency)}
            </div>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <div className="flex items-center space-x-2">
              {status === 'PAID' && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 hidden sm:inline" />
                  <span className="text-sm font-medium">Paid</span>
                </div>
              )}
              {status === 'PENDING' && (
                <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg">
                  <Clock className="h-4 w-4 hidden sm:inline" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
              )}
              {/* ✅ NEW: PROCESSING status */}
              {status === 'PROCESSING' && (
                <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  <Loader2 className="h-4 w-4 hidden sm:inline animate-spin" />
                  <span className="text-sm font-medium">Processing</span>
                </div>
              )}
              {status === 'FAILED' && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                  <AlertCircle className="h-4 w-4 hidden sm:inline" />
                  <span className="text-sm font-medium">Failed</span>
                </div>
              )}
              {status === 'EXPIRED' && (
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                  <XCircle className="h-4 w-4 hidden sm:inline" />
                  <span className="text-sm font-medium">Expired</span>
                </div>
              )}
              {/* ✅ NEW: CHARGEBACK status */}
              {(status as any) === 'CHARGEBACK' && (
                <div className="flex items-center space-x-2 text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                  <RotateCcw className="h-4 w-4 hidden sm:inline" />
                  <span className="text-sm font-medium">Chargeback</span>
                </div>
              )}
              {/* ✅ NEW: REFUND status */}
              {(status as any) === 'REFUND' && (
                <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  <AlertTriangle className="h-4 w-4 hidden sm:inline" />
                  <span className="text-sm font-medium">Refund</span>
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => setSelectedPayment(info.row.original)}
              className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        ),
      }),
    ];
  }, []);

  const table = useReactTable({
    data: paymentsData?.payments || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">
          <AlertCircle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-600">Failed to load payments. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your payment history
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 w-full sm:w-auto justify-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </motion.button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm p-3 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Revenue</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900">
                  {statistics.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm p-3 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-green-50 rounded-xl flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Successful</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900">
                  {statistics.successfulPayments.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm p-3 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-blue-50 rounded-xl flex-shrink-0">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Payments</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900">
                  {statistics.totalPayments.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm p-3 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-orange-50 rounded-xl flex-shrink-0">
                <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Average</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900">
                  {statistics.averageAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-4">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Filter by status"
                className="w-full sm:w-[180px]"
              />
              <CustomSelect
                value={gatewayFilter}
                onChange={setGatewayFilter}
                options={gatewayOptions}
                placeholder="Filter by gateway"
                className="w-full sm:w-[180px]"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  {table.getFlatHeaders().map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-500 first:pl-6 last:pr-6"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-sm text-gray-600 first:pl-6 last:pr-6"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {paymentsData?.pagination && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((paymentsData.pagination.page - 1) * paymentsData.pagination.limit) + 1} to{' '}
              {Math.min(paymentsData.pagination.page * paymentsData.pagination.limit, paymentsData.pagination.total)} of{' '}
              {paymentsData.pagination.total} results
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
                Page {paymentsData.pagination.page} of {paymentsData.pagination.totalPages}
              </span>
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
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;