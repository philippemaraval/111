ALTER TABLE proposals ADD COLUMN objective TEXT NOT NULL DEFAULT 'engagement';
ALTER TABLE proposals ADD COLUMN published_at TEXT;
ALTER TABLE generation_jobs ADD COLUMN neighborhood TEXT;
ALTER TABLE generation_jobs ADD COLUMN objective TEXT;
