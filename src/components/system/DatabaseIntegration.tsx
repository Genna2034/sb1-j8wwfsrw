import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, CheckCircle, XCircle, Upload, Download, 
  Settings, Shield, AlertTriangle, Server, Table, Key, Lock
} from 'lucide-react';
import { getSupabaseService, initializeSupabase } from '../../services/supabaseService';
import { shouldUseSupabase, setUseSupabase } from '../../utils/supabaseUtils';
import { useToast } from '../../contexts/ToastContext';
import { SupabaseSetup } from './SupabaseSetup';

export const DatabaseIntegration: React.FC = () => {
  const { showToast } = useToast();
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<{
    inProgress: boolean;
    completed: boolean;
    success?: boolean;
    message?: string;
    details?: any;
  }>({
    inProgress: false,
    completed: false
  });
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  useEffect(() => {
    // Carica configurazione salvata
    const savedUrl = localStorage.getItem('emmanuel_supabase_url');
    const savedKey = localStorage.getItem('emmanuel_supabase_key');
    
    if (savedUrl && savedKey) {
      setSupabaseUrl(savedUrl);
      setSupabaseKey(savedKey);
      setIsConfigured(true);
      
      // Verifica se Supabase è abilitato
      const enabled = shouldUseSupabase();
      setIsEnabled(enabled);
      
      try {
        // Inizializza Supabase con le credenziali salvate
        initializeSupabase(savedUrl, savedKey);
        setIsConnected(true);
      } catch (error) {
        console.error('Errore inizializzazione Supabase:', error);
        setIsConnected(false);
      }
    }
  }, []);

  const handleSaveConfig = () => {
    if (!supabaseUrl || !supabaseKey) {
      showToast('error', 'Errore', 'Inserisci URL e chiave API Supabase');
      return;
    }
    
    try {
      // Salva configurazione
      localStorage.setItem('emmanuel_supabase_url', supabaseUrl);
      localStorage.setItem('emmanuel_supabase_key', supabaseKey);
      
      // Inizializza Supabase
      initializeSupabase(supabaseUrl, supabaseKey);
      
      setIsConfigured(true);
      setIsConnected(true);
      
      showToast('success', 'Configurazione salvata', 'Configurazione Supabase salvata con successo!');
    } catch (error) {
      console.error('Errore nel salvataggio configurazione:', error);
      showToast('error', 'Errore', 'Errore nel salvataggio della configurazione');
    }
  };

  const testConnection = async () => {
    if (!isConfigured) {
      setTestResult({
        success: false,
        message: 'Configura prima le credenziali Supabase'
      });
      return;
    }
    
    setLoading(true);
    setTestResult(null);
    
    try {
      const supabase = getSupabaseService();
      
      // Test connessione con una query semplice
      const { data, error } = await supabase.supabase.from('users').select('count()', { count: 'exact' });
      
      if (error) {
        throw error;
      }
      
      setTestResult({
        success: true,
        message: 'Connessione a Supabase riuscita!',
        details: {
          count: data[0]?.count || 0
        }
      });
      
      setIsConnected(true);
      showToast('success', 'Test riuscito', 'Connessione a Supabase stabilita con successo');
    } catch (error) {
      console.error('Errore test connessione:', error);
      
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Errore di connessione',
        details: error
      });
      
      setIsConnected(false);
      showToast('error', 'Errore connessione', 'Impossibile connettersi a Supabase');
    } finally {
      setLoading(false);
    }
  };

  const migrateData = async () => {
    if (!isConnected) {
      showToast('error', 'Errore', 'Connettiti prima a Supabase');
      return;
    }
    
    if (!confirm('Sei sicuro di voler migrare tutti i dati da localStorage a Supabase? Questa operazione potrebbe richiedere tempo.')) {
      return;
    }
    
    setMigrationStatus({
      inProgress: true,
      completed: false,
      message: 'Migrazione in corso...'
    });
    
    try {
      const supabase = getSupabaseService();
      const result = await supabase.migrateLocalStorageToSupabase();
      
      setMigrationStatus({
        inProgress: false,
        completed: true,
        success: result.success,
        message: result.success 
          ? 'Migrazione completata con successo!' 
          : `Errore durante la migrazione: ${result.error}`,
        details: result
      });
      
      if (result.success) {
        showToast('success', 'Migrazione completata', 'I dati sono stati migrati con successo a Supabase');
      } else {
        showToast('error', 'Errore migrazione', `Errore durante la migrazione: ${result.error}`);
      }
    } catch (error) {
      console.error('Errore durante la migrazione:', error);
      
      setMigrationStatus({
        inProgress: false,
        completed: true,
        success: false,
        message: error instanceof Error ? error.message : 'Errore sconosciuto durante la migrazione'
      });
      
      showToast('error', 'Errore migrazione', 'Errore durante la migrazione. Controlla la console per dettagli.');
    }
  };

  const toggleSupabaseUsage = () => {
    const newValue = !isEnabled;
    setUseSupabase(newValue);
    setIsEnabled(newValue);
    
    showToast('success', 'Impostazione aggiornata', 
      newValue 
        ? 'Supabase è ora attivo come database principale' 
        : 'Supabase è stato disattivato, i dati verranno salvati in localStorage'
    );
  };

  if (showSetupWizard) {
    return <SupabaseSetup />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Integrazione Database</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configura e gestisci la connessione con Supabase
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isConnected ? 'Connesso' : 'Disconnesso'}
          </span>
        </div>
      </div>

      {/* Configurazione */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configurazione Supabase</h3>
        
        {!isConfigured ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Supabase non è ancora configurato. Configura la connessione al database per abilitare la persistenza dei dati.
            </p>
            
            <button
              onClick={() => setShowSetupWizard(true)}
              className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configura Supabase
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supabase URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://xxxxxxxxxxxx.supabase.co"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supabase API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Usa la chiave <strong>anon</strong> o <strong>service_role</strong> key dalle impostazioni API di Supabase
              </p>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleSaveConfig}
                className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Salva Configurazione
              </button>
              
              <button
                onClick={testConnection}
                disabled={loading || !isConfigured}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Test Connessione
              </button>
            </div>
          </div>
        )}
        
        {testResult && (
          <div className={`mt-4 p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-center">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              )}
              <span className={`font-medium ${
                testResult.success ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'
              }`}>
                {testResult.message}
              </span>
            </div>
            {testResult.details && (
              <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-50 dark:bg-gray-800 rounded">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Attivazione Supabase */}
      {isConfigured && isConnected && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attivazione Supabase</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-gray-700 dark:text-gray-300">
                {isEnabled ? 'Supabase è attivo' : 'Supabase è disattivato'}
              </span>
            </div>
            
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={toggleSupabaseUsage}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEnabled 
                ? 'Supabase è attualmente attivo come database principale. I dati vengono salvati e caricati da Supabase.' 
                : 'Supabase è configurato ma non attivo. I dati vengono salvati solo in localStorage.'}
            </p>
          </div>
        </div>
      )}

      {/* Migrazione Dati */}
      {isConfigured && isConnected && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Migrazione Dati</h3>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Migra i dati esistenti da localStorage al database Supabase. Questa operazione manterrà i dati esistenti e li sincronizzerà con il database.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Attenzione</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Assicurati che le tabelle nel database Supabase siano già configurate correttamente con le policy di sicurezza appropriate. La migrazione potrebbe sovrascrivere dati esistenti.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={migrateData}
                disabled={migrationStatus.inProgress || !isConnected}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {migrationStatus.inProgress ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Migra Dati a Supabase
              </button>
            </div>
            
            {migrationStatus.completed && (
              <div className={`mt-2 p-4 rounded-lg border ${
                migrationStatus.success 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}>
                <div className="flex items-center">
                  {migrationStatus.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  )}
                  <span className={`font-medium ${
                    migrationStatus.success ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'
                  }`}>
                    {migrationStatus.message}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schema Database */}
      {isConnected && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schema Database</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Table className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">users</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Tabella utenti con autenticazione
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Key className="w-3 h-3 mr-1" />
                    <span>id, username, name, role, department, position</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Lock className="w-3 h-3 mr-1" />
                    <span>RLS: Solo admin può modificare</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Table className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">patients</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Tabella pazienti
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Key className="w-3 h-3 mr-1" />
                    <span>id, personalInfo, medicalInfo, assignedStaff, status</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Lock className="w-3 h-3 mr-1" />
                    <span>RLS: Staff vede solo pazienti assegnati</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Table className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">appointments</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Tabella appuntamenti
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Key className="w-3 h-3 mr-1" />
                    <span>id, patientId, staffId, date, startTime, endTime, type, status</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Lock className="w-3 h-3 mr-1" />
                    <span>RLS: Staff vede solo propri appuntamenti</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Table className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">invoices</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Tabella fatture
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Key className="w-3 h-3 mr-1" />
                    <span>id, number, patientId, issueDate, dueDate, status, total</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Lock className="w-3 h-3 mr-1" />
                    <span>RLS: Solo admin e coordinatori</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <Server className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-300">Configurazione Schema</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Per configurare correttamente lo schema del database, segui la documentazione Supabase e crea le tabelle necessarie con le policy di Row Level Security appropriate.
                  </p>
                  <div className="mt-2">
                    <a 
                      href="https://supabase.com/docs" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Documentazione Supabase →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseIntegration;