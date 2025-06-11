/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `type` (text) - Type of notification (appointment, message, invoice, etc.)
      - `priority` (text) - Priority level (low, normal, high, urgent)
      - `title` (text) - Notification title
      - `message` (text) - Notification message content
      - `user_id` (uuid, foreign key to users table)
      - `is_read` (boolean, default false)
      - `created_at` (timestamp)
      - `read_at` (timestamp, nullable)
      - `expires_at` (timestamp, nullable)
      - `related_id` (text, nullable) - ID of related entity
      - `related_type` (text, nullable) - Type of related entity
      - `action_url` (text, nullable) - URL for notification action
      - `action_label` (text, nullable) - Label for notification action
      - `metadata` (jsonb, nullable) - Additional notification data

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to read their own notifications
    - Add policy for coordinators and admins to manage all notifications
    - Add policy for users to update their own notifications (mark as read)

  3. Indexes
    - Index on user_id for efficient queries
    - Index on created_at for sorting
    - Index on is_read for filtering unread notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  title text NOT NULL,
  message text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  expires_at timestamptz,
  related_id text,
  related_type text,
  action_url text,
  action_label text,
  metadata jsonb
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- RLS Policies

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Coordinators and admins can read all notifications
CREATE POLICY "Coordinators can read all notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coordinator', 'admin')
    )
  );

-- Coordinators and admins can insert notifications for any user
CREATE POLICY "Coordinators can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coordinator', 'admin')
    )
  );

-- Coordinators and admins can update all notifications
CREATE POLICY "Coordinators can update all notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coordinator', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coordinator', 'admin')
    )
  );

-- Coordinators and admins can delete notifications
CREATE POLICY "Coordinators can delete notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coordinator', 'admin')
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.read_at = CASE WHEN NEW.is_read = true AND OLD.is_read = false THEN now() ELSE NEW.read_at END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_read_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();