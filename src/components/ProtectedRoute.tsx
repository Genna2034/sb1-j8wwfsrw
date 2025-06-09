import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = [], 
  fallback 
}) => {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();

  // Mostra loading durante l'inizializzazione
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica autorizzazioni...</p>
        </div>
      </div>
    );
  }

  // Se non autenticato, mostra fallback o messaggio di errore
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accesso Negato</h2>
          <p className="text-gray-600">Devi effettuare il login per accedere a questa pagina.</p>
        </div>
      </div>
    );
  }

  // Verifica ruolo se specificato
  if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accesso Negato</h2>
          <p className="text-gray-600">Non hai i permessi necessari per accedere a questa pagina.</p>
          <p className="text-sm text-gray-500 mt-2">Ruolo richiesto: {requiredRole.join(', ')}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};