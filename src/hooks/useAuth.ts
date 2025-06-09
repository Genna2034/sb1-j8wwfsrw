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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Inizializzazione autenticazione...');
      
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
        await new Promise(resolve => setTimeout(resolve, 50));
        
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
        console.log('✅ Inizializzazione autenticazione completata');
      }
    };

    initializeAuth();
  }, []);

  const login = (user: User, token: string) => {
    console.log('🚀 Effettuando login per:', user.name);
    
    // Aggiorna lo stato in modo sincrono e immediato
    const newAuthState = {
      user,
      isAuthenticated: true,
      token
    };
    
    setAuthState(newAuthState);
    console.log('✅ Stato autenticazione aggiornato immediatamente');
    
    // Forza un re-render usando un callback per assicurarsi che il cambiamento sia applicato
    setAuthState(prevState => {
      console.log('🔄 Forzando aggiornamento stato auth');
      return newAuthState;
    });
  };

  const logout = () => {
    console.log('🚪 Iniziando processo di logout...');
    
    // Prima pulisci localStorage
    clearUserSession();
    
    // Poi aggiorna lo stato
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: null
    });
    
    console.log('✅ Logout completato');
    
    // Forza un refresh per assicurarsi che tutto sia pulito
    setTimeout(() => {
      console.log('🔄 Refresh della pagina...');
      window.location.reload();
    }, 100);
  };

  return {
    ...authState,
    login,
    logout,
    isLoading,
    isInitialized
  };
};