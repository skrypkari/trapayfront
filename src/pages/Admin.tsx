import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  CreditCard,
  Activity,
  Wallet,
  Target,
  Award,
  Sparkles,
  Shield,
  Globe,
  Building2,
  Zap
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAdmin } from '../hooks/useAdmin';
import LoadingSpinner from '../components/LoadingSpinner';

const Admin: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const { adminUser, useStats } = useAdmin();
  const { data: stats, isLoading: statsLoading, error: statsError } = useStats(selectedPeriod);

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
      categories: stats?.dailyRevenue?.map(item => 
        format(new Date(item.date), 'MMM d')
      ) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        show: false
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
        bottom: 0
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
      data: stats?.dailyRevenue?.map(item => item.amount) || [3100, 4000, 2800, 5100, 4200, 6000, 4800]
    }
  ];

  // Handle loading and error states
  if (statsError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">
          <AlertTriangle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-600">Failed to load admin statistics. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Hero Section with Admin Profile */}
      {adminUser && (
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
                      {adminUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    Welcome back, {adminUser.username}!
                  </h1>
                  <p className="text-white/80 mb-2">Administrator Dashboard</p>
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4" />
                      <span>Admin Access</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4" />
                      <span>System Management</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {statsLoading ? '...' : stats?.totalUsers.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-white/70">Total Users</div>
                </div>
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
        ) : stats ? (
          <>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>

              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRevenue.toLocaleString()} USDT
                </p>
                <p className="text-xs text-gray-400 mt-1">Platform wide</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>

              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">Active merchants</p>
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

              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPayments.toLocaleString()}
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

              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Payment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averagePayment.toFixed(2)} USDT
                </p>
                <p className="text-xs text-gray-400 mt-1">Per transaction</p>
              </div>
            </motion.div>
          </>
        ) : null}
      </div>

      {/* Platform Revenue Chart - Full Width */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Platform Revenue</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Track overall platform performance</p>
          </div>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Admin Actions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group"
          >
            <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Manage Users</div>
              <div className="text-sm text-gray-500">View and edit users</div>
            </div>
          </Link>
          
          <Link
            to="/admin/payments"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group"
          >
            <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">View Payments</div>
              <div className="text-sm text-gray-500">Monitor transactions</div>
            </div>
          </Link>
          
          <Link
            to="/admin/payouts"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group"
          >
            <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Manage Payouts</div>
              <div className="text-sm text-gray-500">Process withdrawals</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Admin;