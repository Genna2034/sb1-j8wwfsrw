import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { useSystemReset } from '../../utils/resetSystem';

export const SystemReset: React.FC = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const { resetSystemWithToast } = useSystemReset();

  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      await resetSystemWithToast();
      setResetComplete(true);
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error during system reset:', error);
    } finally {
      setIsResetting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Ambiente</h3>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Attenzione</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Questa operazione rimuoverà tutti i dati di test dall'applicazione, inclusi:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 mt-2 space-y-1">
              <li>Anagrafiche pazienti/utenti</li>
              <li>Elenco operatori di prova</li>
              <li>Assegnazioni/test su calendari</li>
              <li>Fatture simulate</li>
              <li>Report di presenza e rimborsi</li>
              <li>Note interne, messaggi, notifiche</li>
            </ul>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mt-2">
              I 3 account principali (Admin, Coordinatore, Operatore) rimarranno attivi.
            </p>
          </div>
        </div>
      </div>
      
      {!showConfirmation && !resetComplete && (
        <button
          onClick={() => setShowConfirmation(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Reset Ambiente
        </button>
      )}
      
      {showConfirmation && !resetComplete && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300 font-medium mb-4">
            Sei sicuro di voler procedere con il reset dell'ambiente?
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isResetting}
            >
              Annulla
            </button>
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reset in corso...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Conferma Reset
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {resetComplete && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-300">Reset Completato</h4>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                L'ambiente è stato resettato con successo. La pagina verrà ricaricata automaticamente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemReset;