import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, RefreshCw, Download, Upload, Trash2 } from 'lucide-react';
import { getCurrentVersion, getLatestVersion, needsMigration, runMigrations, getMigrationHistory } from '../../utils/databaseMigration';
import { initializeSystemData, resetSystemData, exportSystemData, importSystemData } from '../../utils/dataInitializer';

export const DatabaseSetup: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState('');
  const [latestVersion, setLatestVersion] = useState('');
  const [migrations, setMigrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const loadDatabaseInfo = () => {
    setCurrentVersion(getCurrentVersion());
    setLatestVersion(getLatestVersion());
    setMigrations(getMigrationHistory());
  };

  const handleRunMigrations = async () => {
    setLoading(true);
    try {
      runMigrations();
      loadDatabaseInfo();
      alert('✅ Migrazioni completate con successo!');
    } catch (error) {
      console.error('Errore durante migrazioni:', error);
      alert('❌ Errore durante le migrazioni. Controlla la console.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeData = () => {
    if (window.confirm('Inizializzare i dati di esempio? Questo aggiungerà pazienti, appuntamenti e fatture di test.')) {
      initializeSystemData();
      alert('✅ Dati di esempio inizializzati!');
    }
  };

  const handleResetData = () => {
    resetSystemData();
  };

  const handleExportData = () => {
    exportSystemData();
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await importSystemData(file);
      alert('✅ Dati importati con successo! La pagina verrà ricaricata.');
      window.location.reload();
    } catch (error) {
      console.error('Errore durante importazione:', error);
      alert('❌ Errore durante l\'importazione. Verifica il formato del file.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Gestione Database</h3>
      </div>

      {/* Version Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-blue-900">Informazioni Versione</h4>
          {needsMigration() && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              Aggiornamento Disponibile
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">Versione Corrente:</span>
            <span className="ml-2 text-blue-800">{currentVersion}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Ultima Versione:</span>
            <span className="ml-2 text-blue-800">{latestVersion}</span>
          </div>
        </div>
      </div>

      {/* Migrations */}
      {needsMigration() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-yellow-900 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Migrazioni Pendenti
            </h4>
            <button
              onClick={handleRunMigrations}
              disabled={loading}
              className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              Esegui Migrazioni
            </button>
          </div>
          <div className="space-y-2">
            {migrations.filter(m => m.pending).map((migration, index) => (
              <div key={index} className="text-sm text-yellow-800">
                <span className="font-medium">{migration.version}:</span> {migration.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migration History */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Storico Migrazioni</h4>
        </div>
        <div className="p-4">
          {migrations.length > 0 ? (
            <div className="space-y-2">
              {migrations.map((migration, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium text-gray-900">{migration.version}</span>
                    <span className="text-gray-600 ml-2">{migration.description}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    migration.applied 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {migration.applied ? 'Applicata' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nessuna migrazione disponibile</p>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Gestione Dati</h4>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleInitializeData}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Database className="w-4 h-4 mr-2" />
              Inizializza Dati di Esempio
            </button>

            <button
              onClick={handleExportData}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta Backup
            </button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={importing}
              />
              <button
                disabled={importing}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {importing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Importa Backup
              </button>
            </div>

            <button
              onClick={handleResetData}
              className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Completo
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Informazioni:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Inizializza Dati:</strong> Crea pazienti, appuntamenti e fatture di esempio</li>
              <li>• <strong>Esporta Backup:</strong> Scarica tutti i dati in formato JSON</li>
              <li>• <strong>Importa Backup:</strong> Ripristina dati da un file di backup</li>
              <li>• <strong>Reset Completo:</strong> Elimina tutti i dati e reinizializza il sistema</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};