import React, { useState } from 'react';
import {
  Search,
  Calendar,
  ArrowUpDown,
  Mail,
  UserCheck,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Settings,
  AlertTriangle,
  Download,
  Filter,
  Eye,
  Globe,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import DatePicker from '../components/DatePicker';

interface AuditLog {
  id: string;
  timestamp: Date;
  adminEmail: string;
  actionType: 'user_created' | 'user_updated' | 'user_deleted' | 'payout_approved' | 'payout_rejected' | 'settings_updated';
  target: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

const sampleLogs: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: new Date('2024-03-20T14:30:00'),
    adminEmail: 'admin@example.com',
    actionType: 'user_created',
    target: 'john.doe@example.com',
    details: 'Created new user account',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    metadata: {
      role: 'user',
      verificationStatus: 'pending',
      source: 'admin_panel'
    }
  },
  {
    id: 'LOG-002',
    timestamp: new Date('2024-03-20T13:15:00'),
    adminEmail: 'admin@example.com',
    actionType: 'payout_approved',
    target: 'Payout #12345',
    details: 'Approved payout request for $1,500.00',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    metadata: {
      amount: 1500.00,
      currency: 'USD',
      recipientBank: '****1234',
      status: 'approved'
    }
  },
  {
    id: 'LOG-003',
    timestamp: new Date('2024-03-20T12:45:00'),
    adminEmail: 'admin2@example.com',
    actionType: 'settings_updated',
    target: 'System Settings',
    details: 'Updated payout threshold settings',
    ipAddress: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    metadata: {
      previousValue: { threshold: 100 },
      newValue: { threshold: 250 },
      component: 'payout_settings'
    }
  },
  {
    id: 'LOG-004',
    timestamp: new Date('2024-03-20T11:30:00'),
    adminEmail: 'admin@example.com',
    actionType: 'user_updated',
    target: 'alice@example.com',
    details: 'Updated user permissions',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    metadata: {
      changes: {
        role: ['user', 'admin'],
        permissions: ['added: manage_users']
      }
    }
  },
  {
    id: 'LOG-005',
    timestamp: new Date('2024-03-20T10:15:00'),
    adminEmail: 'admin2@example.com',
    actionType: 'payout_rejected',
    target: 'Payout #12346',
    details: 'Rejected payout request due to suspicious activity',
    ipAddress: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    metadata: {
      amount: 5000.00,
      currency: 'USD',
      reason: 'suspicious_activity',
      flags: ['large_amount', 'unusual_timing']
    }
  }
];

const LogDetailsModal: React.FC<{
  log: AuditLog;
  onClose: () => void;
}> = ({ log, onClose }) => {
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
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                <p className="text-sm text-gray-500">{log.id}</p>
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
                <div className="text-sm font-medium text-gray-500 mb-1">Timestamp</div>
                <div className="text-sm text-gray-900">
                  {format(log.timestamp, 'PPpp')}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Admin</div>
                <div className="text-sm text-gray-900">{log.adminEmail}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Action</div>
                <div className="text-sm text-gray-900 capitalize">
                  {log.actionType.replace('_', ' ')}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Target</div>
                <div className="text-sm text-gray-900">{log.target}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Details</div>
                <div className="text-sm text-gray-900">{log.details}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">IP Address</div>
                <div className="text-sm font-mono text-gray-900">{log.ipAddress}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">User Agent</div>
                <div className="text-sm text-gray-900 break-all">{log.userAgent}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-sm font-medium text-gray-500 mb-2">Additional Details</div>
            <pre className="text-sm text-gray-900 whitespace-pre-wrap">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminAuditLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getActionIcon = (actionType: AuditLog['actionType']) => {
    switch (actionType) {
      case 'user_created':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'user_updated':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'user_deleted':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'payout_approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'payout_rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'settings_updated':
        return <Settings className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getActionColor = (actionType: AuditLog['actionType']) => {
    switch (actionType) {
      case 'user_created':
        return 'bg-green-50 text-green-700';
      case 'user_updated':
        return 'bg-blue-50 text-blue-700';
      case 'user_deleted':
        return 'bg-red-50 text-red-700';
      case 'payout_approved':
        return 'bg-green-50 text-green-700';
      case 'payout_rejected':
        return 'bg-red-50 text-red-700';
      case 'settings_updated':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const filteredLogs = sampleLogs.filter(log => {
    const matchesSearch = 
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDateRange = (!startDate || log.timestamp >= startDate) &&
                           (!endDate || log.timestamp <= endDate);

    return matchesSearch && matchesDateRange;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Audit Log</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and monitor all administrative actions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </motion.button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4">
                  <button className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span>Timestamp</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left px-6 py-4 w-[140px]">
                  <span className="text-sm font-medium text-gray-500">Admin</span>
                </th>
                <th className="text-left px-6 py-4">
                  <span className="text-sm font-medium text-gray-500">Action</span>
                </th>
                <th className="text-left px-6 py-4 w-[140px]">
                  <span className="text-sm font-medium text-gray-500">Target</span>
                </th>
                <th className="w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {format(log.timestamp, 'MMM d, yyyy HH:mm')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[140px]">{log.adminEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${getActionColor(log.actionType)}`}>
                      {getActionIcon(log.actionType)}
                      <span className="text-sm font-medium capitalize">
                        {log.actionType.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[140px]">{log.target}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedLog && (
          <LogDetailsModal
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAuditLog;