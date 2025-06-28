import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const merchantName = searchParams.get('merchant');
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            {/* Failed Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Failed Animation */}
              <div className="p-8 text-center">
                <div className="relative mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="relative w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto"
                  >
                    <XCircle className="h-12 w-12 text-white" />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Payment Failed
                  </h1>
                  <p className="text-gray-600">
                    Unfortunately, your payment could not be processed. Please try again or contact support.
                  </p>

                  {/* Payment Details */}
                  {(paymentId || amount || merchantName) && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      {paymentId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Order ID:</span>
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
                    </div>
                  )}

                  {/* Error Reason */}
                  {reason && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <h4 className="text-sm font-medium text-gray-900">Error Details</h4>
                          <p className="mt-1 text-sm text-gray-700">{reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Common Issues */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="text-left">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Common Issues:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Insufficient funds in your account</li>
                        <li>• Card expired or blocked</li>
                        <li>• Network connectivity issues</li>
                        <li>• Payment timeout</li>
                      </ul>
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

export default PaymentFailed;