import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types/auth';
import { getCurrentUser, clearUserSession, isValidSession, saveUserSession } from '../utils/auth';

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Inizializzazione AuthContext...');
      
      try {
        // Assicurati che il DOM sia completamente caricato
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(undefined);
            } else {
              window.addEventListener('load', () => resolve(undefined), { once: true });
            }
          });
        }

        // Piccolo delay per assicurarsi che localStorage sia accessibile
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isValidSession()) {
          const user = getCurrentUser();
          const token = localStorage.getItem('emmanuel_token');
          
          if (user && token) {
            console.log('✅ Sessione valida trovata per:', user.name);
            setAuthState({
              user,
              isAuthenticated: true,
              token
            });
          } else {
            console.log('❌ Sessione non valida, pulizia...');
            clearUserSession();
            setAuthState({
              user: null,
              isAuthenticated: false,
              token: null
            });
          }
        } else {
          console.log('ℹ️ Nessuna sessione trovata');
          setAuthState({
            user: null,
            isAuthenticated: false,
            token: null
          });
        }
      } catch (error) {
        console.error('💥 Errore nell\'inizializzazione auth:', error);
        clearUserSession();
        setAuthState({
          user: null,
          isAuthenticated: false,
          token: null
        });
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log('✅ Inizializzazione AuthContext completata');
      }
    };

    initializeAuth();
  }, []);

  const login = (user: User, token: string) => {
    console.log('🚀 AuthContext: Effettuando login per:', user.name);
    
    // Salva immediatamente nel localStorage
    saveUserSession(user, token);
    
    // Aggiorna lo stato in modo sincrono
    const newAuthState = {
      user,
      isAuthenticated: true,
      token
    };
    
    setAuthState(newAuthState);
    console.log('✅ AuthContext: Stato autenticazione aggiornato');
  };

  const logout = () => {
    console.log('🚪 AuthContext: Iniziando processo di logout...');
    
    // Prima pulisci localStorage
    clearUserSession();
    
    // Poi aggiorna lo stato
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: null
    });
    
    console.log('✅ AuthContext: Logout completato');
    
    // Forza un refresh per assicurarsi che tutto sia pulito
    setTimeout(() => {
      console.log('🔄 Refresh della pagina...');
      window.location.reload();
    }, 100);
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    isLoading,
    isInitialized
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};