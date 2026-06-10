ALTER TABLE health_records
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_health_records_appointment ON health_records(appointment_id);

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
    WHERE next_due_date IS NOT NULL
      AND appointment_id IS NULL
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

    INSERT INTO appointments (
      user_id,
      horse_id,
      type,
      title,
      description,
      starts_at,
      all_day,
      status,
      contact_id,
      reminder_days_before
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
      (rec.next_due_date || 'T09:00:00')::timestamptz,
      true,
      'geplant',
      rec.contact_id,
      7
    )
    RETURNING id INTO appt_id;

    UPDATE health_records
    SET appointment_id = appt_id
    WHERE id = rec.id;
  END LOOP;
END $$;
