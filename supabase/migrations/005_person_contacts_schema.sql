ALTER TABLE contacts ADD COLUMN IF NOT EXISTS license_number TEXT;

INSERT INTO contacts (id, user_id, horse_id, role, name, phone, notes, license_number, created_at)
SELECT id, user_id, horse_id, 'reiter'::contact_role, name, phone, notes, license_number, created_at
FROM riders
ON CONFLICT (id) DO NOTHING;

ALTER TABLE health_records
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

ALTER TABLE training_logs
  ADD COLUMN IF NOT EXISTS rider_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS trainer_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

UPDATE tournaments SET contact_id = rider_id WHERE rider_id IS NOT NULL AND contact_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_horse_role ON contacts(horse_id, role);
CREATE INDEX IF NOT EXISTS idx_health_records_contact ON health_records(contact_id);
CREATE INDEX IF NOT EXISTS idx_training_logs_rider ON training_logs(rider_contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_contact ON appointments(contact_id);
