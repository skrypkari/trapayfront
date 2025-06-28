import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface PaymentStatusResponse {
  success: boolean;
  result: {
    id: string;
    gateway: string;
    amount: number;
    currency: string;
    source_currency?: string;
    status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'EXPIRED';
    payment_url: string;
    external_payment_url?: string;
    success_url?: string;
    fail_url?: string;
    customer_email?: string;
    customer_name?: string;
    invoice_total_sum?: number;
    qr_code?: string;
    qr_url?: string;
    order_id?: string;
    gateway_order_id?: string;
    merchant_brand?: string;
    country?: string;
    language?: string;
    amount_is_editable?: boolean;
    max_payments?: number;
    rapyd_customer?: string;
    card_last4?: string;
    payment_method?: string;
    bank_id?: string;
    remitter_iban?: string;
    remitter_name?: string;
    created_at: string;
    updated_at: string;
    expires_at?: string;
  };
}

const PaymentPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const paymentId = searchParams.get('payment_id');
  const internalId = searchParams.get('id')
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const merchantName = searchParams.get('merchant');

  const [paymentData, setPaymentData] = useState<PaymentStatusResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Function to check payment status
  const checkPaymentStatus = async (id: string) => {
    try {
      console.log('🔍 Checking payment status for ID:', id);
      const response = await api.get<PaymentStatusResponse>(`/payments/${id}/status`);
      
      if (response.success && response.result) {
        console.log('✅ Payment status response:', response.result);
        setPaymentData(response.result);
        
        // If payment is completed, redirect to success page
        if (response.result.status === 'PAID') {
          console.log('🎉 Payment completed, redirecting to success page');
          // Use the success_url from the response or fallback to our success page
          const successUrl = 'https://app.trapay.uk/payment/success';
          window.location.href = successUrl;
          return;
        }
        
        // If payment failed, redirect to fail page
        if (response.result.status === 'FAILED') {
          console.log('❌ Payment failed, redirecting to fail page');
          const failUrl = 'https://app.trapay.uk/payment/failed';
          window.location.href = failUrl;
          return;
        }
        
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('❌ Failed to check payment status:', err);
      setError(err.message || 'Failed to check payment status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!internalId) {
      setIsLoading(false);
      return;
    }

    checkPaymentStatus(internalId);

    const pollInterval = setInterval(() => {
      setPollCount(prev => prev + 1);
      checkPaymentStatus(internalId);
    }, 60000); // 60 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(pollInterval);
    };
  }, [internalId]);

  // Loading state
  if (isLoading && !paymentData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking payment status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-3">Unable to Check Payment Status</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        </div>
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
            {/* Pending Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Pending Animation */}
              <div className="p-8 text-center">
                <div className="relative mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Payment Transferred Successfully
                  </h1>
                  <p className="text-gray-600">
                    Your payment has been transferred but we're waiting for successful completion. 
                    Some payments may take 3-5 business days to process.
                  </p>

                  {/* Payment Details */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {paymentData && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Payment ID:</span>
                          <span className="font-mono text-gray-900">{paymentData.gateway_order_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-semibold text-gray-900">
                            {paymentData.amount} {paymentData.currency}
                          </span>
                        </div>
                        {paymentData.merchant_brand && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Merchant:</span>
                            <span className="text-gray-900">{paymentData.merchant_brand}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status:</span>
                          <span className="font-medium text-blue-600 capitalize">
                            {paymentData.status.toLowerCase()}
                          </span>
                        </div>
                        {paymentData.payment_method && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment Method:</span>
                            <span className="text-gray-900 capitalize">
                              {paymentData.payment_method.replace('-', ' ')}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {/* Fallback to URL params if no API data */}
                    {!paymentData && (paymentId || amount || merchantName) && (
                      <>
                        {paymentId && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment ID:</span>
                            <span className="font-mono text-gray-900">{paymentId}</span>
                          </div>
                        )}
                        {amount && currency && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount:</span>
                            <span className="font-semibold text-gray-900">{amount} {currency}</span>
                          </div>
                        )}
                        {merchantName && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Merchant:</span>
                            <span className="text-gray-900">{merchantName}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Processing Info */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-green-900">Payment Successfully Transferred</h4>
                        <p className="mt-1 text-sm text-green-700">
                          Your payment has been successfully transferred and is being processed by the payment provider.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-blue-900">Processing Timeline</h4>
                        <div className="mt-2 text-sm text-blue-700 space-y-1">
                          <p>• Bank transfers: 3-5 business days</p>
                          <p>• Card payments: Usually instant to 24 hours</p>
                          <p>• Crypto payments: 10-60 minutes</p>
                          <p>• Processing occurs on business days only</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Checking Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-gray-900">Automatic Status Updates</h4>
                        <p className="mt-1 text-sm text-gray-700">
                          We're checking your payment status every minute. You'll be automatically redirected when the payment is completed.
                        </p>
                        {pollCount > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Last checked: {pollCount} minute{pollCount !== 1 ? 's' : ''} ago
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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

export default PaymentPending;