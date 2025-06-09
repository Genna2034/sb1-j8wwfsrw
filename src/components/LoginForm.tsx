import React, { useState, useEffect } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle, Info, RefreshCw, Shield } from 'lucide-react';
import { authenticateUser, saveUserSession, generateToken } from '../utils/auth';
import { useAuth } from '../hooks/useAuth';
import { initializeDefaultUsers } from '../utils/userManagement';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    console.log('🔄 Inizializzazione LoginForm...');
    initializeDefaultUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🚀 Inizio processo di login...');

    try {
      const user = authenticateUser(username, password);
      
      if (user) {
        const token = generateToken();
        saveUserSession(user, token);
        
        // Piccolo delay per assicurarsi che il localStorage sia aggiornato
        setTimeout(() => {
          login(user, token);
          console.log('✅ Login completato con successo');
        }, 50);
      } else {
        setError('Username o password non corretti. Verifica le credenziali demo.');
        console.log('❌ Login fallito - credenziali non valide');
      }
    } catch (err) {
      console.error('💥 Errore durante il login:', err);
      setError('Errore durante il login. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (username: string, password: string) => {
    setUsername(username);
    setPassword(password);
    setError('');
  };

  const demoCredentials = [
    { username: 'admin.emmanuel', password: 'Emmanuel2024!', role: 'Amministratore', name: 'Mario Rossi' },
    { username: 'gennaro.borriello', password: 'Coord2024!', role: 'Coordinatore', name: 'Gennaro Borriello' },
    { username: 'infermiere.01', password: 'Staff2024!', role: 'Staff', name: 'Anna Verdi' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-sky-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Cooperativa Emmanuel</h2>
          <p className="mt-2 text-gray-600">Area Riservata Staff</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="Inserisci username"
                required
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="Inserisci password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-sky-600 transition-colors"
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
              disabled={loading}
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

        {/* Demo Credentials */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-sky-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Credenziali Demo</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Clicca su una delle credenziali per compilare automaticamente il form:
          </p>
          <div className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                onClick={() => fillDemoCredentials(cred.username, cred.password)}
                className="w-full p-4 bg-gray-50 hover:bg-sky-50 rounded-lg transition-all border border-gray-200 hover:border-sky-200 text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{cred.name}</p>
                    <p className="text-sm text-gray-600">{cred.username}</p>
                    <p className="text-xs text-gray-500 font-mono">{cred.password}</p>
                  </div>
                  <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs rounded-full font-medium">
                    {cred.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};