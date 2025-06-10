import { getAppointments, saveAppointment, deleteAppointment } from '../utils/appointmentStorage';
import { getSupabaseAppointments, saveSupabaseAppointment } from '../utils/supabaseUtils';
import { useSupabaseData } from './useSupabaseData';
import { Appointment } from '../types/appointments';

export function useAppointments(filters?: Record<string, any>) {
  const {
    data: appointments,
    loading,
    error,
    saveData,
    deleteData,
    refresh,
    isUsingSupabase
  } = useSupabaseData<Appointment>(
    'appointments',
    'emmanuel_appointments_v2',
    () => getAppointments(filters),
    filters
  );

  const saveAppointmentData = async (appointment: Appointment) => {
    // Salva in localStorage per compatibilità
    saveAppointment(appointment);
    
    // Se Supabase è attivo, salva anche lì
    if (isUsingSupabase) {
      await saveSupabaseAppointment(appointment);
    }
    
    // Aggiorna lo stato locale
    return saveData(appointment);
  };

  const deleteAppointmentData = async (appointmentId: string) => {
    // Elimina da localStorage per compatibilità
    deleteAppointment(appointmentId);
    
    // Se Supabase è attivo, elimina anche lì
    if (isUsingSupabase) {
      const supabase = await import('../services/supabaseService').then(m => m.getSupabaseService());
      await supabase.delete('appointments', appointmentId);
    }
    
    // Aggiorna lo stato locale
    return deleteData(appointmentId);
  };

  return {
    appointments,
    loading,
    error,
    saveAppointment: saveAppointmentData,
    deleteAppointment: deleteAppointmentData,
    refreshAppointments: refresh,
    isUsingSupabase
  };
}