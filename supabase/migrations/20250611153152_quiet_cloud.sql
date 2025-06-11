/*
  # Create update_notifications_updated_at function

  1. New Functions
    - `update_notifications_updated_at`
      - Updates the read_at column when is_read changes to true
*/

CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;