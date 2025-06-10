-- Crea la tabella bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  service_type text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Abilita Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Crea policy per permettere agli utenti di vedere solo le proprie prenotazioni
CREATE POLICY "Users can view their own bookings" 
ON bookings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Crea policy per permettere agli utenti di inserire le proprie prenotazioni
CREATE POLICY "Users can insert their own bookings" 
ON bookings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Crea policy per permettere agli utenti di aggiornare le proprie prenotazioni
CREATE POLICY "Users can update their own bookings" 
ON bookings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Crea policy per permettere agli utenti di eliminare le proprie prenotazioni
CREATE POLICY "Users can delete their own bookings" 
ON bookings FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Crea trigger per aggiornare il campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();