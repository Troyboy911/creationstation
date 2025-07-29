import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.warn('Failed to parse saved user:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    const mockUser = { uid: '1', email, displayName: email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('auth-user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('auth-user');
  };

  const register = async (email: string, password: string) => {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    const mockUser = { uid: Date.now().toString(), email, displayName: email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('auth-user', JSON.stringify(mockUser));
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
