import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearStoredCampusUser,
  getStoredCampusUser,
  isSupportedCampusRole,
  persistCampusUser,
  resolveCampusCredentials
} from '../utils/campusAuth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ||
  'http://localhost:8089';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = getStoredCampusUser();

    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const resolvedCredentials = resolveCampusCredentials(username, password);
    const useDemoAccount = resolvedCredentials.success;
    const loginEmail = useDemoAccount
      ? resolvedCredentials.account.email
      : username.trim().toLowerCase();
    const loginPassword = useDemoAccount
      ? resolvedCredentials.account.backendPassword
      : password;

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();

      if (useDemoAccount && data.role !== resolvedCredentials.account.role) {
        clearStoredCampusUser();
        throw new Error('This campus account is linked to a different role.');
      }

      if (!isSupportedCampusRole(data.role)) {
        clearStoredCampusUser();
        throw new Error('This account role is not supported in the campus portal.');
      }

      const authenticatedUser = {
        token: data.token,
        role: data.role,
        name: data.name
      };

      persistCampusUser(authenticatedUser);
      setUser(authenticatedUser);
      return { success: true, role: data.role };
    } catch (error) {
      return {
        success: false,
        error:
          error.message === 'Login failed'
            ? useDemoAccount
              ? 'Unable to sign in with this campus account right now.'
              : 'Unable to sign in with this email and password.'
            : error.message
      };
    }
  };

  const logout = () => {
    clearStoredCampusUser();
    setUser(null);
    navigate('/', { replace: true });
  };

  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
