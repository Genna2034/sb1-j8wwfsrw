import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { performSystemCheck, testLoginFlow, checkRaceConditions } from '../utils/systemCheck';
import { useAuth } from '../contexts/AuthContext';

export const SystemStatus: React.FC = () => {
  const { user } = useAuth();
  const [systemCheck, setSystemCheck] = useState<any>(null);
  const [loginTest, setLoginTest] = useState<any>(null);
  const [raceTest, setRaceTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runSystemCheck();
  }, []);

  const runSystemCheck = async () => {
    setLoading(true);
    try {
      const check = performSystemCheck();
      setSystemCheck(check);
      
      // Test race conditions
      const race = await checkRaceConditions();
      setRaceTest(race);
      
    } catch (error) {
      console.error('Errore durante verifica sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const runLoginTest = async () => {
    setLoading(true);
    try {
      const test = await testLoginFlow('admin.emmanuel', 'Emmanuel2024!');
      setLoginTest(test);
    } catch (error) {
      console.error('Errore durante test login:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Stato Sistema</h3>
        <div className="flex space-x-2">
          <button
            onClick={runSystemCheck}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Verifica Sistema
          </button>
          <button
            onClick={runLoginTest}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Test Login
          </button>
        </div>
      </div>

      {systemCheck && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LocalStorage Check */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">LocalStorage</h4>
                {getStatusIcon(systemCheck.localStorage.available && systemCheck.localStorage.working)}
              </div>
              <div className="text-sm text-gray-600">
                <p>Disponibile: {systemCheck.localStorage.available ? 'Sì' : 'No'}</p>
                <p>Funzionante: {systemCheck.localStorage.working ? 'Sì' : 'No'}</p>
                {systemCheck.localStorage.quota && (
                  <p>Utilizzo: {systemCheck.localStorage.quota.usedMB} MB</p>
                )}
              </div>
            </div>

            {/* Auth State Check */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Stato Auth</h4>
                {getStatusIcon(systemCheck.authState.hasUser && systemCheck.authState.hasToken)}
              </div>
              <div className="text-sm text-gray-600">
                <p>Utente: {systemCheck.authState.hasUser ? 'Presente' : 'Assente'}</p>
                <p>Token: {systemCheck.authState.hasToken ? 'Presente' : 'Assente'}</p>
                {systemCheck.authState.sessionAge && (
                  <p>Età sessione: {systemCheck.authState.sessionAge.hours}h</p>
                )}
              </div>
            </div>

            {/* User Management Check */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Gestione Utenti</h4>
                {getStatusIcon(systemCheck.userManagement.hasUsers && systemCheck.userManagement.usersValid)}
              </div>
              <div className="text-sm text-gray-600">
                <p>Utenti: {systemCheck.userManagement.userCount}</p>
                <p>Validi: {systemCheck.userManagement.usersValid ? 'Sì' : 'No'}</p>
              </div>
            </div>

            {/* Performance Check */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Performance</h4>
                {getStatusIcon(systemCheck.performance.jsonOperationTime < 10)}
              </div>
              <div className="text-sm text-gray-600">
                <p>JSON Ops: {systemCheck.performance.jsonOperationTime.toFixed(2)}ms</p>
                {systemCheck.performance.memoryUsage !== 'Not available' && (
                  <p>Memoria: {(systemCheck.performance.memoryUsage.used / 1024 / 1024).toFixed(1)}MB</p>
                )}
              </div>
            </div>
          </div>

          {/* Login Test Results */}
          {loginTest && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Risultati Test Login</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center">
                  {getStatusIcon(loginTest.step1_auth)}
                  <span className="ml-2 text-sm">Autenticazione</span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(loginTest.step2_storage)}
                  <span className="ml-2 text-sm">Storage</span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(loginTest.step3_state)}
                  <span className="ml-2 text-sm">Stato</span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(loginTest.step4_cleanup)}
                  <span className="ml-2 text-sm">Cleanup</span>
                </div>
              </div>
              {loginTest.errors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-medium text-red-900 mb-1">Errori:</h5>
                  <ul className="text-sm text-red-800">
                    {loginTest.errors.map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Race Conditions Test */}
          {raceTest && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Test Race Conditions</h4>
                {getStatusIcon(raceTest.completed)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Operazioni simultanee completate: {raceTest.results}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};