import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, CheckCircle, XCircle, Upload, Download, 
  Settings, Shield, AlertTriangle, Server, Table, Key, Lock
} from 'lucide-react';
import { getSupabaseService, initializeSupabase } from '../../services/supabaseService';

export const DatabaseIntegration: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('https://ovqthbcvzpruyyfwegwc.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cXRoYmN2enBydXl5ZndlZ3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MzYyNTcsImV4cCI6MjA2NTExMjI1N30.wwMuU_g6xuz7cTDcHBdIUhpgDOHQ1FWN_6j0qi5rUEs');
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
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

  useEffect(() => {
    // Carica configurazione salvata
    const savedUrl = localStorage.getItem('emmanuel_supabase_url');
    const savedKey = localStorage.getItem('emmanuel_supabase_key');
    
    if (savedUrl && savedKey) {
      setSupabaseUrl(savedUrl);
      setSupabaseKey(savedKey);
      setIsConfigured(true);
      
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
      alert('Inserisci URL e chiave API Supabase');
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
      
      alert('✅ Configurazione Supabase salvata con successo!');
    } catch (error) {
      console.error('Errore nel salvataggio configurazione:', error);
      alert('❌ Errore nel salvataggio della configurazione');
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
    } catch (error) {
      console.error('Errore test connessione:', error);
      
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Errore di connessione',
        details: error
      });
      
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const migrateData = async () => {
    if (!isConnected) {
      alert('Connettiti prima a Supabase');
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
        alert('✅ Migrazione completata con successo!');
      } else {
        alert(`❌ Errore durante la migrazione: ${result.error}`);
      }
    } catch (error) {
      console.error('Errore durante la migrazione:', error);
      
      setMigrationStatus({
        inProgress: false,
        completed: true,
        success: false,
        message: error instanceof Error ? error.message : 'Errore sconosciuto durante la migrazione'
      });
      
      alert('❌ Errore durante la migrazione. Controlla la console per dettagli.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Integrazione Database</h2>
          <p className="text-gray-600 mt-1">
            Configura e gestisci la connessione con Supabase
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connesso' : 'Disconnesso'}
          </span>
        </div>
      </div>

      {/* Configurazione */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurazione Supabase</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supabase URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="https://xxxxxxxxxxxx.supabase.co"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supabase API Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <p className="text-xs text-gray-500 mt-1">
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
        
        {testResult && (
          <div className={`mt-4 p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span className={`font-medium ${
                testResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {testResult.message}
              </span>
            </div>
            {testResult.details && (
              <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-50 rounded">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Migrazione Dati */}
      {isConfigured && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Migrazione Dati</h3>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              Migra i dati esistenti da localStorage al database Supabase. Questa operazione manterrà i dati esistenti e li sincronizzerà con il database.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Attenzione</h4>
                  <p className="text-sm text-yellow-800">
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
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {migrationStatus.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    migrationStatus.success ? 'text-green-900' : 'text-red-900'
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Database</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Table className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">users</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Tabella utenti con autenticazione
                </p>
                <div className="text-xs text-gray-500">
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
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Table className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">patients</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Tabella pazienti
                </p>
                <div className="text-xs text-gray-500">
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
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Table className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="font-medium text-gray-900">appointments</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Tabella appuntamenti
                </p>
                <div className="text-xs text-gray-500">
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
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Table className="w-5 h-5 text-orange-600 mr-2" />
                  <h4 className="font-medium text-gray-900">invoices</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Tabella fatture
                </p>
                <div className="text-xs text-gray-500">
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Server className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Configurazione Schema</h4>
                  <p className="text-sm text-blue-800">
                    Per configurare correttamente lo schema del database, segui la documentazione Supabase e crea le tabelle necessarie con le policy di Row Level Security appropriate.
                  </p>
                  <div className="mt-2">
                    <a 
                      href="https://supabase.com/docs" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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