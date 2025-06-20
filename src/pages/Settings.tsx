import React, { useState, useEffect } from 'react';
import { User, Lock, Shield, Bell, Key, AlertTriangle, Check, X, Upload, GitBranch as BrandTelegram, Copy, RefreshCw, Eye, EyeOff, Wallet, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useShopProfile, useUpdateShopProfile, useWalletSettings, useUpdateWalletSettings } from '../hooks/useShop';
import { 
  useShopSettings, 
  useUpdatePassword, 
  useUpdateNotifications, 
  useUpdateTelegramSettings, 
  useRevokeApiKeys, 
  useDeleteAccount 
} from '../hooks/useSettings';
import LoadingSpinner from '../components/LoadingSpinner';

const ApiKeysModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { data: settings, isLoading } = useShopSettings();
  const updateTelegramMutation = useUpdateTelegramSettings();
  
  const [botApiKey, setBotApiKey] = useState('');
  const [chatId, setChatId] = useState('');
  const [showBotKey, setShowBotKey] = useState(false);
  const [showChatId, setShowChatId] = useState(false);
  const [showCopied, setShowCopied] = useState<string | null>(null);

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setBotApiKey(settings.telegramBotApiKey || '');
      setChatId(settings.telegramChatId || '');
    }
  }, [settings]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

  const handleSave = async () => {
    try {
      await updateTelegramMutation.mutateAsync({
        botApiKey,
        chatId
      });
      toast.success('Telegram settings updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update Telegram settings');
    }
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
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <BrandTelegram className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Telegram Bot API Keys</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bot API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showBotKey ? 'text' : 'password'}
                        value={botApiKey}
                        onChange={(e) => setBotApiKey(e.target.value)}
                        className="w-full px-4 py-2.5 pr-20 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono text-sm"
                        placeholder="Enter your bot API key"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                        <button
                          type="button"
                          onClick={() => setShowBotKey(!showBotKey)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          {showBotKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(botApiKey, 'bot-key')}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          {showCopied === 'bot-key' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Get this from @BotFather on Telegram
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chat ID
                    </label>
                    <div className="relative">
                      <input
                        type={showChatId ? 'text' : 'password'}
                        value={chatId}
                        onChange={(e) => setChatId(e.target.value)}
                        className="w-full px-4 py-2.5 pr-20 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono text-sm"
                        placeholder="Enter chat ID for notifications"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                        <button
                          type="button"
                          onClick={() => setShowChatId(!showChatId)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          {showChatId ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(chatId, 'chat-id')}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          {showCopied === 'chat-id' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Chat ID where notifications will be sent
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <BrandTelegram className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">How to get Chat ID:</h4>
                        <ol className="mt-2 text-sm text-blue-700 list-decimal list-inside space-y-1">
                          <li>Start a chat with your bot</li>
                          <li>Send any message to the bot</li>
                          <li>Visit: https://api.telegram.org/bot{'{BOT_TOKEN}'}/getUpdates</li>
                          <li>Look for "chat":{"{"}"id": in the response</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                disabled={updateTelegramMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateTelegramMutation.isPending}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {updateTelegramMutation.isPending && <LoadingSpinner size="sm" />}
                <span>{updateTelegramMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Local notification settings state - ✅ UPDATED: Removed refund and api_error
  const [notificationSettings, setNotificationSettings] = useState({
    payment_success: false,
    payment_failed: false,
    payout: false,
    login: false
  });

  // Wallet settings state
  const [walletSettings, setWalletSettings] = useState({
    usdtPolygonWallet: '',
    usdtTrcWallet: '',
    usdtErcWallet: '',
    usdcPolygonWallet: ''
  });

  // Track if notifications/wallets have been modified
  const [notificationsModified, setNotificationsModified] = useState(false);
  const [walletsModified, setWalletsModified] = useState(false);

  // API hooks
  const { data: profile, isLoading: profileLoading } = useShopProfile();
  const { data: settings, isLoading: settingsLoading } = useShopSettings();
  const { data: wallets, isLoading: walletsLoading } = useWalletSettings();
  const updatePasswordMutation = useUpdatePassword();
  const updateNotificationsMutation = useUpdateNotifications();
  const updateWalletsMutation = useUpdateWalletSettings();
  const revokeApiKeysMutation = useRevokeApiKeys();

  // ✅ UPDATED: Update local notification settings when API data loads (removed refund and api_error)
  useEffect(() => {
    if (settings?.notifications) {
      console.log('🔍 Settings notifications from API:', settings.notifications); // Debug log
      setNotificationSettings({
        payment_success: settings.notifications.payment_success || false,
        payment_failed: settings.notifications.payment_failed || false,
        payout: settings.notifications.payout || false,
        login: settings.notifications.login || false
      });
      setNotificationsModified(false);
      console.log('🔍 Local notification settings updated:', {
        payment_success: settings.notifications.payment_success,
        payment_failed: settings.notifications.payment_failed,
        payout: settings.notifications.payout,
        login: settings.notifications.login
      }); // Debug log
    }
  }, [settings?.notifications]);

  // Update local wallet settings when API data loads
  useEffect(() => {
    if (profile?.wallets) {
      setWalletSettings({
        usdtPolygonWallet: profile.wallets.usdtPolygonWallet || '',
        usdtTrcWallet: profile.wallets.usdtTrcWallet || '',
        usdtErcWallet: profile.wallets.usdtErcWallet || '',
        usdcPolygonWallet: profile.wallets.usdcPolygonWallet || ''
      });
      setWalletsModified(false);
    }
  }, [profile?.wallets]);

  // ✅ UPDATED: Removed 'advanced' tab
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'wallets', label: 'Wallets', icon: Wallet }
  ];

  // ✅ UPDATED: Removed refund and api_error notifications
  const telegramNotifications = [
    { id: 'payment_success', label: 'Successful payment', description: 'When a payment is successfully processed' },
    { id: 'payment_failed', label: 'Failed payment', description: 'When a payment fails to process' },
    { id: 'payout', label: 'Payout sent', description: 'When a payout is sent to your bank account' },
    { id: 'login', label: 'New login', description: 'When a new device logs into your account' }
  ];

  const walletTypes = [
    {
      id: 'usdtPolygonWallet',
      label: 'USDT (Polygon)',
      description: 'Polygon network USDT wallet address',
      placeholder: '0x1234567890abcdef...',
      icon: '🔷'
    },
    {
      id: 'usdtTrcWallet',
      label: 'USDT (TRC-20)',
      description: 'TRON network USDT wallet address',
      placeholder: 'TRX1234567890abcdef...',
      icon: '🔴'
    },
    {
      id: 'usdtErcWallet',
      label: 'USDT (ERC-20)',
      description: 'Ethereum network USDT wallet address',
      placeholder: '0xabcdef1234567890...',
      icon: '⚫'
    },
    {
      id: 'usdcPolygonWallet',
      label: 'USDC (Polygon)',
      description: 'Polygon network USDC wallet address',
      placeholder: '0xfedcba0987654321...',
      icon: '🔵'
    }
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  const handleNotificationChange = (notificationId: string, enabled: boolean) => {
    console.log('🔍 Notification change:', notificationId, enabled); // Debug log
    setNotificationSettings(prev => ({
      ...prev,
      [notificationId]: enabled
    }));
    setNotificationsModified(true);
  };

  const handleWalletChange = (walletId: string, address: string) => {
    setWalletSettings(prev => ({
      ...prev,
      [walletId]: address
    }));
    setWalletsModified(true);
  };

  const handleSaveNotifications = async () => {
    try {
      console.log('🔍 Saving notification settings:', notificationSettings); // Debug log
      await updateNotificationsMutation.mutateAsync(notificationSettings);
      toast.success('Notification preferences updated');
      setNotificationsModified(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notifications');
    }
  };

  const handleSaveWallets = async () => {
    try {
      await updateWalletsMutation.mutateAsync(walletSettings);
      toast.success('Wallet settings updated successfully');
      setWalletsModified(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wallet settings');
    }
  };

  const handleRevokeApiKeys = async () => {
    try {
      await revokeApiKeysMutation.mutateAsync({});
      toast.success('All API keys have been revoked');
      setShowRevokeConfirm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke API keys');
    }
  };

  if (profileLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences
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
            {/* Profile Settings */}
            {activeTab === 'profile' && profile && settings && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                      value={profile.name}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                      value={profile.username}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                      value={profile.shopUrl}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telegram ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BrandTelegram className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                        value={profile.telegram}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                    Read Only
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Ensure your account is using a long, random password to stay secure.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmNewPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-6">
                      <button 
                        type="submit"
                        disabled={updatePasswordMutation.isPending}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {updatePasswordMutation.isPending && <LoadingSpinner size="sm" />}
                        <span>{updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* ✅ UPDATED: Only Revoke API Keys button remains */}
                <div className="pt-6 border-t border-gray-200">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Key className="h-5 w-5 text-yellow-500 mr-2" />
                      API Keys
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage your API access and security.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setShowApiKeysModal(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      View API Keys
                    </button>
                    <button
                      onClick={() => setShowRevokeConfirm(true)}
                      className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      Revoke All API Keys
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Telegram Notifications</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose what notifications you want to receive via Telegram.
                  </p>
                </div>

                {/* Telegram Bot Setup Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <BrandTelegram className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Telegram Notifications</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Step 1: Start the bot</h4>
                          <a
                            href="https://t.me/trapay_notifi_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <BrandTelegram className="h-4 w-4" />
                            <span>Open TRAPAY Notification Bot</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Step 2: Send your credentials</h4>
                          <div className="bg-blue-100 rounded-lg p-4">
                            <p className="text-sm text-blue-700 mb-2">
                              After clicking "Start" in the bot, send this message:
                            </p>
                            <div className="bg-white rounded-lg p-3 border border-blue-200">
                              <code className="text-sm text-blue-900 break-all">
                                {profile ? `${profile.username} ${profile.publicKey}` : 'your_username your_api_key'}
                              </code>
                            </div>
                            <p className="text-xs text-blue-600 mt-2">
                              Replace with your actual username and API key from the Integration page
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Step 3: Enable notifications</h4>
                          <p className="text-sm text-blue-700">
                            Once the bot confirms your registration, you can enable the notifications you want to receive below.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {settingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {telegramNotifications.map((notification) => {
                        const isChecked = notificationSettings[notification.id as keyof typeof notificationSettings];
                        console.log(`🔍 Notification ${notification.id} checked state:`, isChecked); // Debug log
                        
                        return (
                          <div
                            key={notification.id}
                            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.label}</p>
                              <p className="mt-1 text-sm text-gray-500">{notification.description}</p>
                            </div>
                            <div className="flex items-center">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    console.log(`🔍 Checkbox change for ${notification.id}:`, e.target.checked); // Debug log
                                    handleNotificationChange(notification.id, e.target.checked);
                                  }}
                                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-600">
                                  <BrandTelegram className="h-4 w-4" />
                                </span>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-6">
                      <button 
                        onClick={handleSaveNotifications}
                        disabled={updateNotificationsMutation.isPending || !notificationsModified}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {updateNotificationsMutation.isPending && <LoadingSpinner size="sm" />}
                        <span>{updateNotificationsMutation.isPending ? 'Saving...' : 'Save Preferences'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Wallet Settings */}
            {activeTab === 'wallets' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Crypto Wallets</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure your cryptocurrency wallet addresses for receiving payouts.
                  </p>
                </div>

                {walletsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {walletTypes.map((wallet) => (
                      <div key={wallet.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-2xl">{wallet.icon}</span>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{wallet.label}</h3>
                            <p className="text-sm text-gray-500">{wallet.description}</p>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={walletSettings[wallet.id as keyof typeof walletSettings]}
                          onChange={(e) => handleWalletChange(wallet.id, e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono text-sm"
                          placeholder={wallet.placeholder}
                        />
                      </div>
                    ))}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Wallet className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">Important Notes:</h4>
                          <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                            <li>Double-check wallet addresses before saving - incorrect addresses may result in lost funds</li>
                            <li>Only use wallet addresses that you control and have access to</li>
                            <li>Different networks require different wallet formats (ERC-20, TRC-20, Polygon)</li>
                            <li>Payouts will be sent to these addresses based on the selected network</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button 
                        onClick={handleSaveWallets}
                        disabled={updateWalletsMutation.isPending || !walletsModified}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {updateWalletsMutation.isPending && <LoadingSpinner size="sm" />}
                        <span>{updateWalletsMutation.isPending ? 'Saving...' : 'Save Wallet Settings'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Keys Modal */}
      <ApiKeysModal
        isOpen={showApiKeysModal}
        onClose={() => setShowApiKeysModal(false)}
      />

      {/* Revoke API Keys Confirmation Modal */}
      <AnimatePresence>
        {showRevokeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowRevokeConfirm(false);
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
                  <h3 className="text-lg font-semibold text-gray-900">Revoke All API Keys</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    This will immediately invalidate all existing API keys. Your integrations will stop working until new keys are generated.
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowRevokeConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                  disabled={revokeApiKeysMutation.isPending}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRevokeApiKeys}
                  disabled={revokeApiKeysMutation.isPending}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {revokeApiKeysMutation.isPending && <LoadingSpinner size="sm" />}
                  <span>{revokeApiKeysMutation.isPending ? 'Revoking...' : 'Revoke All Keys'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;