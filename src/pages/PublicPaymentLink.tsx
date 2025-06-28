import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  CreditCard,
  Shield,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface PublicPaymentLinkData {
  id: string;
  shopId: string;
  amount: number | null;
  currency: string;
  sourceCurrency?: string;
  gateway: string;
  maxPayments: number;
  currentPayments: number;
  status: string;
  expiresAt?: string;
  successUrl?: string;
  failUrl?: string;
  country?: string;
  language?: string;
  linkUrl: string;
  createdAt: string;
  updatedAt: string;
  shop: {
    name: string;
    username: string;
  };
  payments: any[];
}

interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  result: {
    paymentId: string;
    paymentUrl: string;
  };
}

const PublicPaymentLink: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [linkData, setLinkData] = useState<PublicPaymentLinkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{name?: string; email?: string}>({});

  // Fetch payment link data
  useEffect(() => {
    const fetchLinkData = async () => {
      if (!id) {
        setError('Payment link ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<{ success: boolean; result: PublicPaymentLinkData }>(`/public/payment-links/${id}`);
        
        if (!response.success) {
          throw new Error('Payment link not found');
        }

        const data = response.result;
        console.log('🔍 Payment link data:', data); // Debug log
        
        // Check if link is active
        if (data.status !== 'ACTIVE') {
          setError('This payment link is no longer available');
          setIsLoading(false);
          return;
        }

        // ✅ FIXED: Правильная проверка лимитов - только если maxPayments больше 0
        if (data.maxPayments > 0 && data.currentPayments >= data.maxPayments) {
          setError('This payment link has reached its usage limit');
          setIsLoading(false);
          return;
        }

        // ✅ FIXED: Check if link has expired
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          setError('This payment link has expired');
          setIsLoading(false);
          return;
        }

        setLinkData(data);
      } catch (err: any) {
        console.error('Failed to fetch payment link:', err);
        setError('Payment link not found or no longer available');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkData();
  }, [id]);

  const validateForm = () => {
    const errors: {name?: string; email?: string} = {};
    
    if (!customerName.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!customerEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await api.post<PaymentInitiationResponse>(`/public/payment-links/${id}/pay`, {
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim()
      });

      if (response.success && response.result?.paymentUrl) {
        // Redirect to payment page
        window.location.href = response.result.paymentUrl;
      } else {
        throw new Error(response.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      toast.error(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
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

  // Error state (404)
  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-3">Payment Link Not Available</h1>
            <p className="text-gray-600 mb-8">{error || 'The payment link you are looking for does not exist or is no longer available.'}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-dark transition-colors"
            >
              Go Back
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
            {/* Payment Details Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              {/* Header with Amount */}
              <div className="px-6 py-6 bg-primary text-white text-center">
                <div className="mb-4">
                  <div className="text-sm opacity-90">Payment Amount</div>
                  <div className="text-3xl font-bold">
                    {linkData.amount === null ? 'Variable' : `${linkData.amount.toLocaleString()} ${linkData.currency}`}
                  </div>
                  {linkData.sourceCurrency && (
                    <div className="text-sm opacity-75 mt-1">via {linkData.sourceCurrency}</div>
                  )}
                </div>
              </div>

              {/* Customer Information Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="customerName"
                            value={customerName}
                            onChange={(e) => {
                              setCustomerName(e.target.value);
                              if (formErrors.name) {
                                setFormErrors(prev => ({ ...prev, name: undefined }));
                              }
                            }}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${
                              formErrors.name 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                            } focus:outline-none focus:ring-2`}
                            placeholder="Enter your full name"
                            disabled={isSubmitting}
                          />
                        </div>
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="customerEmail"
                            value={customerEmail}
                            onChange={(e) => {
                              setCustomerEmail(e.target.value);
                              if (formErrors.email) {
                                setFormErrors(prev => ({ ...prev, email: undefined }));
                              }
                            }}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${
                              formErrors.email 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                            } focus:outline-none focus:ring-2`}
                            placeholder="Enter your email address"
                            disabled={isSubmitting}
                          />
                        </div>
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-4 px-6 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Payment</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Secure Payment</h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Your payment information is encrypted and secure. We do not store your payment details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
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

export default PublicPaymentLink;