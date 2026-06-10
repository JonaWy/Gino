ALTER TABLE training_logs
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

ALTER TABLE health_records
  ADD COLUMN IF NOT EXISTS date_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_training_logs_appointment ON training_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date_appointment ON health_records(date_appointment_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_appointment ON tournaments(appointment_id);

-- Backfill health treatment dates
DO $$
DECLARE
  rec RECORD;
  appt_id UUID;
  appt_type appointment_type;
  appt_title TEXT;
BEGIN
  FOR rec IN
    SELECT *
    FROM health_records
    WHERE date_appointment_id IS NULL
  LOOP
    appt_type := CASE
      WHEN rec.type = 'impfung' THEN 'impfung'::appointment_type
      ELSE 'tierarzt'::appointment_type
    END;

    appt_title := CASE rec.type
      WHEN 'impfung' THEN 'Impfung'
      WHEN 'entwurmung' THEN 'Entwurmung'
      WHEN 'zahnarzt' THEN 'Zahnarzt'
      ELSE 'Gesundheit'
    END;

    IF rec.product_name IS NOT NULL AND trim(rec.product_name) <> '' THEN
      appt_title := appt_title || ': ' || rec.product_name;
    END IF;

    appt_title := appt_title || ' (durchgeführt)';

    INSERT INTO appointments (
      user_id, horse_id, type, title, description,
      starts_at, all_day, status, contact_id
    )
    VALUES (
      rec.user_id,
      rec.horse_id,
      appt_type,
      appt_title,
      NULLIF(trim(concat_ws(E'\n',
        CASE WHEN rec.vet_name IS NOT NULL THEN 'Tierarzt: ' || rec.vet_name END,
        rec.notes
      )), ''),
      (rec.date || 'T09:00:00')::timestamptz,
      true,
      'erledigt',
      rec.contact_id
    )
    RETURNING id INTO appt_id;

    UPDATE health_records
    SET date_appointment_id = appt_id
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Backfill training logs
DO $$
DECLARE
  rec RECORD;
  appt_id UUID;
  end_date DATE;
  appt_title TEXT;
  appt_status appointment_status;
BEGIN
  FOR rec IN
    SELECT *
    FROM training_logs
    WHERE appointment_id IS NULL
  LOOP
    end_date := COALESCE(rec.end_date, rec.date);
    appt_title := CASE
      WHEN rec.focus IS NOT NULL AND trim(rec.focus) <> '' THEN 'Training: ' || rec.focus
      ELSE 'Training'
    END;
    appt_status := CASE
      WHEN end_date < CURRENT_DATE THEN 'erledigt'::appointment_status
      ELSE 'geplant'::appointment_status
    END;

    INSERT INTO appointments (
      user_id, horse_id, type, title, description,
      starts_at, ends_at, all_day, status, contact_id
    )
    VALUES (
      rec.user_id,
      rec.horse_id,
      'training',
      appt_title,
      NULLIF(trim(concat_ws(E'\n',
        CASE WHEN rec.rider_name IS NOT NULL THEN 'Reiter: ' || rec.rider_name END,
        rec.notes
      )), ''),
      (rec.date || 'T09:00:00')::timestamptz,
      CASE
        WHEN end_date <> rec.date THEN (end_date || 'T17:00:00')::timestamptz
        ELSE NULL
      END,
      true,
      appt_status,
      COALESCE(rec.trainer_contact_id, rec.rider_contact_id)
    )
    RETURNING id INTO appt_id;

    UPDATE training_logs
    SET appointment_id = appt_id
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Backfill tournaments
DO $$
DECLARE
  rec RECORD;
  appt_id UUID;
  appt_status appointment_status;
BEGIN
  FOR rec IN
    SELECT *
    FROM tournaments
    WHERE appointment_id IS NULL
  LOOP
    appt_status := CASE
      WHEN rec.date < CURRENT_DATE THEN 'erledigt'::appointment_status
      ELSE 'geplant'::appointment_status
    END;

    INSERT INTO appointments (
      user_id, horse_id, type, title, description, location,
      starts_at, all_day, status, contact_id
    )
    VALUES (
      rec.user_id,
      rec.horse_id,
      'turnier',
      rec.name,
      NULLIF(trim(concat_ws(E'\n',
        CASE WHEN rec.discipline IS NOT NULL THEN 'Disziplin: ' || rec.discipline END,
        CASE WHEN rec.rider_name IS NOT NULL THEN 'Reiter: ' || rec.rider_name END,
        rec.notes
      )), ''),
      rec.location,
      (rec.date || 'T09:00:00')::timestamptz,
      true,
      appt_status,
      rec.contact_id
    )
    RETURNING id INTO appt_id;

    UPDATE tournaments
    SET appointment_id = appt_id
    WHERE id = rec.id;
  END LOOP;
END $$;
