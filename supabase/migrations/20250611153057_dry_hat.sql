/*
  # Create invoices table

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `number` (text, unique)
      - `patient_id` (uuid, foreign key to patients)
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
      - `payment_date` (date)
      - `notes` (text)
      - `is_electronic` (boolean)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `created_by` (uuid, foreign key to users)
  2. Security
    - Enable RLS on `invoices` table
    - Add policies for coordinators and admins to manage invoices
*/

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  patient_id uuid REFERENCES public.patients(id),
  patient_name text NOT NULL,
  patient_fiscal_code text NOT NULL,
  patient_address text NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL,
  type text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  tax_rate numeric(5,2) NOT NULL,
  tax_amount numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  paid_amount numeric(10,2) NOT NULL,
  remaining_amount numeric(10,2) NOT NULL,
  payment_method text,
  payment_date date,
  notes text,
  is_electronic boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id)
);

-- Trigger for updating updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_invoices_updated_at'
  ) THEN
    CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Coordinators and admins can read invoices'
  ) THEN
    CREATE POLICY "Coordinators and admins can read invoices"
      ON public.invoices
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = uid() AND (users.role = 'coordinator' OR users.role = 'admin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Coordinators and admins can insert invoices'
  ) THEN
    CREATE POLICY "Coordinators and admins can insert invoices"
      ON public.invoices
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = uid() AND (users.role = 'coordinator' OR users.role = 'admin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Coordinators and admins can update invoices'
  ) THEN
    CREATE POLICY "Coordinators and admins can update invoices"
      ON public.invoices
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = uid() AND (users.role = 'coordinator' OR users.role = 'admin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Coordinators and admins can delete invoices'
  ) THEN
    CREATE POLICY "Coordinators and admins can delete invoices"
      ON public.invoices
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = uid() AND (users.role = 'coordinator' OR users.role = 'admin')
        )
      );
  END IF;
END $$;