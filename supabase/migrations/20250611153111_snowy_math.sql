/*
  # Create time_entries table

  1. New Tables
    - `time_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `date` (date)
      - `clock_in` (time without time zone)
      - `clock_out` (time without time zone)
      - `total_hours` (numeric)
      - `notes` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `time_entries` table
    - Add policies for users to manage own time entries
    - Add policies for coordinators to manage all time entries
*/

CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  date date NOT NULL,
  clock_in time without time zone NOT NULL,
  clock_out time without time zone,
  total_hours numeric(5,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger for updating updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_time_entries_updated_at'
  ) THEN
    CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own time entries'
  ) THEN
    CREATE POLICY "Users can read own time entries"
      ON public.time_entries
      FOR SELECT
      TO authenticated
      USING (
        (user_id = uid()) OR
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
    WHERE policyname = 'Users can insert own time entries'
  ) THEN
    CREATE POLICY "Users can insert own time entries"
      ON public.time_entries
      FOR INSERT
      TO authenticated
      WITH CHECK (
        (user_id = uid()) OR
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
    WHERE policyname = 'Users can update own time entries'
  ) THEN
    CREATE POLICY "Users can update own time entries"
      ON public.time_entries
      FOR UPDATE
      TO authenticated
      USING (
        (user_id = uid()) OR
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
    WHERE policyname = 'Coordinators can delete time entries'
  ) THEN
    CREATE POLICY "Coordinators can delete time entries"
      ON public.time_entries
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