import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Terminal,
  AlertCircle,
  ChevronDown,
  Globe,
  Key,
  Lock,
  Webhook,
  Code,
  History,
  Search,
  Filter,
  ArrowRight,
  Check,
  Eye,
  MoreHorizontal,
  TestTube,
  Save,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  useShopProfile, 
  useWebhookLogs, 
  useShopSettings,
  useUpdateWebhookSettings,
  useTestWebhook,
  useRetryWebhook,
  type WebhookLog 
} from '../hooks/useShop';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomSelect from '../components/CustomSelect';

const WebhookLogDetailsModal: React.FC<{
  log: WebhookLog;
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
                <Webhook className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Webhook Log Details</h3>
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
                <div className="text-sm font-medium text-gray-500 mb-1">Event</div>
                <div className="text-sm text-gray-900">{log.event}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Status Code</div>
                <div className={`text-sm font-medium ${
                  log.statusCode >= 200 && log.statusCode < 300 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {log.statusCode}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Retry Count</div>
                <div className="text-sm text-gray-900">{log.retryCount}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Created At</div>
                <div className="text-sm text-gray-900">
                  {format(new Date(log.createdAt), 'PPpp')}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {log.payment && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Payment Details</div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-900">{log.payment.productName}</div>
                    <div className="text-sm text-gray-600">
                      {log.payment.amount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: log.payment.currency,
                      })}
                    </div>
                  </div>
                </div>
              )}

              {log.responseBody && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-500 mb-1">Response Body</div>
                  <pre className="text-xs text-gray-900 whitespace-pre-wrap break-all">
                    {log.responseBody}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Integration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('curl');
  const [showCopied, setShowCopied] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  
  // Webhook settings state
  const [webhookSettings, setWebhookSettings] = useState({
    webhookUrl: '',
    webhookEvents: ['payment.success', 'payment.failed', 'payment.pending']
  });
  const [webhookModified, setWebhookModified] = useState(false);

  // Webhook test result state
  const [webhookTestResult, setWebhookTestResult] = useState<{
    success: boolean;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  } | null>(null);

  const { data: profile, isLoading: profileLoading } = useShopProfile();
  const { data: webhookLogsData, isLoading: logsLoading } = useWebhookLogs({ limit: 10 });
  const { data: shopSettings, isLoading: settingsLoading } = useShopSettings();
  const updateWebhookMutation = useUpdateWebhookSettings();
  const testWebhookMutation = useTestWebhook();
  const retryWebhookMutation = useRetryWebhook();

  // Update local webhook settings when API data loads
  useEffect(() => {
    if (shopSettings) {
      setWebhookSettings({
        webhookUrl: shopSettings.webhookUrl || '',
        webhookEvents: shopSettings.webhookEvents || ['payment.success', 'payment.failed', 'payment.pending']
      });
      setWebhookModified(false);
    }
  }, [shopSettings]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2000);
  };

  const handleWebhookEventChange = (event: string, enabled: boolean) => {
    setWebhookSettings(prev => ({
      ...prev,
      webhookEvents: enabled 
        ? [...prev.webhookEvents, event]
        : prev.webhookEvents.filter(e => e !== event)
    }));
    setWebhookModified(true);
  };

  const handleWebhookUrlChange = (url: string) => {
    setWebhookSettings(prev => ({
      ...prev,
      webhookUrl: url
    }));
    setWebhookModified(true);
    // Clear previous test result when URL changes
    setWebhookTestResult(null);
  };

  const handleSaveWebhookSettings = async () => {
    try {
      await updateWebhookMutation.mutateAsync(webhookSettings);
      toast.success('Webhook settings updated successfully');
      setWebhookModified(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update webhook settings');
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookSettings.webhookUrl) {
      toast.error('Please enter a webhook URL first');
      return;
    }

    try {
      // Clear previous result
      setWebhookTestResult(null);
      
      const response = await testWebhookMutation.mutateAsync();
      
      // Set the test result based on the API response
      setWebhookTestResult({
        success: response.success,
        statusCode: response.result?.statusCode,
        responseTime: response.result?.responseTime
      });

      if (response.success) {
        toast.success('Test webhook sent successfully!');
      } else {
        toast.error('Webhook test failed');
      }
    } catch (error: any) {
      setWebhookTestResult({
        success: false,
        error: error.message || 'Failed to send test webhook'
      });
      toast.error(error.message || 'Failed to send test webhook');
    }
  };

  const handleRetryWebhook = async (paymentId: string) => {
    try {
      await retryWebhookMutation.mutateAsync(paymentId);
      toast.success('Webhook retry initiated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to retry webhook');
    }
  };

  const webhookEvents = [
    { id: 'payment.success', label: 'payment.success', description: 'Triggered when a payment is successfully completed' },
    { id: 'payment.failed', label: 'payment.failed', description: 'Triggered when a payment fails or is declined' },
    { id: 'payment.pending', label: 'payment.pending', description: 'Triggered when a payment is pending confirmation' }
  ];

  const codeExamples = {
    curl: `curl -X POST https://api.trapay.com/payments/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "public_key": ${profile?.publicKey || 'your_api_key'},
    "gateway": "0100",
    "order_id": "my_order_999",
    "amount": 25,
    "currency": "EUR",
    "customer_email": "customer@example.com",
    "customer_name": "Alice Brown"
  }'`,
    node: `const trapay = require('trapay');
const client = new trapay('${profile?.publicKey || 'your_api_key'}');

const payment = await client.payments.create({
  amount: 1000,
  currency: 'USD',
  product_name: 'Premium Subscription',
  customer_email: 'customer@example.com'
});`,
    python: `import trapay

client = trapay.Client('${profile?.publicKey || 'your_api_key'}')

payment = client.payments.create(
    amount=1000,
    currency='USD',
    product_name='Premium Subscription',
    customer_email='customer@example.com'
)`
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Integration</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your API keys, webhooks, and view documentation</p>
        </div>
        <a
          href="https://docs.trapay.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors"
        >
          <Code className="h-4 w-4 mr-2" />
          View Documentation
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* API Keys Section */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 md:px-6 py-4">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-6">
              {profile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <div className="border rounded-lg p-4 group-hover:border-primary transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Public Key
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {profile.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopy(profile.publicKey, 'public-key')}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {showCopied === 'public-key' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm break-all">
                      <span className="text-gray-600">{profile.publicKey}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Code Examples Section */}
          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 md:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Code Examples</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['curl'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative"
                >
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-white text-sm">
                      <code>{codeExamples[activeTab as keyof typeof codeExamples]}</code>
                    </pre>
                  </div>
                  <button
                    onClick={() => handleCopy(codeExamples[activeTab as keyof typeof codeExamples], `code-${activeTab}`)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {showCopied === `code-${activeTab}` ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-white" />
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Webhook Settings Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 md:px-6 py-4">
              <div className="flex items-center space-x-2">
                <Webhook className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Webhook Settings</h2>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-6">
              {settingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          id="webhook-url"
                          value={webhookSettings.webhookUrl}
                          onChange={(e) => handleWebhookUrlChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                          placeholder="https://your-domain.com/webhook"
                        />
                      </div>
                      <button
                        onClick={handleTestWebhook}
                        disabled={!webhookSettings.webhookUrl || testWebhookMutation.isPending}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                      >
                        {testWebhookMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                        <span>Test</span>
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      This URL will receive POST requests when payment events occur.
                    </p>

                    {/* Webhook Test Result */}
                    {webhookTestResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 p-4 rounded-lg border ${
                          webhookTestResult.success 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {webhookTestResult.success ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              webhookTestResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                              {webhookTestResult.success ? 'Webhook Test Successful' : 'Webhook Test Failed'}
                            </h4>
                            <div className={`mt-1 text-sm ${
                              webhookTestResult.success ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {webhookTestResult.success ? (
                                <div className="space-y-1">
                                  <p>Your webhook endpoint is working correctly!</p>
                                  {webhookTestResult.statusCode && (
                                    <p>Status Code: <span className="font-mono">{webhookTestResult.statusCode}</span></p>
                                  )}
                                  {webhookTestResult.responseTime && (
                                    <p>Response Time: <span className="font-mono">{webhookTestResult.responseTime}ms</span></p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <p>Your webhook endpoint is not responding correctly.</p>
                                  {webhookTestResult.error && (
                                    <p>Error: {webhookTestResult.error}</p>
                                  )}
                                  {webhookTestResult.statusCode && (
                                    <p>Status Code: <span className="font-mono">{webhookTestResult.statusCode}</span></p>
                                  )}
                                  <p className="text-xs">Please check your endpoint URL and ensure it's accessible.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Webhook Events
                    </label>
                    <div className="space-y-4">
                      {webhookEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded text-gray-800">
                                {event.label}
                              </code>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={webhookSettings.webhookEvents.includes(event.id)}
                                onChange={(e) => handleWebhookEventChange(event.id, e.target.checked)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Webhook className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Webhook Security</h4>
                        <div className="mt-2 text-sm text-blue-700 space-y-1">
                          <p>• All webhook requests include a signature header for verification</p>
                          <p>• Webhooks are sent with a 10-second timeout</p>
                          <p>• Failed webhooks are retried up to 3 times with exponential backoff</p>
                          <p>• Use HTTPS URLs for secure webhook delivery</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveWebhookSettings}
                    disabled={!webhookModified || updateWebhookMutation.isPending}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateWebhookMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {updateWebhookMutation.isPending ? 'Saving...' : 'Save Webhook Settings'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Recent Webhook Deliveries */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 md:px-6 py-4">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {logsLoading ? (
                <div className="p-4 text-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : webhookLogsData?.logs && webhookLogsData.logs.length > 0 ? (
                webhookLogsData.logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{log.event}</span>
                      {log.statusCode >= 200 && log.statusCode < 300 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{format(new Date(log.createdAt), 'MMM d, HH:mm')}</div>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.statusCode >= 200 && log.statusCode < 300 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Webhook className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No webhook deliveries yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedLog && (
          <WebhookLogDetailsModal
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Integration;