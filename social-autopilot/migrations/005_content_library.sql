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

INSERT OR IGNORE INTO content_items (id,created_at,updated_at,type,title,facts,destination_url,readiness) VALUES
('brand-111',datetime('now'),datetime('now'),'brand','La marque 111','Marque imaginée à Marseille. 111 fait référence aux 111 quartiers officiels de Marseille. Production en séries courtes.','https://111.sunmedia.workers.dev/histoire','ready'),
('city-marseille',datetime('now'),datetime('now'),'city','Marseille','La marque raconte Marseille à travers ses quartiers, ses identités, ses lieux et ses habitants.','https://111.sunmedia.workers.dev','ready'),
('product-la-joliette',datetime('now'),datetime('now'),'product','T-shirt La Joliette','T-shirt de la collection 111. Prix affiché : 25 euros.','https://111.sunmedia.workers.dev/quartier/la-joliette','ready'),
('product-notre-dame-du-mont',datetime('now'),datetime('now'),'product','T-shirt Notre-Dame-du-Mont','Édition annoncée dans la collection. Prix affiché : 25 euros.','https://111.sunmedia.workers.dev/quartier/notre-dame-du-mont','draft'),
('product-sainte-anne',datetime('now'),datetime('now'),'product','T-shirt Sainte-Anne','Édition annoncée dans la collection. Prix affiché : 25 euros.','https://111.sunmedia.workers.dev/quartier/sainte-anne','draft'),
('product-cinq-avenues',datetime('now'),datetime('now'),'product','T-shirt Cinq-Avenues','Édition annoncée dans la collection. Prix affiché : 25 euros.','https://111.sunmedia.workers.dev/quartier/cinq-avenues','draft'),
('product-mazargues',datetime('now'),datetime('now'),'product','T-shirt Mazargues','Édition annoncée dans la collection. Prix affiché : 25 euros.','https://111.sunmedia.workers.dev/quartier/mazargues','draft');
