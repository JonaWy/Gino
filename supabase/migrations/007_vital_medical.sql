ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'arztbericht';

ALTER TABLE horses
  ADD COLUMN IF NOT EXISTS known_conditions TEXT;
