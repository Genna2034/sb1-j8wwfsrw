/*
  # Create handle_updated_at function and triggers
  
  1. New Functions
    - `handle_updated_at()` - Function to update the updated_at column
    - `update_notifications_read_at()` - Function to update read_at when is_read changes
  
  2. Triggers
    - Adds triggers to all tables to maintain updated_at columns
    - Adds trigger for notifications to track read_at timestamp
    
  3. Security
    - All functions use SECURITY DEFINER for proper execution
*/

-- 1. Definiamo la funzione per aggiornare il campo 'updated_at'
-- Questa funzione verrà chiamata da un trigger. La sintassi con '$$' è fondamentale.
DROP FUNCTION IF EXISTS public.handle_updated_at();

CREATE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per aggiornare il campo read_at nelle notifiche
DROP FUNCTION IF EXISTS public.update_notifications_read_at();

CREATE FUNCTION public.update_notifications_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Applichiamo i trigger alle tabelle che usano la funzione
-- Trigger per la tabella 'users'
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger per la tabella 'patients'
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger per la tabella 'medical_records'
DROP TRIGGER IF EXISTS update_medical_records_updated_at ON public.medical_records;

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger per la tabella 'appointments'
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger per la tabella 'time_entries'
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON public.time_entries;

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger per la tabella 'invoices'
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger per la tabella 'push_subscriptions'
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger per aggiornare read_at nelle notifiche
DROP TRIGGER IF EXISTS update_notifications_read_at ON public.notifications;

CREATE TRIGGER update_notifications_read_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_read_at();