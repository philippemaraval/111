ALTER TABLE proposals ADD COLUMN subject_type TEXT NOT NULL DEFAULT 'neighborhood';
ALTER TABLE proposals ADD COLUMN brief TEXT;
ALTER TABLE generation_jobs ADD COLUMN subject_type TEXT;
ALTER TABLE generation_jobs ADD COLUMN brief TEXT;
