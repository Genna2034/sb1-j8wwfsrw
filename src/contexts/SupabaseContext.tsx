import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseService, initializeSupabase } from '../services/supabaseService';

interface SupabaseContextType {
  supabase: SupabaseClient | null;
  isInitialized: boolean;
  isConnected: boolean;
  error: string | null;
  initialize: (url: string, key: string) => void;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFromStorage = async () => {
      try {
        const url = localStorage.getItem('emmanuel_supabase_url');
        const key = localStorage.getItem('emmanuel_supabase_key');
        
        if (url && key) {
          const service = initializeSupabase(url, key);
          setSupabase(service.supabase);
          setIsInitialized(true);
          
          // Test connection
          const { data, error } = await service.supabase.from('users').select('count()', { count: 'exact' });
          
          if (error) {
            throw error;
          }
          
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Errore inizializzazione Supabase:', error);
        setError(error instanceof Error ? error.message : 'Errore di connessione a Supabase');
        setIsConnected(false);
      }
    };

    initializeFromStorage();
  }, []);

  const initialize = (url: string, key: string) => {
    try {
      const service = initializeSupabase(url, key);
      setSupabase(service.supabase);
      setIsInitialized(true);
      setIsConnected(true);
      setError(null);
      
      // Salva configurazione
      localStorage.setItem('emmanuel_supabase_url', url);
      localStorage.setItem('emmanuel_supabase_key', key);
    } catch (error) {
      console.error('Errore inizializzazione Supabase:', error);
      setError(error instanceof Error ? error.message : 'Errore di inizializzazione Supabase');
      setIsConnected(false);
    }
  };

  return (
    <SupabaseContext.Provider value={{ 
      supabase, 
      isInitialized, 
      isConnected, 
      error, 
      initialize 
    }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};