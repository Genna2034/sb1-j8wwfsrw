import { useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth';
import { getCurrentUser, clearUserSession, isValidSession } from '../utils/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (isValidSession()) {
          const user = getCurrentUser();
          const token = localStorage.getItem('emmanuel_token');
          
          if (user && token) {
            console.log('Sessione valida trovata per:', user.name);
            setAuthState({
              user,
              isAuthenticated: true,
              token
            });
          } else {
            console.log('Sessione non valida, pulizia...');
            clearUserSession();
          }
        } else {
          console.log('Nessuna sessione valida trovata');
        }
      } catch (error) {
        console.error('Errore nell\'inizializzazione auth:', error);
        clearUserSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (user: User, token: string) => {
    console.log('Effettuando login per:', user.name);
    setAuthState({
      user,
      isAuthenticated: true,
      token
    });
  };

  const logout = () => {
    console.log('Effettuando logout...');
    clearUserSession();
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: null
    });
  };

  return {
    ...authState,
    login,
    logout,
    isLoading
  };
};