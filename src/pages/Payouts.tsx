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
  ArrowDownLeft,
  AlertTriangle,
  Download,
  DollarSign,
  Wallet,
  Building2,
  Bitcoin,
  CreditCard,
  AlertCircle,
  X,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import DatePicker from '../components/DatePicker';
import CustomSelect from '../components/CustomSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  useShopPayouts, 
  useShopPayout,
  useShopPayoutStats,
  type ShopPayout,
  type PayoutFilters 
} from '../hooks/useShop';

const PayoutDetailsModal: React.FC<{
  payout: ShopPayout;
  onClose: () => void;
}> = ({ payout, onClose }) => {
  const [showCopied, setShowCopied] = useState<string | null>(null);

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
                <ArrowDownLeft className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payout Details</h3>
                <p className="text-sm text-gray-500">{payout.id}</p>
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
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                <div className="mt-1">
                  {payout.status === 'COMPLETED' && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                  {payout.status === 'PENDING' && (
                    <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                  )}
                  {payout.status === 'REJECTED' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg w-fit">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Rejected</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Network</div>
                <div className="flex items-center space-x-2">
                  <Bitcoin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900 capitalize">{payout.network}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Created At</div>
                <div className="text-sm text-gray-900">
                  {format(new Date(payout.createdAt), 'PPpp')}
                </div>
              </div>

              {payout.paidAt && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Paid At</div>
                  <div className="text-sm text-gray-900">
                    {format(new Date(payout.paidAt), 'PPpp')}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Amount</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {payout.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} USDT
                </div>
              </div>

              {payout.txid && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Transaction ID</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900 font-mono break-all mr-2">
                      {payout.txid}
                    </div>
                    <button
                      onClick={() => handleCopy(payout.txid!, 'txid')}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      {showCopied === 'txid' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {payout.notes && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Notes</div>
                  <div className="text-sm text-gray-900">{payout.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Payouts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<ShopPayout | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Build filters for API
  const filters: PayoutFilters = useMemo(() => {
    const apiFilters: PayoutFilters = {
      page: currentPage,
      limit: pageSize,
    };

    if (statusFilter !== 'all') {
      apiFilters.status = statusFilter as any;
    }

    if (networkFilter !== 'all') {
      apiFilters.network = networkFilter;
    }

    if (startDate) {
      apiFilters.dateFrom = format(startDate, 'yyyy-MM-dd');
    }

    if (endDate) {
      apiFilters.dateTo = format(endDate, 'yyyy-MM-dd');
    }

    return apiFilters;
  }, [currentPage, pageSize, statusFilter, networkFilter, startDate, endDate]);

  const { data: payoutsData, isLoading, error } = useShopPayouts(filters);
  const { data: stats, isLoading: statsLoading } = useShopPayoutStats();

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending', icon: <Clock className="h-4 w-4 text-blue-600" /> },
    { value: 'COMPLETED', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    { value: 'REJECTED', label: 'Rejected', icon: <AlertCircle className="h-4 w-4 text-red-600" /> }
  ];

  const networkOptions = [
    { value: 'all', label: 'All Networks' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'trc20', label: 'TRC-20' },
    { value: 'erc20', label: 'ERC-20' }
  ];

  // Filter payouts by search term (client-side filtering for loaded data)
  const filteredPayouts = useMemo(() => {
    if (!payoutsData?.payouts) return [];
    
    if (!searchTerm) return payoutsData.payouts;
    
    return payoutsData.payouts.filter(payout => 
      payout.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.network.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payout.txid && payout.txid.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [payoutsData?.payouts, searchTerm]);

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">
          <AlertCircle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-600">Failed to load payouts. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Payouts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your payouts and withdrawals
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto justify-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))
        ) : stats ? (
          <>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
                  <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-lg md:text-2xl font-semibold text-gray-900">
                    {stats.availableBalance.toLocaleString()} USDT
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 md:p-3 bg-green-50 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid Out</p>
                  <p className="text-lg md:text-2xl font-semibold text-gray-900">
                    {stats.totalPaidOut.toLocaleString()} USDT
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 md:p-3 bg-yellow-50 rounded-xl">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Awaiting Payout</p>
                  <p className="text-lg md:text-2xl font-semibold text-gray-900">
                    {stats.awaitingPayout.toLocaleString()} USDT
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 md:p-3 bg-blue-50 rounded-xl">
                  <ArrowDownLeft className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-lg md:text-2xl font-semibold text-gray-900">
                    {stats.thisMonth.toLocaleString()} USDT
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="All Status"
                className="w-[180px]"
              />
              <CustomSelect
                value={networkFilter}
                onChange={setNetworkFilter}
                options={networkOptions}
                placeholder="All Networks"
                className="w-[180px]"
              />
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
                  <th className="text-left px-6 py-4">
                    <button className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                      <span>Date</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Payout ID</span>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                      <span>Amount</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Network</span>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                  </th>
                  <th className="text-left px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">Transaction ID</span>
                  </th>
                  <th className="text-right px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {format(new Date(payout.createdAt), 'MMM d, yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-900">
                        {payout.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {payout.amount.toFixed(2)} USDT
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Bitcoin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 capitalize">{payout.network}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'COMPLETED' && (
                        <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      )}
                      {payout.status === 'PENDING' && (
                        <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                      )}
                      {payout.status === 'REJECTED' && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg w-fit">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Rejected</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payout.txid ? (
                        <span className="text-sm font-mono text-gray-600">
                          {payout.txid.slice(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedPayout(payout)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {payoutsData?.pagination && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((payoutsData.pagination.page - 1) * payoutsData.pagination.limit) + 1} to{' '}
              {Math.min(payoutsData.pagination.page * payoutsData.pagination.limit, payoutsData.pagination.total)} of{' '}
              {payoutsData.pagination.total} results
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
                Page {payoutsData.pagination.page} of {payoutsData.pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(payoutsData.pagination.totalPages, currentPage + 1))}
                disabled={currentPage === payoutsData.pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPayout && (
          <PayoutDetailsModal
            payout={selectedPayout}
            onClose={() => setSelectedPayout(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payouts;