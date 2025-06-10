import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types/auth';
import { Patient } from '../types/medical';
import { Appointment } from '../types/appointments';
import { Invoice } from '../types/billing';
import { Message, Task } from '../types/communications';

// Tipi per le tabelle Supabase
export type Tables = {
  users: User;
  patients: Patient;
  appointments: Appointment;
  invoices: Invoice;
  medical_records: any;
  time_entries: any;
  messages: Message;
  tasks: Task;
};

class SupabaseService {
  supabase: SupabaseClient;
  private isInitialized: boolean = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.isInitialized = true;
  }

  // Verifica se il servizio è inizializzato
  isReady(): boolean {
    return this.isInitialized;
  }

  // Metodi di autenticazione
  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  async signUp(email: string, password: string, userData: Partial<User>) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getCurrentUser() {
    return await this.supabase.auth.getUser();
  }

  async getSession() {
    return await this.supabase.auth.getSession();
  }

  // Metodi CRUD generici
  async getAll<T extends keyof Tables>(
    table: T,
    options?: {
      filters?: Record<string, any>;
      orderBy?: string;
      ascending?: boolean;
      limit?: number;
      page?: number;
    }
  ) {
    let query = this.supabase.from(table).select('*');

    // Applica filtri
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Ordinamento
    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options?.ascending ?? false
      });
    }

    // Paginazione
    if (options?.limit) {
      query = query.limit(options.limit);
      
      if (options?.page && options.page > 1) {
        const offset = (options.page - 1) * options.limit;
        query = query.range(offset, offset + options.limit - 1);
      }
    }

    const { data, error } = await query;
    
    if (error) {
      console.error(`Errore nel recupero dati da ${table}:`, error);
      throw error;
    }
    
    return data;
  }

  async getById<T extends keyof Tables>(table: T, id: string) {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Errore nel recupero ${table} con id ${id}:`, error);
      throw error;
    }
    
    return data;
  }

  async insert<T extends keyof Tables>(table: T, item: Tables[T]) {
    const { data, error } = await this.supabase
      .from(table)
      .insert(item)
      .select();
    
    if (error) {
      console.error(`Errore nell'inserimento in ${table}:`, error);
      throw error;
    }
    
    return data?.[0];
  }

  async update<T extends keyof Tables>(table: T, id: string, updates: Partial<Tables[T]>) {
    const { data, error } = await this.supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Errore nell'aggiornamento di ${table} con id ${id}:`, error);
      throw error;
    }
    
    return data?.[0];
  }

  async delete<T extends keyof Tables>(table: T, id: string) {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Errore nell'eliminazione da ${table} con id ${id}:`, error);
      throw error;
    }
    
    return true;
  }

  // Metodi specifici per entità
  async getPatients(filters?: Record<string, any>) {
    return this.getAll('patients', { filters, orderBy: 'updatedAt', ascending: false });
  }

  async getAppointments(filters?: Record<string, any>) {
    return this.getAll('appointments', { filters, orderBy: 'date' });
  }

  async getInvoices(filters?: Record<string, any>) {
    return this.getAll('invoices', { filters, orderBy: 'issueDate', ascending: false });
  }

  async getMessages(filters?: Record<string, any>) {
    return this.getAll('messages', { filters, orderBy: 'createdAt', ascending: false });
  }

  async getTasks(filters?: Record<string, any>) {
    return this.getAll('tasks', { filters, orderBy: 'dueDate' });
  }

  // Metodi per migrare dati da localStorage a Supabase
  async migrateLocalStorageToSupabase() {
    try {
      console.log('🔄 Inizio migrazione dati da localStorage a Supabase...');
      
      // Migra pazienti
      const patients = JSON.parse(localStorage.getItem('emmanuel_patients_v2') || '[]');
      if (patients.length > 0) {
        console.log(`Migrazione ${patients.length} pazienti...`);
        for (const patient of patients) {
          await this.insert('patients', patient);
        }
      }
      
      // Migra appuntamenti
      const appointments = JSON.parse(localStorage.getItem('emmanuel_appointments_v2') || '[]');
      if (appointments.length > 0) {
        console.log(`Migrazione ${appointments.length} appuntamenti...`);
        for (const appointment of appointments) {
          await this.insert('appointments', appointment);
        }
      }
      
      // Migra fatture
      const invoices = JSON.parse(localStorage.getItem('emmanuel_invoices') || '[]');
      if (invoices.length > 0) {
        console.log(`Migrazione ${invoices.length} fatture...`);
        for (const invoice of invoices) {
          await this.insert('invoices', invoice);
        }
      }
      
      // Migra utenti
      const users = JSON.parse(localStorage.getItem('emmanuel_users') || '[]');
      if (users.length > 0) {
        console.log(`Migrazione ${users.length} utenti...`);
        for (const user of users) {
          await this.insert('users', user);
        }
      }
      
      // Migra cartelle cliniche
      const medicalRecords = JSON.parse(localStorage.getItem('emmanuel_medical_records') || '[]');
      if (medicalRecords.length > 0) {
        console.log(`Migrazione ${medicalRecords.length} cartelle cliniche...`);
        for (const record of medicalRecords) {
          await this.insert('medical_records', record);
        }
      }
      
      console.log('✅ Migrazione completata con successo!');
      return { success: true };
    } catch (error) {
      console.error('❌ Errore durante la migrazione:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore sconosciuto' 
      };
    }
  }

  // Metodi per sincronizzazione realtime
  subscribeToChanges<T extends keyof Tables>(
    table: T,
    callback: (payload: any) => void
  ) {
    return this.supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  }

  // Metodi per storage file
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) {
      console.error(`Errore nell'upload del file:`, error);
      throw error;
    }
    
    return data;
  }

  async downloadFile(bucket: string, path: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);
    
    if (error) {
      console.error(`Errore nel download del file:`, error);
      throw error;
    }
    
    return data;
  }

  async getFileUrl(bucket: string, path: string) {
    const { data } = await this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  // Metodi per funzioni edge
  async callEdgeFunction(functionName: string, payload?: any) {
    const { data, error } = await this.supabase.functions.invoke(functionName, {
      body: payload
    });
    
    if (error) {
      console.error(`Errore nella chiamata alla funzione ${functionName}:`, error);
      throw error;
    }
    
    return data;
  }
}

// Istanza singleton del servizio Supabase
let supabaseServiceInstance: SupabaseService | null = null;

export const initializeSupabase = (supabaseUrl: string, supabaseKey: string): SupabaseService => {
  supabaseServiceInstance = new SupabaseService(supabaseUrl, supabaseKey);
  return supabaseServiceInstance;
};

export const getSupabaseService = (): SupabaseService => {
  if (!supabaseServiceInstance) {
    throw new Error('Supabase non inizializzato. Chiama initializeSupabase prima di usare getSupabaseService.');
  }
  return supabaseServiceInstance;
};

export { SupabaseService };