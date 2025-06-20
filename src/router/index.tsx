import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import Layout from '../components/Layout';
import AdminAuthGuard from '../components/AdminAuthGuard';

// Pages
import Login from '../pages/Login';
import Payment from '../pages/Payment';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentPending from '../pages/PaymentPending';
import PaymentFailed from '../pages/PaymentFailed';
import PublicPaymentLink from '../pages/PublicPaymentLink';
import Admin from '../pages/Admin';
import Users from '../pages/Users';
import Integration from '../pages/Integration';
import Account from '../pages/Account';
import Transactions from '../pages/Transactions';
import Payouts from '../pages/Payouts';
import Settings from '../pages/Settings';
import PaymentLinks from '../pages/PaymentLinks';
import AdminPayments from '../pages/AdminPayments';
import AdminPayouts from '../pages/AdminPayouts';

// Define routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/account" replace />,
      },
      {
        path: 'dashboard',
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/account" replace />,
          },
          {
            path: 'account',
            element: <Account />,
          },
          {
            path: 'integration',
            element: <Integration />,
          },
          {
            path: 'transactions',
            element: <Transactions />,
          },
          {
            path: 'payouts',
            element: <Payouts />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
          {
            path: 'payment-links',
            element: <PaymentLinks />,
          },
          {
            path: '*',
            element: <Navigate to="/dashboard/account" replace />,
          }
        ],
      },
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <AdminAuthGuard>
                <Admin />
              </AdminAuthGuard>
            ),
          },
          {
            path: 'users',
            element: (
              <AdminAuthGuard>
                <Users />
              </AdminAuthGuard>
            ),
          },
          {
            path: 'payments',
            element: (
              <AdminAuthGuard>
                <AdminPayments />
              </AdminAuthGuard>
            ),
          },
          {
            path: 'payouts',
            element: (
              <AdminAuthGuard>
                <AdminPayouts />
              </AdminAuthGuard>
            ),
          },
          {
            path: '*',
            element: <Navigate to="/admin/dashboard" replace />,
          }
        ],
      },
      {
        path: '*',
        element: <Navigate to="/dashboard/account" replace />,
      }
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/payment/:id',
    element: <Payment />,
  },
  {
    path: '/payment/success',
    element: <PaymentSuccess />,
  },
  {
    path: '/payment/pending',
    element: <PaymentPending />,
  },
  {
    path: '/payment/failed',
    element: <PaymentFailed />,
  },
  {
    path: '/link/:id',
    element: <PublicPaymentLink />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  }
]);

export default router;