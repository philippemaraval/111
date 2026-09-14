CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  neighborhood TEXT NOT NULL,
  hook TEXT NOT NULL,
  instagram_text TEXT NOT NULL,
  tiktok_text TEXT NOT NULL,
  x_text TEXT NOT NULL,
  visual_prompt TEXT NOT NULL,
  media_key TEXT NOT NULL,
  media_url TEXT NOT NULL,
  proposed_publish_at TEXT NOT NULL,
  approved_at TEXT,
  rejected_at TEXT,
  buffer_instagram_id TEXT,
  buffer_tiktok_id TEXT,
  buffer_x_id TEXT,
  publish_instagram INTEGER NOT NULL DEFAULT 1,
  publish_tiktok INTEGER NOT NULL DEFAULT 1,
  publish_x INTEGER NOT NULL DEFAULT 1,
  objective TEXT NOT NULL DEFAULT 'engagement',
  subject_type TEXT NOT NULL DEFAULT 'neighborhood',
  brief TEXT,
  variant_group_id TEXT,
  variant_index INTEGER NOT NULL DEFAULT 1,
  creative_angle TEXT,
  tone TEXT,
  audience TEXT,
  call_to_action TEXT,
  instagram_alt_text TEXT,
  instagram_carousel TEXT,
  tiktok_script TEXT,
  tiktok_overlay TEXT,
  x_thread TEXT,
  instagram_format TEXT NOT NULL DEFAULT 'post',
  instagram_media_urls TEXT,
  tiktok_format TEXT NOT NULL DEFAULT 'photo',
  tiktok_media_url TEXT,
  x_format TEXT NOT NULL DEFAULT 'image',
  x_media_url TEXT,
  published_at TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_proposals_status_created
ON proposals(status, created_at DESC);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL,
  neighborhood TEXT,
  objective TEXT,
  subject_type TEXT,
  brief TEXT,
  variant_count INTEGER NOT NULL DEFAULT 1,
  tone TEXT,
  audience TEXT,
  call_to_action TEXT,
  text_length TEXT NOT NULL DEFAULT 'medium',
  hashtag_count INTEGER NOT NULL DEFAULT 3,
  recurring_hashtags TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_status_created
ON generation_jobs(status, created_at DESC);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  facts TEXT NOT NULL DEFAULT '',
  media_url TEXT,
  destination_url TEXT,
  readiness TEXT NOT NULL DEFAULT 'draft',
  active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_content_items_active_type ON content_items(active, type, title);
