import React, { useState } from 'react';
import { Settings, Key, GitBranch as BrandTelegram, Copy, RefreshCw, Check, AlertTriangle, X, Percent, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [defaultCommission, setDefaultCommission] = useState(2.5);
  const [payoutPeriod, setPayoutPeriod] = useState(7);
  const [showCopied, setShowCopied] = useState<string | null>(null);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'api-keys', label: 'API Keys', icon: Key }
  ];

  const apiKeys = [
    {
      id: '1',
      name: 'Stripe API Key',
      key: 'sk_live_123456789abcdefghijklmnopqrstuvwxyz',
      type: 'stripe'
    },
    {
      id: '2',
      name: 'PayPal API Key',
      key: 'sk_live_987654321zyxwvutsrqponmlkjihgfedcba',
      type: 'paypal'
    },
    {
      id: '3',
      name: 'Telegram Bot API Key',
      key: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
      type: 'telegram'
    }
  ];

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your platform settings and configurations
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Commission</h2>
                  <div className="relative w-48">
                    <input
                      type="number"
                      value={defaultCommission}
                      onChange={(e) => setDefaultCommission(parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-8"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Period</h2>
                  <div className="relative w-48">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={payoutPeriod}
                        onChange={(e) => setPayoutPeriod(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-8"
                        min="1"
                        max="90"
                      />
                      <span className="text-gray-500">days</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Number of days before funds become available for payout
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Telegram Support</h2>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">Enable Telegram notifications</span>
                    </label>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Support Chat ID</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="@username or chat ID"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{apiKey.name}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {showCopied === apiKey.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setShowRegenerateConfirm(true)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm break-all">
                        <span className="text-gray-400">••••••••••••••••••••••••••••••••</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regenerate Key Confirmation Modal */}
      <AnimatePresence>
        {showRegenerateConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowRegenerateConfirm(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Regenerate API Key</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    This will immediately invalidate all existing API keys. Your integrations will stop working until new keys are generated.
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowRegenerateConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700">
                  Regenerate Key
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSettings;