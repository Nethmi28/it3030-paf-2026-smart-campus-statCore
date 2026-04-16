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

  const applyAuthenticatedUser = (authPayload) => {
    if (!authPayload?.token || !authPayload?.name || !isSupportedCampusRole(authPayload.role)) {
      clearStoredCampusUser();
      setUser(null);
      return {
        success: false,
        error: 'The sign-in response was incomplete.'
      };
    }

    const authenticatedUser = {
      token: authPayload.token,
      role: authPayload.role,
      name: authPayload.name
    };

    persistCampusUser(authenticatedUser);
    setUser(authenticatedUser);
    return { success: true, role: authPayload.role };
  };

  const readErrorMessage = async (response, fallbackMessage) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const payload = await response.json();
      return payload.message || payload.error || fallbackMessage;
    }

    const message = await response.text();
    return message || fallbackMessage;
  };

  const login = async (username, password) => {
    const resolvedCredentials = resolveCampusCredentials(username, password);
    const useDemoAccount = resolvedCredentials.success;
    const loginEmail = useDemoAccount
      ? resolvedCredentials.account.email
      : username.trim().toLowerCase();
    const loginPassword = useDemoAccount
      ? resolvedCredentials.account.password
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

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, 'Login failed');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (useDemoAccount && data.role !== resolvedCredentials.account.role) {
        clearStoredCampusUser();
        throw new Error('This campus account is linked to a different role.');
      }

      if (!isSupportedCampusRole(data.role)) {
        clearStoredCampusUser();
        throw new Error('This account role is not supported in the campus portal.');
      }

      return applyAuthenticatedUser(data);
    } catch (error) {
      return {
        success: false,
        error:
          error.message === 'Login failed' || error.message === 'Invalid email or password.'
            ? useDemoAccount
              ? 'Unable to sign in with this campus account right now.'
              : 'Unable to sign in with this email and password.'
            : error.message
      };
    }
  };

  const exchangeOAuthCode = async (code) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/oauth/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          'The Google sign-in session is invalid or has expired.'
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return applyAuthenticatedUser(data);
    } catch (error) {
      return {
        success: false,
        error: error.message || 'The Google sign-in session is invalid or has expired.'
      };
    }
  };

  const logout = () => {
    clearStoredCampusUser();
    setUser(null);
    navigate('/', { replace: true });
  };

  const completeOAuthLogin = ({ token, role, name }) => {
    return applyAuthenticatedUser({ token, role, name });
  };

  const value = { user, login, logout, loading, completeOAuthLogin, exchangeOAuthCode };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
