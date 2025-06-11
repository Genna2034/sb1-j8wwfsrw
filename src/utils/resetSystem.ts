import { resetStorageData } from './storage';
import { resetMedicalStorageData } from './medicalStorage';
import { resetAppointmentStorageData } from './appointmentStorage';
import { resetBillingStorageData } from './billingStorage';
import { resetCommunicationStorageData } from './communicationStorage';
import { useToast } from '../contexts/ToastContext';

/**
 * Resets all system data while preserving user accounts
 * @returns Promise that resolves when all data has been reset
 */
export const resetSystem = async (): Promise<void> => {
  try {
    // Reset all storage data
    resetStorageData();
    resetMedicalStorageData();
    resetAppointmentStorageData();
    resetBillingStorageData();
    resetCommunicationStorageData();
    
    // Clear other localStorage items that might contain data
    const keysToPreserve = [
      'emmanuel_users',
      'emmanuel_user',
      'emmanuel_token',
      'emmanuel_session_timestamp',
      'emmanuel_billing_settings',
      'emmanuel_message_templates',
      'emmanuel_communication_settings',
      'emmanuel_supabase_url',
      'emmanuel_supabase_key',
      'emmanuel_use_supabase',
      'emmanuel_theme'
    ];
    
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);
    
    // Filter out keys to preserve
    const keysToRemove = allKeys.filter(key => 
      key.startsWith('emmanuel_') && !keysToPreserve.includes(key)
    );
    
    // Remove all other keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Sistema resettato con successo');
    console.log('🔐 Account utente preservati');
    console.log('🧹 Dati rimossi:', keysToRemove.length, 'elementi');
    
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Errore durante il reset del sistema:', error);
    return Promise.reject(error);
  }
};

/**
 * Component hook for resetting the system with toast notifications
 */
export const useSystemReset = () => {
  const { showToast } = useToast();
  
  const resetSystemWithToast = async () => {
    try {
      await resetSystem();
      showToast(
        'success',
        'Ambiente resettato',
        'Tutti i dati di test sono stati rimossi. Gli account utente sono stati preservati.'
      );
      return true;
    } catch (error) {
      showToast(
        'error',
        'Errore durante il reset',
        'Si è verificato un errore durante il reset del sistema. Controlla la console per i dettagli.'
      );
      return false;
    }
  };
  
  return { resetSystemWithToast };
};