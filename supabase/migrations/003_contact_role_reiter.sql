-- Enum-Werte müssen in separaten Migrationen stehen (PostgreSQL-Transaktionsregel)
ALTER TYPE contact_role ADD VALUE IF NOT EXISTS 'reiter';
