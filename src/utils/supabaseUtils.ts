import { getSupabaseService } from '../services/supabaseService';
import { User } from '../types/auth';
import { Patient } from '../types/medical';
import { Appointment } from '../types/appointments';
import { Invoice } from '../types/billing';
import { Message, Task } from '../types/communications';

// Funzioni di utilità per lavorare con Supabase

// Utenti
export const getSupabaseUsers = async (): Promise<User[]> => {
  try {
    const supabase = getSupabaseService();
    return await supabase.getAll('users');
  } catch (error) {
    console.error('Errore nel recupero utenti da Supabase:', error);
    return [];
  }
};

export const saveSupabaseUser = async (user: User): Promise<User | null> => {
  try {
    const supabase = getSupabaseService();
    
    // Verifica se l'utente esiste già
    const existingUsers = await supabase.getAll('users', {
      filters: { id: user.id }
    });
    
    if (existingUsers.length > 0) {
      // Aggiorna utente esistente
      return await supabase.update('users', user.id, user);
    } else {
      // Crea nuovo utente
      return await supabase.insert('users', user);
    }
  } catch (error) {
    console.error('Errore nel salvataggio utente su Supabase:', error);
    return null;
  }
};

export const deleteSupabaseUser = async (userId: string): Promise<boolean> => {
  try {
    const supabase = getSupabaseService();
    return await supabase.delete('users', userId);
  } catch (error) {
    console.error('Errore nell\'eliminazione utente da Supabase:', error);
    return false;
  }
};

// Pazienti
export const getSupabasePatients = async (filters?: Record<string, any>): Promise<Patient[]> => {
  try {
    const supabase = getSupabaseService();
    return await supabase.getPatients(filters);
  } catch (error) {
    console.error('Errore nel recupero pazienti da Supabase:', error);
    return [];
  }
};

export const saveSupabasePatient = async (patient: Patient): Promise<Patient | null> => {
  try {
    const supabase = getSupabaseService();
    
    // Verifica se il paziente esiste già
    const existingPatients = await supabase.getAll('patients', {
      filters: { id: patient.id }
    });
    
    if (existingPatients.length > 0) {
      // Aggiorna paziente esistente
      return await supabase.update('patients', patient.id, patient);
    } else {
      // Crea nuovo paziente
      return await supabase.insert('patients', patient);
    }
  } catch (error) {
    console.error('Errore nel salvataggio paziente su Supabase:', error);
    return null;
  }
};

// Appuntamenti
export const getSupabaseAppointments = async (filters?: Record<string, any>): Promise<Appointment[]> => {
  try {
    const supabase = getSupabaseService();
    return await supabase.getAppointments(filters);
  } catch (error) {
    console.error('Errore nel recupero appuntamenti da Supabase:', error);
    return [];
  }
};

export const saveSupabaseAppointment = async (appointment: Appointment): Promise<Appointment | null> => {
  try {
    const supabase = getSupabaseService();
    
    // Verifica se l'appuntamento esiste già
    const existingAppointments = await supabase.getAll('appointments', {
      filters: { id: appointment.id }
    });
    
    if (existingAppointments.length > 0) {
      // Aggiorna appuntamento esistente
      return await supabase.update('appointments', appointment.id, appointment);
    } else {
      // Crea nuovo appuntamento
      return await supabase.insert('appointments', appointment);
    }
  } catch (error) {
    console.error('Errore nel salvataggio appuntamento su Supabase:', error);
    return null;
  }
};

// Fatture
export const getSupabaseInvoices = async (filters?: Record<string, any>): Promise<Invoice[]> => {
  try {
    const supabase = getSupabaseService();
    return await supabase.getInvoices(filters);
  } catch (error) {
    console.error('Errore nel recupero fatture da Supabase:', error);
    return [];
  }
};

export const saveSupabaseInvoice = async (invoice: Invoice): Promise<Invoice | null> => {
  try {
    const supabase = getSupabaseService();
    
    // Verifica se la fattura esiste già
    const existingInvoices = await supabase.getAll('invoices', {
      filters: { id: invoice.id }
    });
    
    if (existingInvoices.length > 0) {
      // Aggiorna fattura esistente
      return await supabase.update('invoices', invoice.id, invoice);
    } else {
      // Crea nuova fattura
      return await supabase.insert('invoices', invoice);
    }
  } catch (error) {
    console.error('Errore nel salvataggio fattura su Supabase:', error);
    return null;
  }
};

// Messaggi
export const getSupabaseMessages = async (filters?: Record<string, any>): Promise<Message[]> => {
  try {
    const supabase = getSupabaseService();
    return await supabase.getMessages(filters);
  } catch (error) {
    console.error('Errore nel recupero messaggi da Supabase:', error);
    return [];
  }
};

// Task
export const getSupabaseTasks = async (filters?: Record<string, any>): Promise<Task[]> => {
  try {
    const supabase = getSupabaseService();
    return await supabase.getTasks(filters);
  } catch (error) {
    console.error('Errore nel recupero task da Supabase:', error);
    return [];
  }
};

// Funzione per verificare se Supabase è configurato
export const isSupabaseConfigured = (): boolean => {
  const url = localStorage.getItem('emmanuel_supabase_url');
  const key = localStorage.getItem('emmanuel_supabase_key');
  return !!(url && key);
};

// Funzione per verificare se usare Supabase o localStorage
export const shouldUseSupabase = (): boolean => {
  // Verifica se Supabase è configurato e se l'utente ha scelto di usarlo
  const isConfigured = isSupabaseConfigured();
  const useSupabase = localStorage.getItem('emmanuel_use_supabase') === 'true';
  return isConfigured && useSupabase;
};

// Funzione per abilitare/disabilitare l'uso di Supabase
export const setUseSupabase = (use: boolean): void => {
  localStorage.setItem('emmanuel_use_supabase', use ? 'true' : 'false');
};