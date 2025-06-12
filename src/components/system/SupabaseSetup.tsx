import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle, XCircle, Table, Key, Lock, Shield, AlertTriangle } from 'lucide-react';
import { initializeSupabase } from '../../services/supabaseService';
import { useToast } from '../../contexts/ToastContext';

export const SupabaseSetup: React.FC = () => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleNext = () => {
    if (step === 1 && (!supabaseUrl || !supabaseKey)) {
      showToast('error', 'Errore', 'Inserisci URL e chiave API Supabase');
      return;
    }
    
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

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
      
      showToast('success', 'Configurazione salvata', 'Configurazione Supabase salvata con successo!');
      setStep(3);
    } catch (error) {
      console.error('Errore nel salvataggio configurazione:', error);
      showToast('error', 'Errore', 'Errore nel salvataggio della configurazione');
    }
  };

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setTestResult({
        success: false,
        message: 'Inserisci URL e chiave API Supabase'
      });
      return;
    }
    
    setLoading(true);
    setTestResult(null);
    
    try {
      // Inizializza temporaneamente per il test
      const supabase = initializeSupabase(supabaseUrl, supabaseKey).supabase;
      
      // Test connessione con una query semplice
      const { data, error } = await supabase.from('users').select('count()', { count: 'exact' });
      
      if (error) {
        throw error;
      }
      
      setTestResult({
        success: true,
        message: 'Connessione a Supabase riuscita!'
      });
      
      showToast('success', 'Test riuscito', 'Connessione a Supabase stabilita con successo');
    } catch (error) {
      console.error('Errore test connessione:', error);
      
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Errore di connessione'
      });
      
      showToast('error', 'Errore connessione', 'Impossibile connettersi a Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-sky-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <Database className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurazione Supabase
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configura l'integrazione con Supabase per il database persistente
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
            step >= 1 ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            1
          </div>
          <p className="text-xs text-center mt-2">Credenziali</p>
        </div>
        <div className={`flex-1 h-1 ${step >= 2 ? 'bg-sky-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
        <div className="flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
            step >= 2 ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            2
          </div>
          <p className="text-xs text-center mt-2">Schema</p>
        </div>
        <div className={`flex-1 h-1 ${step >= 3 ? 'bg-sky-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
        <div className="flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
            step >= 3 ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            3
          </div>
          <p className="text-xs text-center mt-2">Migrazione</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Credenziali Supabase</h3>
            
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Puoi trovare l'URL del tuo progetto Supabase nella sezione Project Settings > API
                </p>
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
                  onClick={testConnection}
                  disabled={loading || !supabaseUrl || !supabaseKey}
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
              
              {testResult && (
                <div className={`p-4 rounded-lg border ${
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
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schema Database</h3>
            
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Per utilizzare Supabase con l'applicazione Emmanuel, è necessario creare le seguenti tabelle nel database:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Table className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <h4 className="font-medium text-gray-900 dark:text-white">users</h4>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Key className="w-3 h-3 mr-1" />
                      <span>id, username, name, role, department, position</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Table className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <h4 className="font-medium text-gray-900 dark:text-white">patients</h4>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Key className="w-3 h-3 mr-1" />
                      <span>id, personalInfo, medicalInfo, assignedStaff, status</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Table className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <h4 className="font-medium text-gray-900 dark:text-white">appointments</h4>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Key className="w-3 h-3 mr-1" />
                      <span>id, patientId, staffId, date, startTime, endTime, type, status</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Table className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                    <h4 className="font-medium text-gray-900 dark:text-white">invoices</h4>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Key className="w-3 h-3 mr-1" />
                      <span>id, number, patientId, issueDate, dueDate, status, total</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-300">Row Level Security</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Assicurati di configurare correttamente le policy di Row Level Security (RLS) per proteggere i dati. Ogni tabella dovrebbe avere policy appropriate in base al ruolo dell'utente.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-300">Importante</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      Puoi creare le tabelle manualmente dall'interfaccia Supabase o utilizzare le migrazioni SQL. Assicurati che la struttura delle tabelle corrisponda ai tipi di dati utilizzati nell'applicazione.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Migrazione Dati</h3>
            
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Ora puoi migrare i dati esistenti da localStorage al database Supabase. Questa operazione manterrà i dati esistenti e li sincronizzerà con il database.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-300">Configurazione Completata</h4>
                    <p className="text-sm text-green-800 dark:text-green-400">
                      Hai configurato con successo l'integrazione con Supabase! Ora puoi utilizzare il database per memorizzare i dati dell'applicazione.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-300">Prossimi Passi</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Vai alla sezione "Integrazioni" nel menu "Gestione" per migrare i dati e gestire la connessione con Supabase.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Indietro
        </button>
        
        {step === 1 ? (
          <button
            onClick={handleSaveConfig}
            disabled={!supabaseUrl || !supabaseKey}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
          >
            Salva e Continua
          </button>
        ) : step < 3 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            Continua
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/management?tab=database'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Completa Setup
          </button>
        )}
      </div>
    </div>
  );
};

export default SupabaseSetup;