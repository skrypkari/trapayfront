import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, LogOut, User } from 'lucide-react';
import { useLogout } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const location = useLocation();
  const logout = useLogout();
  const navigate = useNavigate();


  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  const isAdmin = location.pathname.startsWith('/admin');

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-blue-600">
              <CreditCard className="h-6 w-6 mr-2" />
              <span className="font-semibold text-lg">PaySystem</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {isAdmin ? (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
            )}

            <div className="border-l border-gray-200 h-6 mx-2"></div>

            <button className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              <User className="h-4 w-4 mr-1" />
              <span>Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;