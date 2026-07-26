'use client';

import { SessionProvider } from 'next-auth/react';
import { createContext, useContext, useState, useEffect } from 'react';
import ThemeBackground from './ThemeBackground';

// ==========================================
// 1. AUTH CONTEXT
// ==========================================
const AuthContext = createContext({ 
  user: null, 
  loading: true,
  login: () => {},
  signup: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Add your actual auth check logic here (e.g., fetching /api/auth/me)
    // For now, we just turn off the loading state
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Replace with your actual login API call
    console.log('Logging in with', email);
  };

  const signup = async (name, email, password) => {
    // Replace with your actual signup API call
    console.log('Signing up with', name, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // 🔥 Bulletproof fallback prevents "Cannot destructure" errors
  return context || { 
    user: null, 
    loading: false,
    login: () => console.warn('Login called without AuthProvider'),
    signup: () => console.warn('Signup called without AuthProvider')
  };
}

// ==========================================
// 2. THEME CONTEXT
// ==========================================
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // 🔥 Bulletproof fallback prevents "Cannot destructure" errors
  return context || { theme: 'light', toggleTheme: () => {} };
}

// ==========================================
// 3. COMBINED PROVIDERS
// ==========================================
export function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider>
          <ThemeBackground>
            {children}
          </ThemeBackground>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}