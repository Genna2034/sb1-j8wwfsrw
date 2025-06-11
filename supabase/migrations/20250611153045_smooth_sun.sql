/*
  # Create appointments table

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to patients)
      - `patient_name` (text)
      - `staff_id` (uuid, foreign key to users)
      - `staff_name` (text)
      - `date` (date)
      - `start_time` (time without time zone)
      - `end_time` (time without time zone)
      - `type` (text)
      - `status` (text)
      - `priority` (text)
      - `location` (text)
      - `duration` (integer)
      - `notes` (text)
      - `symptoms` (text)
      - `follow_up_required` (boolean)
      - `follow_up_date` (date)
      - `cost` (numeric)
      - `insurance_covered` (boolean)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `created_by` (uuid, foreign key to users)
  2. Security
    - Enable RLS on `appointments` table
    - Add policies for staff to read/write own appointments
*/

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id),
  patient_name text NOT NULL,
  staff_id uuid REFERENCES public.users(id),
  staff_name text NOT NULL,
  date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  priority text NOT NULL,
  location text NOT NULL,
  duration integer NOT NULL,
  notes text,
  symptoms text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  cost numeric(10,2),
  insurance_covered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id)
);

-- Trigger for updating updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_appointments_updated_at'
  ) THEN
    CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Staff can read own appointments'
  ) THEN
    CREATE POLICY "Staff can read own appointments"
      ON public.appointments
      FOR SELECT
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
    WHERE policyname = 'Coordinators can insert appointments'
  ) THEN
    CREATE POLICY "Coordinators can insert appointments"
      ON public.appointments
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
    WHERE policyname = 'Staff can update own appointments'
  ) THEN
    CREATE POLICY "Staff can update own appointments"
      ON public.appointments
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
    WHERE policyname = 'Coordinators can delete appointments'
  ) THEN
    CREATE POLICY "Coordinators can delete appointments"
      ON public.appointments
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