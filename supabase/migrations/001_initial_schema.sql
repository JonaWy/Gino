-- Gino Pferde-Management App Schema

-- Enums
CREATE TYPE appointment_type AS ENUM (
  'impfung', 'tierarzt', 'schmied', 'turnier', 'training', 'sonstiges'
);
CREATE TYPE appointment_status AS ENUM ('geplant', 'erledigt', 'abgesagt');
CREATE TYPE expense_category AS ENUM (
  'tierarzt', 'schmied', 'turnier', 'futter', 'versicherung', 'sonstiges'
);
CREATE TYPE contact_role AS ENUM (
  'tierarzt', 'schmied', 'stall', 'transport', 'sonstiges'
);
CREATE TYPE document_type AS ENUM (
  'pferdepass', 'versicherung', 'roentgen', 'kaufvertrag', 'impfnachweis', 'sonstiges'
);
CREATE TYPE health_record_type AS ENUM (
  'impfung', 'entwurmung', 'zahnarzt', 'sonstiges'
);

-- Horses
CREATE TABLE horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  gender TEXT,
  color TEXT,
  chip_number TEXT,
  passport_number TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Riders
CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  license_number TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  type appointment_type NOT NULL DEFAULT 'sonstiges',
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT false,
  status appointment_status NOT NULL DEFAULT 'geplant',
  recurrence TEXT,
  reminder_days_before INTEGER,
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  discipline TEXT,
  rating TEXT,
  placement INTEGER,
  rider_name TEXT,
  rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
  prize_money NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vital Records
CREATE TABLE vital_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  recorded_at DATE NOT NULL,
  weight_kg NUMERIC(6,2),
  height_cm NUMERIC(6,2),
  tournament_earnings_total NUMERIC(12,2),
  estimated_value NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  is_estimated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cost Defaults
CREATE TABLE cost_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  default_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, horse_id, category)
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  type document_type NOT NULL DEFAULT 'sonstiges',
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  expires_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Health Records
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  type health_record_type NOT NULL,
  product_name TEXT,
  date DATE NOT NULL,
  next_due_date DATE,
  vet_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Training Logs
CREATE TABLE training_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration_minutes INTEGER,
  focus TEXT,
  intensity TEXT,
  notes TEXT,
  rider_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  role contact_role NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_horses_user ON horses(user_id);
CREATE INDEX idx_appointments_horse ON appointments(horse_id);
CREATE INDEX idx_appointments_starts ON appointments(starts_at);
CREATE INDEX idx_tournaments_horse ON tournaments(horse_id);
CREATE INDEX idx_expenses_horse ON expenses(horse_id);
CREATE INDEX idx_expenses_date ON expenses(date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER horses_updated_at BEFORE UPDATE ON horses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own horses" ON horses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own riders" ON riders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own appointments" ON appointments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own tournaments" ON tournaments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own vital_records" ON vital_records
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own cost_defaults" ON cost_defaults
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own documents" ON documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own health_records" ON health_records
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own training_logs" ON training_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage buckets (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('horse-images', 'horse-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
