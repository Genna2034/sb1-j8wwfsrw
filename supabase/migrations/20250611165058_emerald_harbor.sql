/*
  # Fix notifications table RLS policies

  1. Security Updates
    - Update INSERT policy for notifications to allow authenticated users to create notifications
    - Ensure coordinators and admins can create notifications for any user
    - Allow users to create notifications for themselves
    - Fix the policy logic to properly handle notification creation

  2. Policy Changes
    - Modify "Coordinators can insert notifications" policy to be more permissive
    - Add policy for users to insert their own notifications
    - Ensure proper authentication checks
*/

-- Drop existing INSERT policy that might be too restrictive
DROP POLICY IF EXISTS "Coordinators can insert notifications" ON notifications;

-- Create new INSERT policy for coordinators and admins
CREATE POLICY "Coordinators and admins can insert notifications"
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

-- Create INSERT policy for users to create their own notifications
CREATE POLICY "Users can insert own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create INSERT policy for system notifications (allows service role)
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure the trigger function exists for updating read_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_notifications_read_at ON notifications;
CREATE TRIGGER update_notifications_read_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_read_at();