/*
  # Create invoices table

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `number` (text, unique)
      - `patient_id` (uuid, references patients)
      - `patient_name` (text)
      - `patient_fiscal_code` (text)
      - `patient_address` (text)
      - `issue_date` (date)
      - `due_date` (date)
      - `status` (text)
      - `type` (text)
      - `items` (jsonb)
      - `subtotal` (numeric)
      - `tax_rate` (numeric)
      - `tax_amount` (numeric)
      - `total` (numeric)
      - `paid_amount` (numeric)
      - `remaining_amount` (numeric)
      - `payment_method` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references users)
  2. Security
    - Enable RLS on `invoices` table
    - Add policy for coordinators and admins to read/write invoices
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  patient_id uuid REFERENCES patients(id),
  patient_name text NOT NULL,
  patient_fiscal_code text NOT NULL,
  patient_address text NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL,
  type text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric(10, 2) NOT NULL,
  tax_rate numeric(5, 2) NOT NULL,
  tax_amount numeric(10, 2) NOT NULL,
  total numeric(10, 2) NOT NULL,
  paid_amount numeric(10, 2) NOT NULL,
  remaining_amount numeric(10, 2) NOT NULL,
  payment_method text,
  payment_date date,
  notes text,
  is_electronic boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy per coordinatori e admin: lettura fatture
CREATE POLICY "Coordinators and admins can read invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori e admin: inserimento fatture
CREATE POLICY "Coordinators and admins can insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori e admin: aggiornamento fatture
CREATE POLICY "Coordinators and admins can update invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Policy per coordinatori e admin: eliminazione fatture
CREATE POLICY "Coordinators and admins can delete invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )
  );

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();