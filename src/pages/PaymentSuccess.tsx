import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const merchantName = searchParams.get('merchant');
  const transactionId = searchParams.get('transaction_id');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            {/* Success Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Success Animation */}
              <div className="p-8 text-center">
                <div className="relative mb-6">
                  {/* Background glow effect */}
                  <div className="absolute inset-0 bg-primary rounded-full opacity-20 blur-3xl scale-150"></div>
                  
                  {/* Success icon with animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      duration: 0.8,
                      delay: 0.2
                    }}
                    className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg"
                  >
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </motion.div>

                  {/* Floating particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        y: [0, -50, -100],
                        x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)]
                      }}
                      transition={{
                        duration: 2,
                        delay: 0.5 + i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                      className="absolute w-2 h-2 bg-primary rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Payment Successful!
                  </h1>
                  <p className="text-gray-600">
                    Your payment has been processed successfully. Thank you for your purchase!
                  </p>

                  {/* Payment Details */}
                  {(paymentId || amount || merchantName) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200"
                    >
                      {paymentId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Order ID:</span>
                          <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded text-xs">
                            {paymentId}
                          </span>
                        </div>
                      )}
                      {transactionId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded text-xs">
                            {transactionId}
                          </span>
                        </div>
                      )}
                      {amount && currency && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="text-xl font-bold text-primary">
                            {amount} {currency}
                          </span>
                        </div>
                      )}
                      {merchantName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Merchant:</span>
                          <span className="font-medium text-gray-900">{merchantName}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-900">
                          {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-gray-900">Payment Confirmed</h4>
                        <p className="mt-1 text-sm text-gray-700">
                          Your payment has been successfully processed and confirmed. 
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 text-center"
            >
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;