ALTER TABLE proposals ADD COLUMN instagram_format TEXT NOT NULL DEFAULT 'post';
ALTER TABLE proposals ADD COLUMN instagram_media_urls TEXT;
ALTER TABLE proposals ADD COLUMN tiktok_format TEXT NOT NULL DEFAULT 'photo';
ALTER TABLE proposals ADD COLUMN tiktok_media_url TEXT;
ALTER TABLE proposals ADD COLUMN x_format TEXT NOT NULL DEFAULT 'image';
ALTER TABLE proposals ADD COLUMN x_media_url TEXT;
