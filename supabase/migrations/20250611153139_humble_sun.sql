/*
  # Create push_subscriptions table

  1. New Tables
    - `push_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users, unique)
      - `endpoint` (text)
      - `expiration_time` (bigint)
      - `p256dh` (text)
      - `auth` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `push_subscriptions` table
    - Add policies for users to manage own subscriptions
    - Add policies for coordinators to manage all subscriptions
*/

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  expiration_time bigint,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Trigger for updating updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_push_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create index for user_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_push_subscriptions_user_id'
  ) THEN
    CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions (user_id);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own push subscriptions'
  ) THEN
    CREATE POLICY "Users can read own push subscriptions"
      ON public.push_subscriptions
      FOR SELECT
      TO authenticated
      USING (user_id = uid());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert own push subscriptions'
  ) THEN
    CREATE POLICY "Users can insert own push subscriptions"
      ON public.push_subscriptions
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = uid());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own push subscriptions'
  ) THEN
    CREATE POLICY "Users can update own push subscriptions"
      ON public.push_subscriptions
      FOR UPDATE
      TO authenticated
      USING (user_id = uid())
      WITH CHECK (user_id = uid());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can delete own push subscriptions'
  ) THEN
    CREATE POLICY "Users can delete own push subscriptions"
      ON public.push_subscriptions
      FOR DELETE
      TO authenticated
      USING (user_id = uid());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Coordinators can manage all push subscriptions'
  ) THEN
    CREATE POLICY "Coordinators can manage all push subscriptions"
      ON public.push_subscriptions
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = uid() AND users.role = ANY (ARRAY['coordinator'::text, 'admin'::text])
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = uid() AND users.role = ANY (ARRAY['coordinator'::text, 'admin'::text])
        )
      );
  END IF;
END $$;