import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { loginAsync, logoutAsync, registerAsync, clearError } from '@/store/slices/authSlice';
import { LoginRequest, RegisterRequest } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, token } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const result = await dispatch(loginAsync(credentials));
      if (loginAsync.fulfilled.match(result)) {
        navigate('/dashboard', { replace: true });
      }
      return result;
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const result = await dispatch(registerAsync(payload));
      if (registerAsync.fulfilled.match(result)) {
        navigate('/dashboard', { replace: true });
      }
      return result;
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutAsync());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    token,
    login,
    register,
    logout,
    clearAuthError,
    isAdmin: user?.role === 'ADMIN',
    isOperator: user?.role === 'OPERATOR',
  };
};
