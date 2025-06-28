import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Clock, Headphones, Shield } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { useLogin } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const loginMutation = useLogin();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const login = await loginMutation.mutateAsync({ username, password });
      navigate(login.result.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (error) {
      toast.error('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="min-h-screen flex">
      <motion.div 
        className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md w-full mx-auto space-y-8 relative">
          <div className="absolute -top-[calc(100%-4rem)] left-1/2 -translate-x-1/2 w-full">
            <Toaster 
              position="top-center"
              expand={true}
              richColors
            />
          </div>
          
          <motion.div 
            className="space-y-2"
            {...fadeIn}
          >
            <h1 className="text-3xl font-bold text-gray-900">Welcome to TRAPAY</h1>
            <p className="text-gray-600">Please enter your details to sign in</p>
          </motion.div>
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeIn}>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  className="block outline-none w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 transition-all duration-200"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full outline-none pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 transition-all duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="w-full py-2.5 px-4 text-white bg-primary hover:bg-primary-dark rounded-lg transition-all duration-200 relative overflow-hidden disabled:opacity-70"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div 
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                'Log in'
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>

      <div className="hidden lg:block lg:w-[500px] ml-auto bg-[#0A0A0A] text-white relative overflow-hidden">
        <div className="relative h-full w-full flex flex-col justify-between p-6">
          <div className="space-y-12">
            <div>
              <div className="flex items-center mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-3">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Quick setup</h3>
              </div>
              <p className="text-gray-400">Choose developer-friendly APIs or pre-built plugins</p>
            </div>

            <div>
              <div className="flex items-center mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-3">
                  <Headphones className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">24/7 Expert support</h3>
              </div>
              <p className="text-gray-400">Dedicated manager & professional onboarding assistance</p>
            </div>

            <div>
              <div className="flex items-center mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-3">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Secure & reliable payments</h3>
              </div>
              <p className="text-gray-400">Bank-level data encryption, PCI DSS, GDPR compliance</p>
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            <div className="flex items-center space-x-2 my-4">
              <img src="/logo.webp" alt="TRAPAY" className="h-8" />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <a href="https://trapay.uk/legal-privacy.php#Privacy-Policy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
              <span>•</span>
              <a href="https://trapay.uk/legal-privacy.php#Terms-of-Use" className="hover:text-white transition-colors duration-200">Terms of Use</a>
            </div>
            <p className="text-sm text-gray-400">© 2025 TRAPAY. All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;