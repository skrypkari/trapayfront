import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Code,
  ArrowLeft,
  Receipt, 
  Settings,
  Link as LinkIcon,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  CreditCard
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdminAuth } from '../hooks/useAdmin';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const isAdmin = location.pathname.startsWith('/admin');
  
  // Only check admin auth if we're on admin routes
  const { isLoading: adminLoading, isAuthenticated: isAdminAuthenticated, adminUser } = isAdmin ? useAdminAuth() : { isLoading: false, isAuthenticated: false, adminUser: null };
  
  // If we're on admin routes and still loading auth, don't render anything
  if (isAdmin && adminLoading) {
    return null; // Return nothing while checking admin auth
  }
  
  const adminSidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: ArrowLeft, label: 'Payouts', path: '/admin/payouts' }
  ];

  const userSidebarItems = [
    { icon: User, label: 'My account', path: '/dashboard/account' },
    { icon: Code, label: 'Integration', path: '/dashboard/integration' },
    { icon: Receipt, label: 'Transactions', path: '/dashboard/transactions' },
    { icon: ArrowLeft, label: 'Payouts', path: '/dashboard/payouts' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    { icon: LinkIcon, label: 'Payment links', path: '/dashboard/payment-links' },
  ];

  const sidebarItems = isAdmin ? adminSidebarItems : userSidebarItems;
  
  const isActive = (path: string) => location.pathname === path;

  if (location.pathname === '/login') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] text-white border-b border-gray-800">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center">
            <img src="/logo.webp" alt="Logo" className="h-8" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-800"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar / Mobile Menu */}
      <motion.aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0A0A0A] text-white z-50 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        initial={false}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="mt-8 px-4 hidden lg:block border-b border-gray-800 pb-6">
              <img src="/logo.webp" alt="Logo" className="h-8" />
            </div>

            {/* Mobile User Info */}
            <div className="lg:hidden px-4 py-4 border-b border-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {isAdmin && adminUser ? adminUser.username : 'User'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isAdmin && adminUser ? adminUser.email : 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>

            <nav className="mt-8 flex-1 px-2 space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="px-4 py-4 border-t border-gray-800">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center text-gray-300 hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gray-100 min-h-screen pt-16 lg:pt-0 lg:pl-64">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;