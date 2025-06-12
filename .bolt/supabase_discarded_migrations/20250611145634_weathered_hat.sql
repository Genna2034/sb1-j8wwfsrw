/*
  # Create push subscriptions table

  1. New Tables
    - `push_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `endpoint` (text)
      - `expiration_time` (bigint)
      - `p256dh` (text)
      - `auth` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `push_subscriptions` table
    - Add policy for users to manage their own subscriptions
    - Add policy for coordinators and admins to manage all subscriptions
*/

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  expiration_time bigint,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- RLS Policies

-- Users can read their own push subscriptions
CREATE POLICY "Users can read own push subscriptions"
  ON push_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own push subscriptions
CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own push subscriptions
CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own push subscriptions
CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Coordinators and admins can manage all push subscriptions
CREATE POLICY "Coordinators can manage all push subscriptions"
  ON push_subscriptions
  FOR ALL
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

-- Create trigger for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();