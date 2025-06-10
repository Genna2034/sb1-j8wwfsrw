import { getPatients, savePatient, deletePatient } from '../utils/medicalStorage';
import { getSupabasePatients, saveSupabasePatient } from '../utils/supabaseUtils';
import { useSupabaseData } from './useSupabaseData';
import { Patient } from '../types/medical';

export function usePatients(filters?: Record<string, any>) {
  const {
    data: patients,
    loading,
    error,
    saveData,
    deleteData,
    refresh,
    isUsingSupabase
  } = useSupabaseData<Patient>(
    'patients',
    'emmanuel_patients_v2',
    getPatients,
    filters
  );

  const savePatientData = async (patient: Patient) => {
    // Salva in localStorage per compatibilità
    savePatient(patient);
    
    // Se Supabase è attivo, salva anche lì
    if (isUsingSupabase) {
      await saveSupabasePatient(patient);
    }
    
    // Aggiorna lo stato locale
    return saveData(patient);
  };

  const deletePatientData = async (patientId: string) => {
    // Elimina da localStorage per compatibilità
    deletePatient(patientId);
    
    // Se Supabase è attivo, elimina anche lì
    if (isUsingSupabase) {
      const supabase = await import('../services/supabaseService').then(m => m.getSupabaseService());
      await supabase.delete('patients', patientId);
    }
    
    // Aggiorna lo stato locale
    return deleteData(patientId);
  };

  return {
    patients,
    loading,
    error,
    savePatient: savePatientData,
    deletePatient: deletePatientData,
    refreshPatients: refresh,
    isUsingSupabase
  };
}