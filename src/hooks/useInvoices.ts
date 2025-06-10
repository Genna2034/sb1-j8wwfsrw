import { getInvoices, saveInvoice, deleteInvoice } from '../utils/billingStorage';
import { getSupabaseInvoices, saveSupabaseInvoice } from '../utils/supabaseUtils';
import { useSupabaseData } from './useSupabaseData';
import { Invoice } from '../types/billing';

export function useInvoices(filters?: Record<string, any>) {
  const {
    data: invoices,
    loading,
    error,
    saveData,
    deleteData,
    refresh,
    isUsingSupabase
  } = useSupabaseData<Invoice>(
    'invoices',
    'emmanuel_invoices',
    () => getInvoices(filters),
    filters
  );

  const saveInvoiceData = async (invoice: Invoice) => {
    // Salva in localStorage per compatibilità
    saveInvoice(invoice);
    
    // Se Supabase è attivo, salva anche lì
    if (isUsingSupabase) {
      await saveSupabaseInvoice(invoice);
    }
    
    // Aggiorna lo stato locale
    return saveData(invoice);
  };

  const deleteInvoiceData = async (invoiceId: string) => {
    // Elimina da localStorage per compatibilità
    deleteInvoice(invoiceId);
    
    // Se Supabase è attivo, elimina anche lì
    if (isUsingSupabase) {
      const supabase = await import('../services/supabaseService').then(m => m.getSupabaseService());
      await supabase.delete('invoices', invoiceId);
    }
    
    // Aggiorna lo stato locale
    return deleteData(invoiceId);
  };

  return {
    invoices,
    loading,
    error,
    saveInvoice: saveInvoiceData,
    deleteInvoice: deleteInvoiceData,
    refreshInvoices: refresh,
    isUsingSupabase
  };
}