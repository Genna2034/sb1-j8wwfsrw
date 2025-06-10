/*
  # Create patients table

  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `personal_info` (jsonb)
      - `medical_info` (jsonb)
      - `assigned_staff` (text[])
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `patients` table
    - Add policy for staff to read assigned patients
    - Add policy for coordinators and admins to read all patients
    - Add policy for coordinators and admins to insert/update/delete patients
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_info jsonb NOT NULL,
  medical_info jsonb NOT NULL,
  assigned_staff text[] NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy per staff: lettura pazienti assegnati
CREATE POLICY "Staff can read assigned patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'staff' AND auth.uid()::text = ANY(patients.assigned_staff)
    )
  );

-- Policy per coordinatori: lettura di tutti i pazienti
CREATE POLICY "Coordinators can read all patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori: inserimento pazienti
CREATE POLICY "Coordinators can insert patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori: aggiornamento pazienti
CREATE POLICY "Coordinators can update patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori: eliminazione pazienti
CREATE POLICY "Coordinators can delete patients"
  ON patients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();