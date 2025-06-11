/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `name` (text)
      - `role` (text)
      - `department` (text)
      - `position` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read own data
*/

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  department text,
  position text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger for updating updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (uid() = id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can read all users'
  ) THEN
    CREATE POLICY "Admins can read all users"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1
        FROM users users_1
        WHERE users_1.id = uid() AND users_1.role = 'admin'
      ));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can update users'
  ) THEN
    CREATE POLICY "Admins can update users"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1
        FROM users users_1
        WHERE users_1.id = uid() AND users_1.role = 'admin'
      ));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can insert users'
  ) THEN
    CREATE POLICY "Admins can insert users"
      ON public.users
      FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1
        FROM users users_1
        WHERE users_1.id = uid() AND users_1.role = 'admin'
      ));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can delete users'
  ) THEN
    CREATE POLICY "Admins can delete users"
      ON public.users
      FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1
        FROM users users_1
        WHERE users_1.id = uid() AND users_1.role = 'admin'
      ));
  END IF;
END $$;