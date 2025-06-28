import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Wallet,
  QrCode,
  Timer,
  CreditCard,
  Shield,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/currency';
import LoadingSpinner from '../components/LoadingSpinner';

interface PaymentData {
  id: string;
  gateway: string;
  product_name: string;
  amount: number;
  currency: string;
  source_currency?: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'EXPIRED' | 'FAILED';
  payment_url: string;
  success_url?: string;
  fail_url?: string;
  customer_email?: string;
  customer_name?: string;
  invoice_total_sum?: number;
  qr_code?: string; // base64 изображение
  qr_url?: string; // кошелек
  created_at: string;
  updated_at: string;
  expires_at?: string;
  order_id?: string;
  merchant_brand?: string;
  external_payment_url?: string; // для внешних платежей
  gateway_order_id?: string; // для Plisio
}

const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Fetch payment data
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!id) {
        setError('Payment ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://api.trapay.uk/api/payments/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch payment data');
        }

        if (data.success && data.result) {
          setPaymentData(data.result);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load payment');
        toast.error(err.message || 'Failed to load payment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, [id]);

  // Timer for expiration
  useEffect(() => {
    if (!paymentData?.expires_at) return;

    const updateTimer = () => {
      const expiryTime = new Date(paymentData.expires_at!).getTime();
      const now = new Date().getTime();
      const difference = expiryTime - now;

      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
      } else {
        setTimeLeft(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [paymentData?.expires_at]);

  // Poll for payment status updates
  useEffect(() => {
    if (!paymentData || (paymentData.status !== 'PENDING' && paymentData.status !== 'PROCESSING')) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`https://api.trapay.uk/api/payments/${id}`);
        const data = await response.json();

        if (data.success && data.result) {
          const newStatus = data.result.status;
          if (newStatus !== paymentData.status) {
            setPaymentData(prev => prev ? { ...prev, status: newStatus } : null);
            
            if (newStatus === 'PAID') {
              toast.success('Payment completed successfully!');
              if (paymentData.success_url) {
                window.location.href = paymentData.success_url;
              }
            } else if (newStatus === 'FAILED') {
              toast.error('Payment failed');
              if (paymentData.fail_url) {
                window.location.href = paymentData.fail_url;
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to poll payment status:', err);
      }
    };

    const interval = setInterval(pollStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id, paymentData]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(type);
    setTimeout(() => setShowCopied(null), 2000);
    toast.success('Copied to clipboard');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get display order ID (order_id or fallback to id)
  const getDisplayOrderId = () => {
    return paymentData?.order_id || paymentData?.gateway_order_id || paymentData?.id ||'';
  };

  // Маппинг для source_currency
  const cryptoCurrencyLabels: Record<string, string> = {
    USDT_TRX: 'USDT TRC-20',
    USDT: 'USDT ERC-20',
    USDC: 'USDC ERC-20',
    BTC: 'BTC',
    ETH: 'ETH',
    TON: 'TON',
    TRX: 'TRON',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-3">Payment Not Successful</h1>
            <p className="text-gray-600 mb-8">Please try again or contact the payment recipient.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-dark transition-colors"
            >
              Go Back
            </button>
          </motion.div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span>Powered by</span>
                <div className="flex items-center space-x-1">
                  <img src="/logo.png" alt="TRAPAY" className="h-5" />
                </div>
              </div>
              <span>•</span>
              <a href="https://t.me/trapay_sales" className="hover:text-gray-700 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (
    paymentData?.external_payment_url &&
    paymentData.external_payment_url.includes('tesoft')
  ) {
    return (
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
        <iframe
          src={paymentData.external_payment_url}
          style={{ width: '100vw', height: '100vh', border: 'none' }}
          title="External Payment"
          allowFullScreen
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            {/* Payment Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-primary text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold truncate" title={getDisplayOrderId()}>
                      {getDisplayOrderId()}
                    </div>
                    {paymentData.merchant_brand && (
                      <div className="text-sm opacity-75 truncate mt-1" title={paymentData.merchant_brand}>
                        by {paymentData.merchant_brand}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-lg font-semibold">
                      {formatCurrency(paymentData.amount, paymentData.currency)}
                    </div>
                    {paymentData.source_currency && (
                      <div className="text-sm opacity-75">
                        via {cryptoCurrencyLabels[paymentData.source_currency] || paymentData.source_currency}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-8">
                {/* Pending State */}
                {paymentData.status === 'PENDING' && (
                  <div className="text-center space-y-6">
                    {/* QR Code Section for Plisio */}
                    {paymentData.gateway === 'plisio' && paymentData.qr_code && (
                      <>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">Scan to Pay</h2>
                          <p className="text-gray-600 text-sm">
                            Send exactly {paymentData.invoice_total_sum} {paymentData.source_currency}
                          </p>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center">
                          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                            <img 
                              src={`${paymentData.qr_code}`}
                              alt="Payment QR Code"
                              className="w-48 h-48 object-contain"
                            />
                          </div>
                        </div>

                        {/* Wallet Address */}
                        {paymentData.qr_url && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-700">
                              Or copy wallet address:
                            </div>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              <Wallet className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <code className="flex-1 text-xs font-mono text-gray-900 break-all">
                                {paymentData.qr_url}
                              </code>
                              <button
                                onClick={() => handleCopy(paymentData.qr_url!, 'wallet')}
                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                              >
                                {showCopied === 'wallet' ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Amount to Send */}
                        {paymentData.invoice_total_sum && paymentData.source_currency && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-700">
                              Amount to send:
                            </div>
                            <div className="flex items-center space-x-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                              <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              <span className="flex-1 text-lg font-semibold text-blue-900">
                                {paymentData.invoice_total_sum} {cryptoCurrencyLabels[paymentData.source_currency] || paymentData.source_currency}
                              </span>
                              <button
                                onClick={() => handleCopy(paymentData.invoice_total_sum!.toString(), 'amount')}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                              >
                                {showCopied === 'amount' ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Timer */}
                        {timeLeft !== null && timeLeft > 0 && (
                          <div className="flex items-center justify-center space-x-2 text-orange-600">
                            <Timer className="h-4 w-4" />
                            <span className="font-mono text-sm font-medium">
                              {formatTime(timeLeft)}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* External Payment Link for other gateways */}
                    {paymentData.gateway !== 'plisio' && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Payment</h2>
                          <p className="text-gray-600 text-sm">
                            Click the button below to proceed with your payment
                          </p>
                        </div>

                        <a
                          href={paymentData.payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-full bg-primary text-white py-4 px-6 rounded-xl font-medium hover:bg-primary-dark transition-colors"
                        >
                          Continue to Payment
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ UPDATED: Processing State - Payment received, waiting for blockchain confirmation */}
                {paymentData.status === 'PROCESSING' && (
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="h-12 w-12 text-white" />
                        </motion.div>
                      </motion.div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Received!</h2>
                      <p className="text-gray-600">Your payment has been received and is being confirmed in the blockchain.</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="text-lg font-semibold text-green-900 mb-2">Payment Confirmed</h4>
                          <div className="space-y-2 text-sm text-green-700">
                            <p>✅ Your payment has been successfully received</p>
                            <p>🔄 Waiting for blockchain confirmation</p>
                            <p>⏱️ This usually takes 1-5 minutes</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
                          <p className="mt-1 text-sm text-blue-700">
                            Your transaction is being processed on the blockchain. Once confirmed, 
                            you'll be automatically redirected to the success page.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {paymentData.status === 'PAID' && (
                  <div className="text-center space-y-6">
                    {/* Success Animation Background */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto"
                      >
                        <CheckCircle2 className="h-12 w-12 text-white" />
                      </motion.div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment initiation completed</h2>
                      <p className="text-gray-600">Thank you for using TRAPAY Payment services</p>
                    </div>

                    {paymentData.success_url ? (
                      <a
                        href={paymentData.success_url}
                        className="inline-flex items-center justify-center w-full bg-primary text-white py-4 px-6 rounded-xl font-medium hover:bg-primary-dark transition-colors"
                      >
                        Return to merchant
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center w-full bg-primary text-white py-4 px-6 rounded-xl font-medium hover:bg-primary-dark transition-colors"
                      >
                        Return to merchant
                      </button>
                    )}
                  </div>
                )}

                {/* Failed State */}
                {paymentData.status === 'FAILED' && (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Not Successful</h2>
                      <p className="text-gray-600 text-sm">
                        Please try again or contact the payment recipient.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-primary text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-dark transition-colors"
                      >
                        Try Again
                      </button>
                      {paymentData.fail_url && (
                        <a
                          href={paymentData.fail_url}
                          className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                          Go Back
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Expired State */}
                {paymentData.status === 'EXPIRED' && (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Expired</h2>
                      <p className="text-gray-600 text-sm">
                        This payment link has expired. Please create a new payment.
                      </p>
                    </div>
                    {paymentData.fail_url && (
                      <a
                        href={paymentData.fail_url}
                        className="inline-flex items-center justify-center w-full bg-gray-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                      >
                        Go Back
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span>Powered by</span>
                  <div className="flex items-center space-x-1">
                    <img src="/logo.png" alt="TRAPAY" className="h-5" />
                  </div>
                </div>
                <span>•</span>
                <a href="https://t.me/trapay_sales" className="hover:text-gray-700 transition-colors">Support</a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Payment;