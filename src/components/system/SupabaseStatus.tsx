import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw, Settings, Shield } from 'lucide-react';
import { isSupabaseConfigured, shouldUseSupabase, setUseSupabase } from '../../utils/supabaseUtils';
import { getSupabaseService } from '../../services/supabaseService';

export const SupabaseStatus: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    patients?: number;
    appointments?: number;
    invoices?: number;
    users?: number;
  }>({});

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    
    try {
      // Verifica se Supabase è configurato
      const configured = isSupabaseConfigured();
      setIsConfigured(configured);
      
      // Verifica se Supabase è abilitato
      const enabled = shouldUseSupabase();
      setIsEnabled(enabled);
      
      if (configured) {
        try {
          // Test connessione con una query semplice invece di count
          const supabase = getSupabaseService();
          const { data, error } = await supabase.supabase
            .from('users')
            .select('id')
            .limit(1);
          
          if (error) {
            throw error;
          }
          
          setIsConnected(true);
          
          // Carica statistiche
          if (enabled) {
            const stats = await loadStats();
            setStats(stats);
          }
        } catch (error) {
          console.error('Errore connessione Supabase:', error);
          setIsConnected(false);
        }
      }
    } catch (error) {
      console.error('Errore verifica stato Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const supabase = getSupabaseService();
      
      // Usa query separate per ottenere i conteggi
      const [
        patientsResult,
        appointmentsResult,
        invoicesResult,
        usersResult
      ] = await Promise.all([
        supabase.supabase.from('patients').select('id').limit(1000),
        supabase.supabase.from('appointments').select('id').limit(1000),
        supabase.supabase.from('invoices').select('id').limit(1000),
        supabase.supabase.from('users').select('id').limit(1000)
      ]);
      
      return {
        patients: patientsResult.data?.length || 0,
        appointments: appointmentsResult.data?.length || 0,
        invoices: invoicesResult.data?.length || 0,
        users: usersResult.data?.length || 0
      };
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
      return {};
    }
  };

  const toggleSupabaseUsage = () => {
    const newValue = !isEnabled;
    setUseSupabase(newValue);
    setIsEnabled(newValue);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
            <Database className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Supabase Database</h3>
            <p className="text-sm text-gray-600">
              {isConfigured 
                ? isConnected 
                  ? 'Connesso e pronto all\'uso' 
                  : 'Configurato ma non connesso'
                : 'Non configurato'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isConfigured && isConnected && (
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={toggleSupabaseUsage}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {isEnabled ? 'Attivo' : 'Disattivato'}
                </span>
              </label>
            </div>
          )}
          
          <button
            onClick={checkStatus}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {isConfigured && isConnected && (
        <div className="space-y-4">
          {isEnabled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">
                  Supabase è attivo e in uso
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                I dati vengono salvati e recuperati dal database Supabase
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-900">
                  Supabase è configurato ma non attivo
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                I dati vengono salvati solo in localStorage. Attiva Supabase per usare il database.
              </p>
            </div>
          )}
          
          {isEnabled && Object.keys(stats).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">Pazienti</p>
                <p className="text-xl font-bold text-blue-700">{stats.patients || 0}</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900">Appuntamenti</p>
                <p className="text-xl font-bold text-purple-700">{stats.appointments || 0}</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900">Fatture</p>
                <p className="text-xl font-bold text-green-700">{stats.invoices || 0}</p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-900">Utenti</p>
                <p className="text-xl font-bold text-orange-700">{stats.users || 0}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <a
              href="/management?tab=database"
              className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gestisci Database
            </a>
          </div>
        </div>
      )}
      
      {!isConfigured && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Supabase non è ancora configurato. Vai alla sezione "Database" nel menu "Gestione" per configurarlo.
          </p>
          <div className="mt-3">
            <a
              href="/management?tab=database"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configura Supabase
            </a>
          </div>
        </div>
      )}
    </div>
  );
};