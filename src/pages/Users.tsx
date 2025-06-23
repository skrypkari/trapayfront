import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  MoreHorizontal,
  User as UserIcon,
  Mail,
  Calendar,
  Globe,
  Shield,
  DollarSign,
  Settings,
  X,
  Percent,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import CustomSelect from '../components/CustomSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  useGetUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser,
  useSuspendUser,
  useActivateUser,
  validateUserData,
  type User,
  type AddUserFormData,
  type EditUserFormData,
  type GatewaySettings,
  type UserFilters
} from '../hooks/useUsers';
import { 
  getAllGatewayIds, 
  getGatewayInfo, 
  convertGatewayIdsToNames,
  convertGatewayNamesToIds,
  GATEWAY_INFO 
} from '../utils/gatewayMapping';

const AddUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<AddUserFormData>({
    brandName: '',
    username: '',
    password: '',
    telegramId: '',
    merchantUrl: '',
    gateways: [],
    gatewaySettings: {}
  });

  const createUserMutation = useCreateUser();

  // Get all available gateway IDs
  const availableGateways = getAllGatewayIds().map(gatewayId => {
    const gatewayInfo = getGatewayInfo(gatewayId);
    return {
      value: gatewayId,
      label: gatewayInfo ? gatewayInfo.name : `Gateway ${gatewayId}`, // Show real gateway name
      displayName: gatewayInfo ? gatewayInfo.displayName : `Gateway ${gatewayId}`, // For display
      icon: <div className={`w-4 h-4 rounded ${gatewayInfo?.color || 'bg-gray-400'}`} />
    };
  });

  const handleGatewayChange = (gatewayId: string, enabled: boolean) => {
    setFormData(prev => {
      const newGateways = enabled 
        ? [...prev.gateways, gatewayId]
        : prev.gateways.filter(g => g !== gatewayId);
      
      const newGatewaySettings = { ...prev.gatewaySettings };
      
      if (enabled) {
        // Add default settings for new gateway
        newGatewaySettings[gatewayId] = {
          commission: 2.5, // Default commission
          payoutDelay: 7 // Default payout delay
        };
      } else {
        // Remove settings for disabled gateway
        delete newGatewaySettings[gatewayId];
      }

      return {
        ...prev,
        gateways: newGateways,
        gatewaySettings: newGatewaySettings
      };
    });
  };

  const handleGatewaySettingChange = (gatewayId: string, field: 'commission' | 'payoutDelay', value: number) => {
    setFormData(prev => ({
      ...prev,
      gatewaySettings: {
        ...prev.gatewaySettings,
        [gatewayId]: {
          ...prev.gatewaySettings[gatewayId],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createUserMutation.mutateAsync(formData);
      toast.success('User created successfully!');
      onClose();
      
      // Reset form
      setFormData({
        brandName: '',
        username: '',
        password: '',
        telegramId: '',
        merchantUrl: '',
        gateways: [],
        gatewaySettings: {}
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
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
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Nike, Apple, etc."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="nike_store"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telegram ID
                    </label>
                    <input
                      type="text"
                      value={formData.telegramId}
                      onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="@username or ID"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant URL *
                    </label>
                    <input
                      type="url"
                      value={formData.merchantUrl}
                      onChange={(e) => setFormData({ ...formData, merchantUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="https://nike.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateways */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Payment Gateways & Settings
                </h4>
                
                <div className="space-y-4">
                  {availableGateways.map((gateway) => {
                    const isSelected = formData.gateways.includes(gateway.value);
                    const gatewaySettings = formData.gatewaySettings[gateway.value];
                    
                    return (
                      <div key={gateway.value} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {gateway.icon}
                            <div>
                              <span className="font-medium text-gray-900">{gateway.label}</span>
                              <div className="text-sm text-gray-500">{gateway.displayName}</div>
                            </div>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleGatewayChange(gateway.value, e.target.checked)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                          </label>
                        </div>

                        {isSelected && gatewaySettings && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commission (%)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={gatewaySettings.commission}
                                  onChange={(e) => handleGatewaySettingChange(gateway.value, 'commission', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payout Delay (days)
                              </label>
                              <input
                                type="number"
                                value={gatewaySettings.payoutDelay}
                                onChange={(e) => handleGatewaySettingChange(gateway.value, 'payoutDelay', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                min="0"
                                max="365"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                  disabled={createUserMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending || formData.gateways.length === 0}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {createUserMutation.isPending && <LoadingSpinner size="sm" />}
                  <span>{createUserMutation.isPending ? 'Creating...' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EditUserModal: React.FC<{
  user: User;
  isOpen: boolean;
  onClose: () => void;
}> = ({ user, isOpen, onClose }) => {
  const [formData, setFormData] = useState<EditUserFormData>({
    name: user.name,
    username: user.username,
    password: '',
    telegram: user.telegram,
    merchantUrl: user.shopUrl,
    paymentGateways: user.paymentGateways,
    status: user.status,
    gatewaySettings: user.gatewaySettings || {}
  });

  const [errors, setErrors] = useState<string[]>([]);
  const updateUserMutation = useUpdateUser();

  // Get all available gateway IDs
  const availableGateways = getAllGatewayIds().map(gatewayId => {
    const gatewayInfo = getGatewayInfo(gatewayId);
    return {
      value: gatewayId,
      label: gatewayInfo ? gatewayInfo.name : `Gateway ${gatewayId}`, // Show real gateway name
      displayName: gatewayInfo ? gatewayInfo.displayName : `Gateway ${gatewayId}`, // For display
      icon: <div className={`w-4 h-4 rounded ${gatewayInfo?.color || 'bg-gray-400'}`} />
    };
  });

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    { value: 'INACTIVE', label: 'Inactive', icon: <Clock className="h-4 w-4 text-yellow-600" /> },
    { value: 'SUSPENDED', label: 'Suspended', icon: <XCircle className="h-4 w-4 text-red-600" /> }
  ];

  const handleGatewayChange = (gatewayId: string, enabled: boolean) => {
    setFormData(prev => {
      const newGateways = enabled 
        ? [...prev.paymentGateways, gatewayId]
        : prev.paymentGateways.filter(g => g !== gatewayId);
      
      const newGatewaySettings = { ...prev.gatewaySettings };
      
      if (enabled) {
        // Add default settings for new gateway
        newGatewaySettings[gatewayId] = {
          commission: 2.5, // Default commission
          payoutDelay: 7 // Default payout delay
        };
      } else {
        // Remove settings for disabled gateway
        delete newGatewaySettings[gatewayId];
      }

      return {
        ...prev,
        paymentGateways: newGateways,
        gatewaySettings: newGatewaySettings
      };
    });
  };

  const handleGatewaySettingChange = (gatewayId: string, field: 'commission' | 'payoutDelay', value: number) => {
    setFormData(prev => ({
      ...prev,
      gatewaySettings: {
        ...prev.gatewaySettings,
        [gatewayId]: {
          ...prev.gatewaySettings[gatewayId],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateUserData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors.map(e => e.message));
      return;
    }

    try {
      await updateUserMutation.mutateAsync({ id: user.id, data: formData });
      toast.success('User updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
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
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password (leave empty to keep current)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telegram ID
                    </label>
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="@username or ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <CustomSelect
                      value={formData.status}
                      onChange={(value) => setFormData({ ...formData, status: value as any })}
                      options={statusOptions}
                      placeholder="Select status"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant URL *
                    </label>
                    <input
                      type="url"
                      value={formData.merchantUrl}
                      onChange={(e) => setFormData({ ...formData, merchantUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateways */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Payment Gateways & Settings
                </h4>
                
                <div className="space-y-4">
                  {availableGateways.map((gateway) => {
                    const isSelected = formData.paymentGateways.includes(gateway.value);
                    const gatewaySettings = formData.gatewaySettings[gateway.value];
                    
                    return (
                      <div key={gateway.value} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {gateway.icon}
                            <div>
                              <span className="font-medium text-gray-900">{gateway.label}</span>
                              <div className="text-sm text-gray-500">{gateway.displayName}</div>
                            </div>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleGatewayChange(gateway.value, e.target.checked)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                          </label>
                        </div>

                        {isSelected && gatewaySettings && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commission (%)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={gatewaySettings.commission}
                                  onChange={(e) => handleGatewaySettingChange(gateway.value, 'commission', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payout Delay (days)
                              </label>
                              <input
                                type="number"
                                value={gatewaySettings.payoutDelay}
                                onChange={(e) => handleGatewaySettingChange(gateway.value, 'payoutDelay', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                min="0"
                                max="365"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                  disabled={updateUserMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending || formData.paymentGateways.length === 0}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {updateUserMutation.isPending && <LoadingSpinner size="sm" />}
                  <span>{updateUserMutation.isPending ? 'Updating...' : 'Update User'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const UserDetailsModal: React.FC<{
  user: User;
  onClose: () => void;
}> = ({ user, onClose }) => {
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
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh] "
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                <div className="mt-1">
                  {user.status === 'ACTIVE' && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  )}
                  {user.status === 'SUSPENDED' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg w-fit">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Suspended</span>
                    </div>
                  )}
                  {user.status === 'PENDING' && (
                    <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg w-fit">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Telegram</div>
                <div className="text-sm text-gray-900">{user.telegram || 'Not set'}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Created At</div>
                <div className="text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Shop URL</div>
                <div className="text-sm text-gray-900 break-all">{user.shopUrl}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Public Key</div>
                <div className="text-sm text-gray-900 font-mono break-all">{user.publicKey}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-sm font-medium text-gray-500 mb-3">Payment Gateways</div>
            <div className="flex flex-wrap gap-2">
              {user.paymentGateways.map((gatewayId) => {
                const gatewayInfo = getGatewayInfo(gatewayId);
                return (
                  <div
                    key={gatewayId}
                    className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium text-white ${
                      gatewayInfo?.color || 'bg-gray-500'
                    }`}
                  >
                    <span>{gatewayInfo ? gatewayInfo.name : `Gateway ${gatewayId}`}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {user.gatewaySettings && Object.keys(user.gatewaySettings).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-medium text-gray-500 mb-3">Gateway-Specific Settings</div>
              <div className="space-y-3">
                {Object.entries(user.gatewaySettings).map(([gatewayId, settings]) => {
                  const gatewayInfo = getGatewayInfo(gatewayId);
                  return (
                    <div key={gatewayId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="font-medium text-gray-900">
                        {gatewayInfo ? gatewayInfo.name : `Gateway ${gatewayId}`}
                      </span>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Commission: {settings.commission}%</span>
                        <span>Delay: {settings.payoutDelay} days</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Build filters for API
  const filters: UserFilters = {
    page: currentPage,
    limit: pageSize,
    status: statusFilter !== 'all' ? statusFilter as any : undefined
  };

  const { data: usersData, isLoading, error } = useGetUsers(filters);
  const deleteUserMutation = useDeleteUser();
  const suspendUserMutation = useSuspendUser();
  const activateUserMutation = useActivateUser();

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    { value: 'SUSPENDED', label: 'Suspended', icon: <XCircle className="h-4 w-4 text-red-600" /> },
    { value: 'PENDING', label: 'Pending', icon: <Clock className="h-4 w-4 text-yellow-600" /> }
  ];

  const pageSizeOptions = [
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' }
  ];

  // Filter users by search term (client-side filtering for loaded data)
  const filteredUsers = usersData?.users?.filter(user => {
    if (!searchTerm) return true;
    
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.shopUrl.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUserMutation.mutateAsync(id);
        toast.success('User deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  const handleSuspendUser = async (id: string) => {
    try {
      await suspendUserMutation.mutateAsync(id);
      toast.success('User suspended successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend user');
    }
  };

  const handleActivateUser = async (id: string) => {
    try {
      await activateUserMutation.mutateAsync(id);
      toast.success('User activated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate user');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">
          <AlertTriangle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-600">Failed to load users. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
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
                  placeholder="Search users..."
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
                value={pageSize.toString()}
                onChange={handlePageSizeChange}
                options={pageSizeOptions}
                placeholder="Page size"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Shop URL</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Gateways</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Created</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900 truncate max-w-[200px]" title={user.shopUrl}>
                          {user.shopUrl}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.paymentGateways.slice(0, 2).map((gatewayId) => {
                            const gatewayInfo = getGatewayInfo(gatewayId);
                            return (
                              <span
                                key={gatewayId}
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${
                                  gatewayInfo?.color || 'bg-gray-500'
                                }`}
                                title={gatewayInfo ? gatewayInfo.displayName : `Gateway ${gatewayId}`}
                              >
                                {gatewayInfo ? gatewayInfo.name : `Gateway ${gatewayId}`}
                              </span>
                            );
                          })}
                          {user.paymentGateways.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              +{user.paymentGateways.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${
                          user.status === 'ACTIVE' ? 'bg-green-50 text-green-600' :
                          user.status === 'SUSPENDED' ? 'bg-red-50 text-red-600' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {user.status === 'ACTIVE' && <CheckCircle2 className="h-4 w-4" />}
                          {user.status === 'SUSPENDED' && <XCircle className="h-4 w-4" />}
                          {user.status === 'PENDING' && <Clock className="h-4 w-4" />}
                          <span className="text-sm font-medium capitalize">{user.status.toLowerCase()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              {user.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleSuspendUser(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center space-x-2"
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span>Suspend</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateUser(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Activate</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {usersData?.pagination && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((usersData.pagination.page - 1) * usersData.pagination.limit) + 1} to{' '}
                  {Math.min(usersData.pagination.page * usersData.pagination.limit, usersData.pagination.total)} of{' '}
                  {usersData.pagination.total} users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {/* Show page numbers */}
                    {Array.from({ length: Math.min(5, usersData.pagination.totalPages) }, (_, i) => {
                      const pageNumber = i + 1;
                      const isCurrentPage = pageNumber === currentPage;
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            isCurrentPage
                              ? 'bg-primary text-white'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    {usersData.pagination.totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <button
                          onClick={() => handlePageChange(usersData.pagination.totalPages)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentPage === usersData.pagination.totalPages
                              ? 'bg-primary text-white'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {usersData.pagination.totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(usersData.pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === usersData.pagination.totalPages}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddUserModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          />
        )}
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;