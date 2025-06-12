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

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

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
            // Validate that user.id is a valid UUID
            if (!isValidUUID(user.id)) {
              console.log('❌ User ID non è un UUID valido:', user.id, 'pulizia sessione...');
              clearUserSession();
              setAuthState({
                user: null,
                isAuthenticated: false,
                token: null
              });
            } else {
              console.log('✅ Sessione valida trovata per:', user.name);
              setAuthState({
                user,
                isAuthenticated: true,
                token
              });
            }
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
    
    // Listen for storage events from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'emmanuel_user' || event.key === 'emmanuel_token') {
        console.log('🔄 Storage change detected, refreshing auth state');
        if (isValidSession()) {
          const user = getCurrentUser();
          const token = localStorage.getItem('emmanuel_token');
          
          if (user && token) {
            setAuthState({
              user,
              isAuthenticated: true,
              token
            });
          } else {
            setAuthState({
              user: null,
              isAuthenticated: false,
              token: null
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            token: null
          });
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (user: User, token: string) => {
    console.log('🚀 AuthContext: Effettuando login per:', user.name);
    
    // Validate that user.id is a valid UUID before saving
    if (!isValidUUID(user.id)) {
      console.error('❌ Tentativo di login con user ID non UUID:', user.id);
      throw new Error('Invalid user ID format. Expected UUID.');
    }
    
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