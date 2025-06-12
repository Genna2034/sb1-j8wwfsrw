/*
  # Fix Notification RLS Policies

  1. Security Updates
    - Update RLS policies for notifications table to allow proper insertion
    - Ensure users can create notifications for themselves
    - Allow system/service role to create notifications for any user
    - Maintain security while enabling functionality

  2. Policy Changes
    - Update "Users can insert own notifications" policy to be more permissive
    - Ensure the policy allows notification creation during scheduled operations
    - Add policy for service operations if needed
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Create updated policies for notification insertion
CREATE POLICY "Users can insert own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow service role to insert notifications (for system operations)
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert notifications for any user if they are coordinators or admins
CREATE POLICY "Coordinators and admins can insert any notifications"
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

-- Ensure the existing policies for other operations remain intact
-- (The SELECT, UPDATE, DELETE policies from the schema should remain as they are)