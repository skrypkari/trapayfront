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
  Plus,
  User as UserIcon,
  AlertCircle,
  Copy,
  Check,
  X,
  TrendingUp,
  ArrowUpRight,
  Trash2,
  MoreHorizontal,
  Globe,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import DatePicker from '../components/DatePicker';
import CustomSelect from '../components/CustomSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  useAdmin, 
  type AdminPayoutMerchant, 
  type AdminPayout,
  type AdminPayoutMerchantsFilters,
  type AdminPayoutFilters,
  type CreatePayoutData 
} from '../hooks/useAdmin';

const MerchantDetailsModal: React.FC<{
  merchant: AdminPayoutMerchant;
  onClose: () => void;
  onCreatePayout: (data: CreatePayoutData) => void;
}> = ({ merchant, onClose, onCreatePayout }) => {
  const [showCopied, setShowCopied] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [payoutAmount, setPayoutAmount] = useState<string>(merchant.totalAmountAfterCommissionUSDT.toString());
  const [notes, setNotes] = useState<string>('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

  // Get available networks based on merchant's wallets
  const availableNetworks = Object.entries(merchant.wallets)
    .filter(([_, address]) => address && address.trim() !== '')
    .map(([walletType, address]) => {
      const networkLabels: Record<string, { label: string; value: string; icon: string }> = {
        usdtPolygonWallet: { label: 'USDT (Polygon)', value: 'polygon', icon: '🔷' },
        usdtTrcWallet: { label: 'USDT (TRC-20)', value: 'trc20', icon: '🔴' },
        usdtErcWallet: { label: 'USDT (ERC-20)', value: 'erc20', icon: '⚫' },
        usdcPolygonWallet: { label: 'USDC (Polygon)', value: 'polygon', icon: '🔵' }
      };
      
      return {
        ...networkLabels[walletType],
        address
      };
    });

  const handleCreatePayout = () => {
    if (!selectedNetwork || !payoutAmount) {
      toast.error('Please select network and enter amount');
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (amount <= 0 || amount > merchant.totalAmountAfterCommissionUSDT) {
      toast.error('Invalid payout amount');
      return;
    }

    onCreatePayout({
      shopId: merchant.id,
      amount,
      network: selectedNetwork,
      notes: notes.trim() || undefined
    });
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
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Merchant Details</h3>
                <p className="text-sm text-gray-500">{merchant.fullName}</p>
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
          {/* Merchant Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Merchant Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Full Name</div>
                <div className="text-sm text-gray-900">{merchant.fullName}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Username</div>
                <div className="text-sm text-gray-900">@{merchant.username}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Telegram</div>
                <div className="text-sm text-gray-900">{merchant.telegramId}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Merchant URL</div>
                <div className="text-sm text-gray-900 break-all">
                  <a href={merchant.merchantUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                    {merchant.merchantUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Summary */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payout Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-sm font-medium text-green-700 mb-1">Total Amount</div>
                <div className="text-xl font-bold text-green-900">
                  {merchant.totalAmountUSDT.toLocaleString()} USDT
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-sm font-medium text-blue-700 mb-1">After Commission</div>
                <div className="text-xl font-bold text-blue-900">
                  {merchant.totalAmountAfterCommissionUSDT.toLocaleString()} USDT
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-sm font-medium text-purple-700 mb-1">Payments Count</div>
                <div className="text-xl font-bold text-purple-900">
                  {merchant.paymentsCount}
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="text-sm font-medium text-orange-700 mb-1">Oldest Payment</div>
                <div className="text-sm font-medium text-orange-900">
                  {format(new Date(merchant.oldestPaymentDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Breakdown */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Gateway Breakdown</h4>
            <div className="space-y-3">
              {merchant.gatewayBreakdown.map((gateway, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{gateway.gateway}</div>
                    <div className="text-sm text-gray-500">{gateway.count} payments</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Amount</div>
                      <div className="font-medium">{gateway.amountUSDT.toFixed(2)} USDT</div>
                    </div>
                    <div>
                      <div className="text-gray-500">After Commission</div>
                      <div className="font-medium">{gateway.amountAfterCommissionUSDT.toFixed(2)} USDT</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Commission</div>
                      <div className="font-medium">{gateway.commission}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Addresses */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Wallet Addresses</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableNetworks.map((network, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{network.icon}</span>
                      <span className="font-medium text-gray-900">{network.label}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(network.address, `wallet-${index}`)}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showCopied === `wallet-${index}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-sm font-mono text-gray-600 break-all">
                    {network.address}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Payout Section */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Create Payout</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Network
                </label>
                <CustomSelect
                  value={selectedNetwork}
                  onChange={setSelectedNetwork}
                  options={availableNetworks.map(network => ({
                    value: network.value,
                    label: network.label,
                    icon: <span>{network.icon}</span>
                  }))}
                  placeholder="Select network"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={merchant.totalAmountAfterCommissionUSDT}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum: {merchant.totalAmountAfterCommissionUSDT.toLocaleString()} USDT
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Add notes for this payout..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePayout}
                  disabled={!selectedNetwork || !payoutAmount}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PayoutDetailsModal: React.FC<{
  payout: AdminPayout;
  onClose: () => void;
  onDelete: (id: string) => void;
}> = ({ payout, onClose, onDelete }) => {
  const [showCopied, setShowCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this payout?')) {
      onDelete(payout.id);
      onClose();
    }
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
                <div className="text-sm font-medium text-gray-500 mb-1">Wallet Address</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-900 font-mono break-all mr-2">
                    {payout.walletAddress}
                  </div>
                  <button
                    onClick={() => handleCopy(payout.walletAddress, 'wallet-address')}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    {showCopied === 'wallet-address' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
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

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Shop</div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-900">{payout.shopName}</div>
                  <div className="text-sm text-gray-600">@{payout.shopUsername}</div>
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

          {/* Actions */}
          {payout.status === 'PENDING' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-end">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Payout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminPayouts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'merchants' | 'payouts'>('merchants');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [selectedMerchant, setSelectedMerchant] = useState<AdminPayoutMerchant | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const { 
    usePayoutStats, 
    usePayoutMerchants, 
    usePayouts, 
    useCreatePayout, 
    useDeletePayout 
  } = useAdmin();

  const { data: stats, isLoading: statsLoading, error: statsError } = usePayoutStats();
  const createPayoutMutation = useCreatePayout();
  const deletePayoutMutation = useDeletePayout();

  // Build filters for merchants
  const merchantFilters: AdminPayoutMerchantsFilters = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
  }), [currentPage, pageSize, searchTerm, minAmount]);

  // Build filters for payouts
  const payoutFilters: AdminPayoutFilters = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    network: networkFilter !== 'all' ? networkFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
  }), [currentPage, pageSize, searchTerm, networkFilter, statusFilter]);

  const { data: merchantsData, isLoading: merchantsLoading } = usePayoutMerchants(merchantFilters);
  const { data: payoutsData, isLoading: payoutsLoading } = usePayouts(payoutFilters);

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

  const handleCreatePayout = async (data: CreatePayoutData) => {
    try {
      await createPayoutMutation.mutateAsync(data);
      toast.success('Payout created successfully!');
      setSelectedMerchant(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payout');
    }
  };

  const handleDeletePayout = async (id: string) => {
    try {
      await deletePayoutMutation.mutateAsync(id);
      toast.success('Payout deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete payout');
    }
  };

  if (statsError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">
          <AlertTriangle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-600">Failed to load payout statistics. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Admin Payouts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and process merchant payouts
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
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 md:p-3 bg-green-50 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+12.5%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Payout</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900">
                  {stats.totalPayout.toLocaleString()} USDT
                </p>
                <p className="text-xs text-gray-400 mt-1">All paid to merchants</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 md:p-3 bg-yellow-50 rounded-xl">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
                <div className="flex items-center space-x-1 text-yellow-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+8.3%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Awaiting Payout</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900">
                  {stats.awaitingPayout.toLocaleString()} USDT
                </p>
                <p className="text-xs text-gray-400 mt-1">Eligible for payout</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 md:p-3 bg-blue-50 rounded-xl">
                  <ArrowDownLeft className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+15.2%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900">
                  {stats.thisMonth.toLocaleString()} USDT
                </p>
                <p className="text-xs text-gray-400 mt-1">Current month payouts</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 md:p-3 bg-purple-50 rounded-xl">
                  <Wallet className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div className="flex items-center space-x-1 text-purple-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">Available</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900">
                  {stats.availableBalance.toLocaleString()} USDT
                </p>
                <p className="text-xs text-gray-400 mt-1">Before commission</p>
              </div>
            </motion.div>
          </>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('merchants')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'merchants'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Merchants Awaiting Payout
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'payouts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payout History
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'merchants' ? "Search merchants..." : "Search payouts..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-4">
              {activeTab === 'merchants' ? (
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Min amount"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-[140px] px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'merchants' ? (
          // Merchants Table
          merchantsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-4">
                      <span className="text-sm font-medium text-gray-500">Merchant</span>
                    </th>
                    <th className="text-left px-6 py-4">
                      <span className="text-sm font-medium text-gray-500">Total Amount</span>
                    </th>
                    <th className="text-left px-6 py-4">
                      <span className="text-sm font-medium text-gray-500">After Commission</span>
                    </th>
                    <th className="text-left px-6 py-4">
                      <span className="text-sm font-medium text-gray-500">Payments</span>
                    </th>
                    <th className="text-left px-6 py-4">
                      <span className="text-sm font-medium text-gray-500">Oldest Payment</span>
                    </th>
                    <th className="text-right px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {merchantsData?.merchants.map((merchant) => (
                    <tr key={merchant.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{merchant.fullName}</div>
                          <div className="text-xs text-gray-500">@{merchant.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {merchant.totalAmountUSDT.toLocaleString()} USDT
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-green-600">
                          {merchant.totalAmountAfterCommissionUSDT.toLocaleString()} USDT
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{merchant.paymentsCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {format(new Date(merchant.oldestPaymentDate), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedMerchant(merchant)}
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
          )
        ) : (
          // Payouts Table
          payoutsLoading ? (
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
                      <span className="text-sm font-medium text-gray-500">User</span>
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
                  {payoutsData?.payouts.map((payout) => (
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
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payout.shopName}</div>
                          <div className="text-xs text-gray-500">@{payout.shopUsername}</div>
                        </div>
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
          )
        )}
      </div>

      <AnimatePresence>
        {selectedMerchant && (
          <MerchantDetailsModal
            merchant={selectedMerchant}
            onClose={() => setSelectedMerchant(null)}
            onCreatePayout={handleCreatePayout}
          />
        )}
        {selectedPayout && (
          <PayoutDetailsModal
            payout={selectedPayout}
            onClose={() => setSelectedPayout(null)}
            onDelete={handleDeletePayout}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPayouts;