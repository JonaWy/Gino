CREATE TABLE horse_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  report_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  xray_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_horse_conditions_horse ON horse_conditions(horse_id);

ALTER TABLE horse_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own horse_conditions" ON horse_conditions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO horse_conditions (user_id, horse_id, name)
SELECT
  h.user_id,
  h.id,
  trim(part)
FROM horses h
CROSS JOIN LATERAL regexp_split_to_table(h.known_conditions, E'[,\\n]+') AS part
WHERE h.known_conditions IS NOT NULL
  AND trim(part) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM horse_conditions hc WHERE hc.horse_id = h.id
  );
