ALTER TABLE generation_jobs ADD COLUMN text_length TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE generation_jobs ADD COLUMN hashtag_count INTEGER NOT NULL DEFAULT 3;
ALTER TABLE generation_jobs ADD COLUMN recurring_hashtags TEXT;
