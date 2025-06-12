-- Fix notifications RLS policies
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Coordinators and admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;

-- Create a single comprehensive policy for inserting notifications
CREATE POLICY "Anyone can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a policy for service role
CREATE POLICY "Service role can manage all notifications"
  ON notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);