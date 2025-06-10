/*
  # Create appointments table

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `patient_name` (text)
      - `staff_id` (uuid, references users)
      - `staff_name` (text)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `type` (text)
      - `status` (text)
      - `priority` (text)
      - `location` (text)
      - `duration` (integer)
      - `notes` (text)
      - `symptoms` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references users)
  2. Security
    - Enable RLS on `appointments` table
    - Add policy for staff to read their own appointments
    - Add policy for coordinators and admins to read all appointments
    - Add policy for staff to update their own appointments
    - Add policy for coordinators and admins to insert/update/delete appointments
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id),
  patient_name text NOT NULL,
  staff_id uuid REFERENCES users(id),
  staff_name text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  priority text NOT NULL,
  location text NOT NULL,
  duration integer NOT NULL,
  notes text,
  symptoms text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  cost numeric(10, 2),
  insurance_covered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy per staff: lettura propri appuntamenti
CREATE POLICY "Staff can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per staff: aggiornamento propri appuntamenti
CREATE POLICY "Staff can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori: inserimento appuntamenti
CREATE POLICY "Coordinators can insert appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori: eliminazione appuntamenti
CREATE POLICY "Coordinators can delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();