import { useState, useEffect } from 'react';
import { shouldUseSupabase } from '../utils/supabaseUtils';
import { getSupabaseService } from '../services/supabaseService';

// Hook generico per lavorare con dati Supabase o localStorage
export function useSupabaseData<T>(
  table: string,
  localStorageKey: string,
  localStorageGetter: () => T[],
  filters?: Record<string, any>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useSupabaseStorage, setUseSupabaseStorage] = useState(shouldUseSupabase());

  useEffect(() => {
    loadData();
    
    // Verifica periodicamente se l'utente ha cambiato la preferenza di storage
    const checkStoragePreference = () => {
      const shouldUse = shouldUseSupabase();
      if (shouldUse !== useSupabaseStorage) {
        setUseSupabaseStorage(shouldUse);
        loadData();
      }
    };
    
    const interval = setInterval(checkStoragePreference, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (shouldUseSupabase()) {
        // Carica da Supabase
        const supabase = getSupabaseService();
        const result = await supabase.getAll(table, { filters });
        setData(result);
      } else {
        // Carica da localStorage
        setData(localStorageGetter());
      }
    } catch (error) {
      console.error(`Errore nel caricamento dati da ${shouldUseSupabase() ? 'Supabase' : 'localStorage'}:`, error);
      setError(error instanceof Error ? error.message : 'Errore nel caricamento dati');
      
      // Fallback a localStorage in caso di errore con Supabase
      if (shouldUseSupabase()) {
        setData(localStorageGetter());
      }
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (item: T, idField: keyof T = 'id' as keyof T) => {
    try {
      if (shouldUseSupabase()) {
        // Salva su Supabase
        const supabase = getSupabaseService();
        const id = item[idField] as string;
        
        // Verifica se l'elemento esiste già
        const existingItems = await supabase.getAll(table, {
          filters: { [idField]: id }
        });
        
        if (existingItems.length > 0) {
          // Aggiorna elemento esistente
          await supabase.update(table, id, item as any);
        } else {
          // Crea nuovo elemento
          await supabase.insert(table, item as any);
        }
      }
      
      // Aggiorna stato locale
      setData(prev => {
        const index = prev.findIndex(i => i[idField] === item[idField]);
        if (index >= 0) {
          return [...prev.slice(0, index), item, ...prev.slice(index + 1)];
        } else {
          return [...prev, item];
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Errore nel salvataggio dati su ${shouldUseSupabase() ? 'Supabase' : 'localStorage'}:`, error);
      setError(error instanceof Error ? error.message : 'Errore nel salvataggio dati');
      return false;
    }
  };

  const deleteData = async (id: string, idField: keyof T = 'id' as keyof T) => {
    try {
      if (shouldUseSupabase()) {
        // Elimina da Supabase
        const supabase = getSupabaseService();
        await supabase.delete(table, id);
      }
      
      // Aggiorna stato locale
      setData(prev => prev.filter(item => item[idField] !== id));
      
      return true;
    } catch (error) {
      console.error(`Errore nell'eliminazione dati da ${shouldUseSupabase() ? 'Supabase' : 'localStorage'}:`, error);
      setError(error instanceof Error ? error.message : 'Errore nell\'eliminazione dati');
      return false;
    }
  };

  const refresh = () => {
    loadData();
  };

  return {
    data,
    loading,
    error,
    saveData,
    deleteData,
    refresh,
    isUsingSupabase: useSupabaseStorage
  };
}