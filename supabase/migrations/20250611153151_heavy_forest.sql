/*
  # Create update_updated_at_column function

  1. New Functions
    - `update_updated_at_column`
      - Updates the updated_at column to current timestamp
*/

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;