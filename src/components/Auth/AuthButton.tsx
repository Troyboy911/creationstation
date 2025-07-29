import { useState } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal } from './LoginModal';

export function AuthButton() {
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleAuthAction = async () => {
    if (user) {
      await logout();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleAuthAction}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 text-cyan-400 border border-cyan-600/30 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
        aria-label={user ? 'Sign out' : 'Sign in'}
        type="button"
      >
        {user ? (
          <>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In</span>
          </>
        )}
      </button>

      {user && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-600/30 rounded-lg">
          <User className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm hidden sm:inline">
            {user.email?.split('@')[0]}
          </span>
        </div>
      )}

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}
