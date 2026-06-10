ALTER TABLE training_logs
  ADD COLUMN IF NOT EXISTS end_date DATE;

UPDATE training_logs
SET end_date = date
WHERE end_date IS NULL;
