/*
  # Create medical records table

  1. New Tables
    - `medical_records`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `date` (date)
      - `time` (time)
      - `type` (text)
      - `title` (text)
      - `description` (text)
      - `staff_id` (uuid, references users)
      - `staff_name` (text)
      - `vitals` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `medical_records` table
    - Add policy for staff to read records of assigned patients
    - Add policy for staff to insert records
    - Add policy for coordinators and admins to read/write all records
*/

CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id),
  date date NOT NULL,
  time time NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  staff_id uuid REFERENCES users(id),
  staff_name text NOT NULL,
  vitals jsonb,
  medications jsonb,
  attachments text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Policy per staff: lettura cartelle di pazienti assegnati
CREATE POLICY "Staff can read records of assigned patients"
  ON medical_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_records.patient_id AND auth.uid()::text = ANY(patients.assigned_staff)
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per staff: inserimento cartelle
CREATE POLICY "Staff can insert records"
  ON medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori: aggiornamento cartelle
CREATE POLICY "Coordinators can update records"
  ON medical_records
  FOR UPDATE
  TO authenticated
  USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori: eliminazione cartelle
CREATE POLICY "Coordinators can delete records"
  ON medical_records
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_medical_records_updated_at
BEFORE UPDATE ON medical_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();