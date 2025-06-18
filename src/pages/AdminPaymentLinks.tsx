import React, { useState } from 'react';
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
  Lock,
  Mail,
  Calendar,
  Link2,
  RefreshCw,
  ChevronDown,
  Share2,
  Trash2,
  Edit3,
  BarChart2,
  Users,
  Globe,
  MoreHorizontal
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DatePicker from '../components/DatePicker';
import CustomSelect from '../components/CustomSelect';

interface PaymentLink {
  id: string;
  title: string;
  description: string;
  amount: number | null;
  currency: string;
  visibility: 'public' | 'private';
  expiryDate: Date | null;
  redirectUrl: string | null;
  emailNotification: boolean;
  allowReuse: boolean;
  showDescription: boolean;
  createdAt: Date;
  status: 'active' | 'expired' | 'disabled';
  type: 'single' | 'multi';
  usageCount: number;
}

const sampleLinks: PaymentLink[] = [
  {
    id: 'pl_1',
    title: 'Premium Subscription',
    description: 'Monthly subscription for premium features',
    amount: 29.99,
    currency: 'USD',
    visibility: 'public',
    expiryDate: null,
    redirectUrl: 'https://pay.example.com/premium-subscription',
    emailNotification: true,
    allowReuse: true,
    showDescription: true,
    createdAt: new Date('2024-03-15'),
    status: 'active',
    type: 'subscription',
    usageCount: 12
  },
  {
    id: 'pl_2',
    title: 'One-time Donation',
    description: 'Support our cause',
    amount: null,
    currency: 'USD',
    visibility: 'public',
    expiryDate: null,
    redirectUrl: null,
    emailNotification: true,
    allowReuse: true,
    showDescription: true,
    createdAt: new Date('2024-03-05'),
    status: 'active',
    type: 'donation',
    usageCount: 8
  }
];

const CreateLinkModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [emailNotification, setEmailNotification] = useState(true);
  const [allowReuse, setAllowReuse] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [linkType, setLinkType] = useState<'single' | 'multi'>('single');

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' }
  ];

  const linkTypeOptions = [
    { value: 'single', label: 'Single-use', icon: <Link2 className="h-4 w-4" /> },
    { value: 'multi', label: 'Multi-use', icon: <RefreshCw className="h-4 w-4" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

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
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8"
          >
            <div className="px-6 py-4 border-b rounded-t-xl border-gray-200 bg-white z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create Payment Link</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Type
                  </label>
                  <CustomSelect
                    value={linkType}
                    onChange={(value) => setLinkType(value as typeof linkType)}
                    options={linkTypeOptions}
                    placeholder="Select link type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g., Premium Subscription"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Describe what this payment is for"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-4 pr-20 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="0.00"
                        step="0.01"
                        disabled={linkType === 'donation'}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <CustomSelect
                          value={currency}
                          onChange={setCurrency}
                          options={currencyOptions}
                          placeholder="Currency"
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(true)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left flex items-center space-x-3 hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className={expiryDate ? 'text-gray-900' : 'text-gray-500'}>
                        {expiryDate ? expiryDate.toLocaleDateString() : 'Select date'}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Redirect URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="https://example.com/thank-you"
                  />
                </div>

              </div>

              <div className="flex justify-end space-x-3 sticky bottom-0 bg-white py-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark"
                >
                  Create Link
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
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url);
    setShowCopied(true);
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
                <h3 className="text-lg font-semibold text-gray-900">{link.title}</h3>
                <p className="text-sm text-gray-500">{link.description}</p>
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
                <div className="text-sm font-medium text-gray-500 mb-1">Payment Link URL</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-900 font-mono truncate mr-2">{link.url}</div>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Amount</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {link.amount === null ? 'Variable' : `$${link.amount.toFixed(2)}`}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                <div className="mt-1">
                  {link.status === 'active' && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">Active</span>
                    </div>
                  )}
                  {link.status === 'expired' && (
                    <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg w-fit">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">Expired</span>
                    </div>
                  )}
                  {link.status === 'disabled' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg w-fit">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">Disabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Performance</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Clicks</span>
                    <span className="text-sm font-medium text-gray-900">{link.clicks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Payments</span>
                    <span className="text-sm font-medium text-gray-900">{link.payments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-sm font-medium text-gray-900">{link.conversionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="text-sm font-medium text-gray-900">${link.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Created At</div>
                <div className="text-sm text-gray-900">
                  {link.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <Copy className="h-5 w-5 text-gray-400 group-hover:text-primary mb-2" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Copy Link</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <Share2 className="h-5 w-5 text-gray-400 group-hover:text-primary mb-2" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Share</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <Edit3 className="h-5 w-5 text-gray-400 group-hover:text-primary mb-2" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Edit</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <Trash2 className="h-5 w-5 text-gray-400 group-hover:text-red-600 mb-2" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Delete</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminPaymentLinks: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCopied, setShowCopied] = useState<string | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    { value: 'expired', label: 'Expired', icon: <AlertTriangle className="h-4 w-4 text-yellow-600" /> },
    { value: 'disabled', label: 'Disabled', icon: <XCircle className="h-4 w-4 text-red-600" /> }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'single', label: 'Single-use', icon: <Link2 className="h-4 w-4" /> },
    { value: 'multi', label: 'Multi-use', icon: <RefreshCw className="h-4 w-4" /> },
    { value: 'subscription', label: 'Subscription', icon: <Calendar className="h-4 w-4" /> },
    { value: 'donation', label: 'Donation', icon: <Mail className="h-4 w-4" /> }
  ];

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`https://pay.example.com/${id}`);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

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
                value={typeFilter}
                onChange={setTypeFilter}
                options={typeOptions}
                placeholder="Filter by type"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Title</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Usage</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Created</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleLinks.map((link) => (
                <tr key={link.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-900">{link.title}</div>
                    <div className="text-sm text-gray-500">{link.description}</div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${
                      link.type === 'subscription' ? 'bg-blue-50 text-blue-600' :
                      link.type === 'donation' ? 'bg-green-50 text-green-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {link.type === 'subscription' && <Calendar className="h-4 w-4" />}
                      {link.type === 'donation' && <Mail className="h-4 w-4" />}
                      <span className="text-sm font-medium capitalize">{link.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-gray-900">
                      {link.amount === null ? 'Variable' : `$${link.amount}`}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${
                      link.status === 'active' ? 'bg-green-50 text-green-600' :
                      link.status === 'expired' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {link.status === 'active' && <CheckCircle2 className="h-4 w-4" />}
                      {link.status === 'expired' && <AlertTriangle className="h-4 w-4" />}
                      {link.status === 'disabled' && <XCircle className="h-4 w-4" />}
                      <span className="text-sm font-medium capitalize">{link.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">{link.usageCount} times</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {link.createdAt.toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleCopyLink(link.id)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg"
                      >
                        {showCopied === link.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateLinkModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPaymentLinks;