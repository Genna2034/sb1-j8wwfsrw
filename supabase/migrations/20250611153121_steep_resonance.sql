/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `type` (text)
      - `priority` (text)
      - `title` (text)
      - `message` (text)
      - `user_id` (uuid, foreign key to users)
      - `is_read` (boolean)
      - `created_at` (timestamp with time zone)
      - `read_at` (timestamp with time zone)
      - `expires_at` (timestamp with time zone)
      - `related_id` (text)
      - `related_type` (text)
      - `action_url` (text)
      - `action_label` (text)
      - `metadata` (jsonb)
  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to read own notifications
    - Add policies for coordinators to manage all notifications
*/

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  priority text DEFAULT 'normal'::text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  read_at timestamptz,
  expires_at timestamptz,
  related_id text,
  related_type text,
  action_url text,
  action_label text,
  metadata jsonb
);

-- Create indices for better performance
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_notifications_user_id'
  ) THEN
    CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_notifications_created_at'
  ) THEN
    CREATE INDEX idx_notifications_created_at ON public.notifications (created_at DESC);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_notifications_is_read'
  ) THEN
    CREATE INDEX idx_notifications_is_read ON public.notifications (is_read);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_notifications_type'
  ) THEN
    CREATE INDEX idx_notifications_type ON public.notifications (type);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_notifications_priority'
  ) THEN
    CREATE INDEX idx_notifications_priority ON public.notifications (priority);
  END IF;
END $$;

-- Trigger for updating read_at when is_read changes to true
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_notifications_read_at'
  ) THEN
    CREATE TRIGGER update_notifications_read_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own notifications'
  ) THEN
    CREATE POLICY "Users can read own notifications"
      ON public.notifications
      FOR SELECT
      TO authenticated
      USING (user_id = uid());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own notifications'
  ) THEN
    CREATE POLICY "Users can update own notifications"
      ON public.notifications
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
    WHERE policyname = 'Coordinators can read all notifications'
  ) THEN
    CREATE POLICY "Coordinators can read all notifications"
      ON public.notifications
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = uid() AND users.role = ANY (ARRAY['coordinator'::text, 'admin'::text])
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Coordinators can update all notifications'
  ) THEN
    CREATE POLICY "Coordinators can update all notifications"
      ON public.notifications
      FOR UPDATE
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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Coordinators can insert notifications'
  ) THEN
    CREATE POLICY "Coordinators can insert notifications"
      ON public.notifications
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = uid() AND users.role = ANY (ARRAY['coordinator'::text, 'admin'::text])
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Coordinators can delete notifications'
  ) THEN
    CREATE POLICY "Coordinators can delete notifications"
      ON public.notifications
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = uid() AND users.role = ANY (ARRAY['coordinator'::text, 'admin'::text])
        )
      );
  END IF;
END $$;