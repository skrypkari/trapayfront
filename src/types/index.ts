// Common interfaces and types used throughout the application

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'client';
  email: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'bank';
  last4: string;
  expiryDate?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  status: 'active' | 'pending' | 'suspended';
  balance: number;
  joinDate: Date;
  lastActive: Date;
  telegramId?: string;
  merchantUrl?: string;
  commission: number;
  payoutDelay: number;
  gateways: string[];
  apiKey?: {
    key: string;
    enabled: boolean;
    lastUsed?: Date;
  };
}


export interface AddUserFormData {
  fullName: string;
  username: string;
  password: string;
  telegramId?: string;
  merchantUrl?: string;
  commission: number;
  payoutDelay: number;
  gateways: string[];
}