import React, { useState, useEffect } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authenticateUser, generateToken } from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';
import { initializeDefaultUsers } from '../utils/userManagement';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isInitialized } = useAuth();

  useEffect(() => {
    console.log('🔄 Inizializzazione LoginForm...');
    initializeDefaultUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Previeni submit multipli
    if (loading) {
      console.log('⏳ Login già in corso, ignoro richiesta duplicata');
      return;
    }

    // Assicurati che l'autenticazione sia inizializzata
    if (!isInitialized) {
      console.log('⏳ Sistema non ancora inizializzato, attendo...');
      setError('Sistema in inizializzazione, riprova tra un momento...');
      return;
    }

    setLoading(true);
    setError('');

    console.log('🚀 Inizio processo di login...');

    try {
      console.log('🔍 Autenticazione utente...');
      const user = authenticateUser(username, password);
      
      if (user) {
        console.log('✅ Utente autenticato:', user.name);
        
        const token = generateToken();
        console.log('🔑 Token generato');
        
        console.log('✅ Chiamando login del context...');
        
        // Il login del context gestisce tutto: salvataggio e aggiornamento stato
        login(user, token);
        
        console.log('✅ Login completato con successo');
        
      } else {
        setError('Username o password non corretti. Contatta l\'amministratore per le credenziali.');
        console.log('❌ Login fallito - credenziali non valide');
      }
    } catch (err) {
      console.error('💥 Errore durante il login:', err);
      setError('Errore durante il login. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto w-32 h-32 mb-6 flex items-center justify-center bg-white rounded-2xl shadow-lg p-4">
            <img 
              src="/Screenshot 2025-06-09 alle 14.11.10.png" 
              alt="Cooperativa Emmanuel Logo" 
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                mixBlendMode: 'multiply'
              }}
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Cooperativa Emmanuel</h2>
          <p className="mt-2 text-gray-600">Area Riservata</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Inserisci username"
                required
                disabled={loading || !isInitialized}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Inserisci password"
                  required
                  disabled={loading || !isInitialized}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-sky-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isInitialized}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Accedi
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-800 mb-1">Hai bisogno di aiuto?</p>
            <p className="text-xs text-blue-600">
              Contatta l'amministratore per ricevere le tue credenziali di accesso
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className={`border rounded-xl p-4 transition-all ${
          isInitialized 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full animate-pulse mr-3 ${
              isInitialized ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <div>
              <p className={`text-sm font-medium ${
                isInitialized ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {isInitialized ? 'Sistema Operativo' : 'Inizializzazione Sistema'}
              </p>
              <p className={`text-xs ${
                isInitialized ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {isInitialized ? 'Tutti i servizi sono attivi' : 'Caricamento in corso...'}
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info - Solo in sviluppo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-800 mb-2">Credenziali di Test</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Admin:</strong> admin.emmanuel / Emmanuel2024!</p>
                <p><strong>Coordinatore:</strong> gennaro.borriello / Coord2024!</p>
                <p><strong>Staff:</strong> infermiere.01 / Staff2024!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};