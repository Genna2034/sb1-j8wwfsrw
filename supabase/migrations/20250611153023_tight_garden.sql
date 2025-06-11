/*
  # Create patients table

  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `personal_info` (jsonb)
      - `medical_info` (jsonb)
      - `assigned_staff` (text[])
      - `status` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `patients` table
    - Add policies for staff to read assigned patients
    - Add policies for coordinators to manage all patients
*/

CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_info jsonb NOT NULL,
  medical_info jsonb NOT NULL,
  assigned_staff text[] NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger for updating updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_patients_updated_at'
  ) THEN
    CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Staff can read records of assigned patients'
  ) THEN
    CREATE POLICY "Staff can read records of assigned patients"
      ON public.patients
      FOR SELECT
      TO authenticated
      USING (
        (uid())::text = ANY (assigned_staff) OR
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
    WHERE policyname = 'Coordinators can insert patients'
  ) THEN
    CREATE POLICY "Coordinators can insert patients"
      ON public.patients
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
    WHERE policyname = 'Coordinators can update patients'
  ) THEN
    CREATE POLICY "Coordinators can update patients"
      ON public.patients
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
    WHERE policyname = 'Coordinators can delete patients'
  ) THEN
    CREATE POLICY "Coordinators can delete patients"
      ON public.patients
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