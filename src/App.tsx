import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import UserDashboard from './components/UserDashboard';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'login'>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'home') {
      return <HomePage onLoginClick={() => setCurrentPage('login')} />;
    }
    return <LoginPage />;
  }

  if (user.is_admin) {
    return <AdminPanel />;
  }

  return <UserDashboard />;
}

export default App;
