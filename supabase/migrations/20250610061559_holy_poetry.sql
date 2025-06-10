/*
  # Create time entries table

  1. New Tables
    - `time_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `date` (date)
      - `clock_in` (time)
      - `clock_out` (time)
      - `total_hours` (numeric)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `time_entries` table
    - Add policy for users to read/write their own entries
    - Add policy for coordinators and admins to read all entries
*/

CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  date date NOT NULL,
  clock_in time NOT NULL,
  clock_out time,
  total_hours numeric(5, 2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Policy per utenti: lettura proprie timbrature
CREATE POLICY "Users can read own time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per utenti: inserimento proprie timbrature
CREATE POLICY "Users can insert own time entries"
  ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per utenti: aggiornamento proprie timbrature
CREATE POLICY "Users can update own time entries"
  ON time_entries
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori: eliminazione timbrature
CREATE POLICY "Coordinators can delete time entries"
  ON time_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_time_entries_updated_at
BEFORE UPDATE ON time_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();