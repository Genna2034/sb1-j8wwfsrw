/*
  # Schema update for healthcare management system

  1. Utility Functions
    - update_updated_at_column: Updates timestamp on record changes
    - update_notifications_read_at: Updates read timestamp for notifications

  2. Tables
    - users: Staff and admin accounts
    - patients: Patient records with personal and medical info
    - medical_records: Patient medical history
    - appointments: Scheduled appointments
    - time_entries: Staff time tracking
    - invoices: Billing records
    - notifications: System notifications
    - push_subscriptions: Web push notification subscriptions

  3. Security
    - Row Level Security (RLS) for all tables
    - Role-based access policies
*/

-- Funzioni di utilità per trigger
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_notifications_read_at') THEN
    CREATE FUNCTION update_notifications_read_at()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_at = now();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Tabella users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL,
  department text,
  position text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabella patients
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_info jsonb NOT NULL,
  medical_info jsonb NOT NULL,
  assigned_staff text[] NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabella medical_records
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  staff_id uuid REFERENCES users(id),
  staff_name text NOT NULL,
  vitals jsonb,
  medications jsonb,
  attachments text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabella appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  staff_id uuid REFERENCES users(id),
  staff_name text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  priority text NOT NULL,
  location text NOT NULL,
  duration integer NOT NULL,
  notes text,
  symptoms text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  cost numeric(10,2),
  insurance_covered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- Tabella time_entries
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  clock_in time NOT NULL,
  clock_out time,
  total_hours numeric(5,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabella invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_fiscal_code text NOT NULL,
  patient_address text NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL,
  type text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  tax_rate numeric(5,2) NOT NULL,
  tax_amount numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  paid_amount numeric(10,2) NOT NULL,
  remaining_amount numeric(10,2) NOT NULL,
  payment_method text,
  payment_date date,
  notes text,
  is_electronic boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- Tabella notifications
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

-- Tabella push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  expiration_time bigint,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger per aggiornare updated_at
DO $$ 
BEGIN
  -- Check if trigger exists before creating
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_patients_updated_at') THEN
    CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medical_records_updated_at') THEN
    CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_appointments_updated_at') THEN
    CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_time_entries_updated_at') THEN
    CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_updated_at') THEN
    CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_push_subscriptions_updated_at') THEN
    CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_read_at') THEN
    CREATE TRIGGER update_notifications_read_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_notifications_read_at();
  END IF;
END $$;

-- Abilitazione RLS
DO $$ 
BEGIN
  -- Enable RLS on all tables
  EXECUTE 'ALTER TABLE users ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE patients ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE appointments ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE invoices ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE notifications ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY';
EXCEPTION
  WHEN others THEN
    -- If there's an error (like RLS already enabled), continue
    NULL;
END $$;

-- Policy per users
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Admins can read all users" ON users;
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Admins can insert users" ON users;
  DROP POLICY IF EXISTS "Admins can update users" ON users;
  DROP POLICY IF EXISTS "Admins can delete users" ON users;

  -- Create policies
  CREATE POLICY "Admins can read all users"
    ON users
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users users_1
      WHERE users_1.id = auth.uid() AND users_1.role = 'admin'
    ));

  CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Admins can insert users"
    ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM users users_1
      WHERE users_1.id = auth.uid() AND users_1.role = 'admin'
    ));

  CREATE POLICY "Admins can update users"
    ON users
    FOR UPDATE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users users_1
      WHERE users_1.id = auth.uid() AND users_1.role = 'admin'
    ));

  CREATE POLICY "Admins can delete users"
    ON users
    FOR DELETE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users users_1
      WHERE users_1.id = auth.uid() AND users_1.role = 'admin'
    ));
END $$;

-- Policy per patients
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Coordinators can read all patients" ON patients;
  DROP POLICY IF EXISTS "Staff can read assigned patients" ON patients;
  DROP POLICY IF EXISTS "Coordinators can insert patients" ON patients;
  DROP POLICY IF EXISTS "Coordinators can update patients" ON patients;
  DROP POLICY IF EXISTS "Coordinators can delete patients" ON patients;

  -- Create policies
  CREATE POLICY "Coordinators can read all patients"
    ON patients
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));

  CREATE POLICY "Staff can read assigned patients"
    ON patients
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'staff' AND (auth.uid())::text = ANY (patients.assigned_staff)
    ));

  CREATE POLICY "Coordinators can insert patients"
    ON patients
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));

  CREATE POLICY "Coordinators can update patients"
    ON patients
    FOR UPDATE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));

  CREATE POLICY "Coordinators can delete patients"
    ON patients
    FOR DELETE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));
END $$;

-- Policy per medical_records
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Coordinators can read all medical records" ON medical_records;
  DROP POLICY IF EXISTS "Staff can read records of assigned patients" ON medical_records;
  DROP POLICY IF EXISTS "Staff can insert records" ON medical_records;
  DROP POLICY IF EXISTS "Coordinators can update records" ON medical_records;
  DROP POLICY IF EXISTS "Coordinators can delete records" ON medical_records;

  -- Create policies
  CREATE POLICY "Coordinators can read all medical records"
    ON medical_records
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));

  CREATE POLICY "Staff can read records of assigned patients"
    ON medical_records
    FOR SELECT
    TO authenticated
    USING ((EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_records.patient_id AND ((auth.uid())::text = ANY (patients.assigned_staff))
    )) OR (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )));

  CREATE POLICY "Staff can insert records"
    ON medical_records
    FOR INSERT
    TO authenticated
    WITH CHECK ((staff_id = auth.uid()) OR (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )));

  CREATE POLICY "Coordinators can update records"
    ON medical_records
    FOR UPDATE
    TO authenticated
    USING ((staff_id = auth.uid()) OR (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )));

  CREATE POLICY "Coordinators can delete records"
    ON medical_records
    FOR DELETE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));
END $$;

-- Policy per appointments
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Staff can read own appointments" ON appointments;
  DROP POLICY IF EXISTS "Coordinators can insert appointments" ON appointments;
  DROP POLICY IF EXISTS "Staff can update own appointments" ON appointments;
  DROP POLICY IF EXISTS "Coordinators can delete appointments" ON appointments;

  -- Create policies
  CREATE POLICY "Staff can read own appointments"
    ON appointments
    FOR SELECT
    TO authenticated
    USING ((staff_id = auth.uid()) OR (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )));

  CREATE POLICY "Coordinators can insert appointments"
    ON appointments
    FOR INSERT
    TO authenticated
    WITH CHECK ((staff_id = auth.uid()) OR (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )));

  CREATE POLICY "Staff can update own appointments"
    ON appointments
    FOR UPDATE
    TO authenticated
    USING ((staff_id = auth.uid()) OR (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )));

  CREATE POLICY "Coordinators can delete appointments"
    ON appointments
    FOR DELETE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));
END $$;

-- Policy per time_entries
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can read own time entries" ON time_entries;
  DROP POLICY IF EXISTS "Users can insert own time entries" ON time_entries;
  DROP POLICY IF EXISTS "Users can update own time entries" ON time_entries;
  DROP POLICY IF EXISTS "Coordinators can delete time entries" ON time_entries;

  -- Create policies
  CREATE POLICY "Users can read own time entries"
    ON time_entries
    FOR SELECT
    TO authenticated
    USING ((user_id = auth.uid()) OR (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )));

  CREATE POLICY "Users can insert own time entries"
    ON time_entries
    FOR INSERT
    TO authenticated
    WITH CHECK ((user_id = auth.uid()) OR (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )));

  CREATE POLICY "Users can update own time entries"
    ON time_entries
    FOR UPDATE
    TO authenticated
    USING ((user_id = auth.uid()) OR (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    )));

  CREATE POLICY "Coordinators can delete time entries"
    ON time_entries
    FOR DELETE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));
END $$;

-- Policy per invoices
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Coordinators and admins can read invoices" ON invoices;
  DROP POLICY IF EXISTS "Coordinators and admins can insert invoices" ON invoices;
  DROP POLICY IF EXISTS "Coordinators and admins can update invoices" ON invoices;
  DROP POLICY IF EXISTS "Coordinators and admins can delete invoices" ON invoices;

  -- Create policies
  CREATE POLICY "Coordinators and admins can read invoices"
    ON invoices
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));

  CREATE POLICY "Coordinators and admins can insert invoices"
    ON invoices
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));

  CREATE POLICY "Coordinators and admins can update invoices"
    ON invoices
    FOR UPDATE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));

  CREATE POLICY "Coordinators and admins can delete invoices"
    ON invoices
    FOR DELETE
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));
END $$;

-- Policy per notifications
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
  DROP POLICY IF EXISTS "Coordinators and admins can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;

  -- Create policies
  CREATE POLICY "Users can read own notifications"
    ON notifications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can update own notifications"
    ON notifications
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Coordinators and admins can insert notifications"
    ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));

  CREATE POLICY "System can insert notifications"
    ON notifications
    FOR INSERT
    TO service_role
    WITH CHECK (true);

  CREATE POLICY "Users can insert own notifications"
    ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
END $$;

-- Policy per push_subscriptions
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can read own push subscriptions" ON push_subscriptions;
  DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON push_subscriptions;
  DROP POLICY IF EXISTS "Users can update own push subscriptions" ON push_subscriptions;
  DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON push_subscriptions;
  DROP POLICY IF EXISTS "Coordinators can manage all push subscriptions" ON push_subscriptions;

  -- Create policies
  CREATE POLICY "Users can read own push subscriptions"
    ON push_subscriptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can insert own push subscriptions"
    ON push_subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

  CREATE POLICY "Users can update own push subscriptions"
    ON push_subscriptions
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can delete own push subscriptions"
    ON push_subscriptions
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Coordinators can manage all push subscriptions"
    ON push_subscriptions
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'coordinator' OR users.role = 'admin')
    ));
END $$;