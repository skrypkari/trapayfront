import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Code,
  ArrowLeft,
  Receipt, 
  Settings,
  Link as LinkIcon,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  LifeBuoy,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Globe,
  Eye,
  MoreHorizontal,
  Zap,
  Shield,
  Star,
  Activity,
  Wallet,
  Target,
  Award,
  Sparkles,
  Percent,
  Timer,
  Building2,
  Copy,
  Check,
  ExternalLink,
  Edit3
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  useShopProfile, 
  useShopPayments, 
  useShopStatistics,
  type ShopPayment 
} from '../hooks/useShop';
import { getGatewayInfo, GATEWAY_INFO, convertGatewayNamesToIds } from '../utils/gatewayMapping';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomSelect from '../components/CustomSelect';

const PaymentDetailsModal: React.FC<{
  payment: ShopPayment;
  onClose: () => void;
}> = ({ payment, onClose }) => {
  const gatewayId = convertGatewayNamesToIds([payment.gateway])[0];
  const gatewayInfo = getGatewayInfo(gatewayId);
  
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
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Product Name</div>
                <div className="text-sm text-gray-900">{payment.productName}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Gateway</div>
                <div className="text-sm text-gray-900">
                  {gatewayInfo ? gatewayInfo.displayName : `Gateway ${gatewayId || payment.gateway}`}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Customer</div>
                <div className="text-sm text-gray-900">
                  {payment.customerName && <div>{payment.customerName}</div>}
                  {payment.customerEmail && <div className="text-gray-600">{payment.customerEmail}</div>}
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
                  {payment.status === 'FAILED' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg w-fit">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Failed</span>
                    </div>
                  )}
                  {payment.status === 'EXPIRED' && (
                    <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-lg w-fit">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Expired</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Amount</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {payment.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: payment.currency,
                  })}
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
            </div>
          </div>

          {payment.webhookLogs && payment.webhookLogs.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Webhook Logs</h4>
              <div className="space-y-3">
                {payment.webhookLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.statusCode >= 200 && log.statusCode < 300 ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.event}</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.statusCode >= 200 && log.statusCode < 300 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.statusCode}
                      </span>
                      {log.retryCount > 0 && (
                        <span className="text-xs text-gray-500">
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

const GatewaySettingsModal: React.FC<{
  profile: any;
  onClose: () => void;
}> = ({ profile, onClose }) => {
  const [showCopied, setShowCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

  // Convert gateway names to IDs for display and get settings from API
  const gatewaySettingsWithIds = profile.gatewaySettings ? Object.entries(profile.gatewaySettings).map(([gatewayName, settings]: [string, any]) => {
    const gatewayId = convertGatewayNamesToIds([gatewayName])[0];
    const gatewayInfo = getGatewayInfo(gatewayId);
    return {
      id: gatewayId,
      name: gatewayName,
      info: gatewayInfo,
      settings: settings // Use actual settings from API
    };
  }) : [];

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
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gateway Settings</h3>
                <p className="text-sm text-gray-500">Individual settings for each payment gateway</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gatewaySettingsWithIds.map((gateway) => (
              <motion.div
                key={gateway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300"
              >
                {/* Gateway Header */}
                <div className={`p-4 ${gateway.info?.color || 'bg-gray-500'} text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-semibold">{gateway.info?.displayName || `Gateway ${gateway.id}`}</h3>
                          <p className="text-sm opacity-90">{gateway.info?.description || gateway.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {gateway.info?.features.slice(0, 2).map((feature) => (
                          <span
                            key={feature}
                            className="text-xs px-2 py-1 bg-white/20 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gateway Settings */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="flex items-center justify-center mb-2">
                        <Percent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-900">{gateway.settings.commission}%</div>
                      <div className="text-sm text-blue-700">Commission</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                      <div className="flex items-center justify-center mb-2">
                        <Timer className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-orange-900">T+{gateway.settings.payoutDelay}</div>
                      <div className="text-sm text-orange-700">Payout</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-900">Active</div>
                      <div className="text-sm text-green-700">Status</div>
                    </div>
                  </div>

                  {/* Gateway Description */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {gateway.info?.description || 'Payment gateway configuration'}
                    </p>
                  </div>

                  {/* Features */}
                  {gateway.info?.features && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Features</div>
                      <div className="flex flex-wrap gap-2">
                        {gateway.info.features.map((feature) => (
                          <span
                            key={feature}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Wallet Information */}
          {profile.wallets && Object.keys(profile.wallets).length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Wallet className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Crypto Wallets</h3>
                  <p className="text-sm text-purple-700">Configured payout addresses</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(profile.wallets).map(([walletType, address]) => {
                  if (!address) return null;
                  
                  const walletLabels: Record<string, { label: string; icon: string }> = {
                    usdtPolygonWallet: { label: 'USDT (Polygon)', icon: '🔷' },
                    usdtTrcWallet: { label: 'USDT (TRC-20)', icon: '🔴' },
                    usdtErcWallet: { label: 'USDT (ERC-20)', icon: '⚫' },
                    usdcPolygonWallet: { label: 'USDC (Polygon)', icon: '🔵' }
                  };
                  
                  const walletInfo = walletLabels[walletType];
                  if (!walletInfo) return null;
                  
                  return (
                    <div key={walletType} className="p-4 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{walletInfo.icon}</span>
                          <span className="font-medium text-gray-900">{walletInfo.label}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(address, walletType)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                          {showCopied === walletType ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="text-sm font-mono text-gray-600 break-all">
                        {address}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Account: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedPayment, setSelectedPayment] = useState<ShopPayment | null>(null);
  const [showGatewaySettings, setShowGatewaySettings] = useState(false);

  const { data: profile, isLoading: profileLoading, error: profileError } = useShopProfile();
  const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError } = useShopPayments({ limit: 5 });
  const { data: statistics, isLoading: statsLoading, error: statsError } = useShopStatistics(selectedPeriod);

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  // Chart configuration
  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: ['#6936d3', '#94a3b8'],
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [50, 100]
      }
    },
    xaxis: {
      categories: statistics?.dailyRevenue?.map(item => 
        format(new Date(item.date), 'MMM d')
      ) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        show: false // Hide X-axis labels
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `$${value}`,
        style: {
          fontSize: '12px'
        }
      }
    },
    grid: {
      strokeDashArray: 4,
      padding: {
        left: 20,
        bottom: 0 // Remove bottom padding since we're hiding X-axis
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 200
        }
      }
    }]
  };

  const series = [
    {
      name: 'Revenue',
      data: statistics?.dailyRevenue?.map(item => item.amount) || [3100, 4000, 2800, 5100, 4200, 6000, 4800]
    }
  ];

  // Available payment gateways with their features (using gateway IDs)
  const availableGateways = Object.values(GATEWAY_INFO).map(gateway => {
    // Get actual settings from profile if available
    const gatewaySettings = profile?.gatewaySettings?.[gateway.name];
    
    return {
      id: gateway.id,
      name: gateway.displayName,
      description: gateway.description,
      status: profile?.paymentGateways.includes(gateway.id) ? 'active' : 'available',
      features: gateway.features,
      color: gateway.color,
      // Use actual fee and payout from API if available, otherwise fallback to static values
      fee: gatewaySettings ? `${gatewaySettings.commission}%` : gateway.fee,
      payout: gatewaySettings ? `T+${gatewaySettings.payoutDelay}` : gateway.payout
    };
  });

  // Handle loading states
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Handle error states
  if (profileError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">
          <AlertTriangle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-600">Failed to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Hero Section with Profile */}
      {profile && (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-purple-700 rounded-2xl p-6 md:p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <span className="text-2xl font-bold text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    Welcome back, {profile.name}!
                  </h1>
                  <p className="text-white/80 mb-2">@{profile.username}</p>
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={profile.shopUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        {profile.shopUrl.replace('https://', '')}
                      </a>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4" />
                      <span className="capitalize">{profile.status.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{profile.paymentGateways.length}</div>
                  <div className="text-sm text-white/70">Gateways</div>
                </div>
                <button
                  onClick={() => setShowGatewaySettings(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">View Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))
        ) : statsError ? (
          <div className="col-span-full text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load statistics</p>
          </div>
        ) : statistics ? (
          <>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+12.5%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalAmount.toLocaleString()} USDT
                </p>
                <p className="text-xs text-gray-400 mt-1">Last {selectedPeriod}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {statistics.totalPayments > 0 ? ((statistics.successfulPayments / statistics.totalPayments) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.successfulPayments.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">Successful payments</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-purple-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+8.1%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalPayments.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-orange-600">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Premium</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Order</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.averageAmount.toFixed(2)} USDT
                </p>
                <p className="text-xs text-gray-400 mt-1">Per transaction</p>
              </div>
            </motion.div>
          </>
        ) : null}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Revenue Analytics</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Track your payment performance over time</p>
              </div>
              <CustomSelect
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                options={periodOptions}
                placeholder="Select period"
                className="w-full sm:w-[180px]"
              />
            </div>
            <div className="h-64">
              {statsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <Chart
                  options={chartOptions}
                  series={series}
                  type="area"
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </h2>
              <Link 
                to="/dashboard/transactions" 
                className="text-primary hover:text-primary-dark text-sm font-medium flex items-center space-x-1 group"
              >
                <span>View all</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            
            {paymentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : paymentsError ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-red-500 text-sm">Failed to load payments</p>
              </div>
            ) : paymentsData?.payments && paymentsData.payments.length > 0 ? (
              <div className="space-y-3">
                {paymentsData.payments.map((payment, index) => {
                  const gatewayId = convertGatewayNamesToIds([payment.gateway])[0];
                  const gatewayInfo = getGatewayInfo(gatewayId);
                  
                  return (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-primary/5 hover:to-primary/10 transition-all duration-300 cursor-pointer group"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                          {payment.productName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <span>{format(new Date(payment.createdAt), 'MMM d, HH:mm')}</span>
                          <span>•</span>
                          <span className="text-primary">
                            {gatewayInfo ? gatewayInfo.displayName : `Gateway ${gatewayId || payment.gateway}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            ${payment.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">{payment.currency}</div>
                        </div>
                        {payment.status === 'PAID' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {payment.status === 'PENDING' && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        )}
                        {payment.status === 'FAILED' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        {payment.status === 'EXPIRED' && (
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No payments yet</p>
                <p className="text-gray-400 text-xs mt-1">Your recent transactions will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Gateways Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Payment Gateways</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Available payment methods for your store</p>
          </div>
          <Link 
            to="/dashboard/integration" 
            className="text-primary hover:text-primary-dark text-sm font-medium flex items-center space-x-1 group"
          >
            <span>Manage</span>
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {availableGateways.map((gateway, index) => {
            const isActive = gateway.status === 'active';
            
            return (
              <motion.div
                key={gateway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 group cursor-pointer ${
                  isActive 
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="mb-3">
                  <h3 className={`font-semibold text-sm mb-1 ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                    {gateway.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{gateway.description}</p>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex flex-wrap gap-1">
                    {gateway.features.map((feature) => (
                      <span
                        key={feature}
                        className={`text-xs px-2 py-1 rounded-full ${
                          isActive 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${isActive ? 'text-primary' : 'text-gray-600'}`}>
                      Fee: {gateway.fee}
                    </span>
                    <span className={`${isActive ? 'text-primary' : 'text-gray-600'}`}>
                      Payout: {gateway.payout}
                    </span>
                  </div>
                </div>
                
                <div className={`text-xs font-medium ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}>
                  {isActive ? 'Active' : 'Available'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/payment-links"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group"
          >
            <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
              <LinkIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Payment Links</div>
              <div className="text-sm text-gray-500">Create payment links</div>
            </div>
          </Link>
          
          <Link
            to="/dashboard/transactions"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group"
          >
            <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">View Transactions</div>
              <div className="text-sm text-gray-500">Monitor payments</div>
            </div>
          </Link>
          
          <Link
            to="/dashboard/integration"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group"
          >
            <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">API Integration</div>
              <div className="text-sm text-gray-500">Setup webhooks</div>
            </div>
          </Link>
          
          <Link
            to="/dashboard/settings"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 group"
          >
            <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Settings</div>
              <div className="text-sm text-gray-500">Account settings</div>
            </div>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {selectedPayment && (
          <PaymentDetailsModal
            payment={selectedPayment}
            onClose={() => setSelectedPayment(null)}
          />
        )}
        {showGatewaySettings && profile && (
          <GatewaySettingsModal
            profile={profile}
            onClose={() => setShowGatewaySettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Account;