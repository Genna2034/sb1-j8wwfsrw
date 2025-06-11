/*
  # Create medical_records table

  1. New Tables
    - `medical_records`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to patients)
      - `date` (date)
      - `time` (time without time zone)
      - `type` (text)
      - `title` (text)
      - `description` (text)
      - `staff_id` (uuid, foreign key to users)
      - `staff_name` (text)
      - `vitals` (jsonb)
      - `medications` (jsonb)
      - `attachments` (text[])
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `medical_records` table
    - Add policies for staff to read/write records of assigned patients
*/

CREATE TABLE IF NOT EXISTS public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id),
  date date NOT NULL,
  time time without time zone NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  staff_id uuid REFERENCES public.users(id),
  staff_name text NOT NULL,
  vitals jsonb,
  medications jsonb,
  attachments text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger for updating updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_medical_records_updated_at'
  ) THEN
    CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON public.medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Staff can read records of assigned patients'
  ) THEN
    CREATE POLICY "Staff can read records of assigned patients"
      ON public.medical_records
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM patients
          WHERE patients.id = medical_records.patient_id AND (uid())::text = ANY (patients.assigned_staff)
        ) OR
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
    WHERE policyname = 'Staff can insert records'
  ) THEN
    CREATE POLICY "Staff can insert records"
      ON public.medical_records
      FOR INSERT
      TO authenticated
      WITH CHECK (
        (staff_id = uid()) OR
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
    WHERE policyname = 'Coordinators can update records'
  ) THEN
    CREATE POLICY "Coordinators can update records"
      ON public.medical_records
      FOR UPDATE
      TO authenticated
      USING (
        (staff_id = uid()) OR
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
    WHERE policyname = 'Coordinators can delete records'
  ) THEN
    CREATE POLICY "Coordinators can delete records"
      ON public.medical_records
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