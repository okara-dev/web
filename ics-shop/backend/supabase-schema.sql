-- ============ USERS TABLE ============
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    lemon_squeezy_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- ============ SHOP EBOOKS ============
CREATE TABLE shop_ebooks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    file_name VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ USER SHOP EBOOKS ============
CREATE TABLE user_shop_ebooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ebook_id INTEGER REFERENCES shop_ebooks(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_token VARCHAR(255) UNIQUE,
    downloaded_at TIMESTAMP,
    UNIQUE(user_id, ebook_id)
);

-- ============ BUNDLE (Transformation Bundle) ============
CREATE TABLE bundles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ BUNDLE EBOOKS (eBooks im Bundle) ============
CREATE TABLE bundle_ebooks (
    id SERIAL PRIMARY KEY,
    bundle_id INTEGER REFERENCES bundles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ USER BUNDLE ============
CREATE TABLE user_bundles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bundle_id INTEGER REFERENCES bundles(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, bundle_id)
);

-- ============ USER BUNDLE EBOOKS ============
CREATE TABLE user_bundle_ebooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bundle_ebook_id INTEGER REFERENCES bundle_ebooks(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP,
    download_token VARCHAR(255) UNIQUE,
    UNIQUE(user_id, bundle_ebook_id)
);

-- ============ INSERT SHOP EBOOKS ============
-- 3 Kostenlose eBooks
INSERT INTO shop_ebooks (title, slug, description, price, is_free, file_name, sort_order) VALUES
('Die Stille in dir', 'die-stille-in-dir', 'Das Gefühl der Leere und Einsamkeit verstehen und überwinden – 8 Kapitel', 0, true, 'die-stille-in-dir.pdf', 1),
('Tiefencode', 'tiefencode', 'Programmiere dein Unterbewusstsein neu – Die geheimen Skripte deiner Psyche – 11 Kapitel', 0, true, 'der-tiefencode.pdf', 2),
('Hardware Update', 'hardware-update', 'Optimiere dein mentales Betriebssystem für maximale Performance – 12 Kapitel', 0, true, 'hardware-update.pdf', 3);

-- 6 Kostenpflichtige Shop-eBooks (ehemals Phase 4-5 + 2 weitere)
INSERT INTO shop_ebooks (title, slug, description, price, is_free, file_name, sort_order) VALUES
('Dark Mirror', 'dark-mirror', 'Erkenne Manipulation – Schütze dich vor psychologischen Angriffen', 9.99, false, 'dark-mirror.pdf', 4),
('Das Schattenband', 'das-schattenband', 'Optimiere dein äußeres Erscheinungsbild – Das Beste aus dir machen', 9.99, false, 'das-schattenband.pdf', 5),
('Der geteilte Kreis', 'der-geteilte-kreis', 'Die Psychologie der Frau – Verstehen, verbinden, begeistern', 9.99, false, 'der-geteilte-kreis.pdf', 6),
('Der einsame Jäger', 'der-einsame-jaeger', 'Die Psyche des Mannes – Stärke, Fokus, Entschlossenheit', 9.99, false, 'der-einsame-jaeger.pdf', 7);

-- ============ INSERT BUNDLE ============
INSERT INTO bundles (name, slug, description, price, sort_order) VALUES
('Transformation Bundle', 'transformation-bundle', 'Das komplette Bundle für deine Transformation – 6 eBooks', 39.00, 1);

-- ============ INSERT BUNDLE EBOOKS ============
INSERT INTO bundle_ebooks (bundle_id, title, slug, description, file_name, sort_order) VALUES
(1, 'Der Innere Thron', 'der-innere-thron', 'Meistere deine Emotionen und Gefühle – Setze dich auf deinen eigenen Thron', 'der-innere-thron.pdf', 1),
(1, 'Ich.exe', 'ich-exe', 'Deine wahre Identität – Wer du wirklich bist, wenn alle Masken fallen', 'ich-exe.pdf', 2),
(1, 'Der Gedankenjäger', 'der-gedankenjaeger', 'Jage negative Gedanken und reprogrammiere dein Mindset', 'der-gedankenjaeger.pdf', 3),
(1, 'Das Gravitationsfeld', 'das-gravitationsfeld', 'Baue unwiderstehliches Charisma und magnetische Ausstrahlung auf', 'das-gravitationsfeld.pdf', 4),
(1, 'Der unsichtbare Schlüssel', 'der-unsichtbare-schluessel', 'Lerne Menschen zu lesen wie ein offenes Buch', 'der-unsichtbare-schluessel.pdf', 5),
(1, 'Der evolutionäre Spieler', 'der-evolutionaere-spieler', 'Verstehe die tiefen evolutionären Treiber des menschlichen Verhaltens', 'der-evolutionaere-spieler.pdf', 6);

-- ============ INDEXES ============
CREATE INDEX idx_user_shop_ebooks_user ON user_shop_ebooks(user_id);
CREATE INDEX idx_user_shop_ebooks_ebook ON user_shop_ebooks(ebook_id);
CREATE INDEX idx_user_bundles_user ON user_bundles(user_id);
CREATE INDEX idx_user_bundles_bundle ON user_bundles(bundle_id);
CREATE INDEX idx_user_bundle_ebooks_user ON user_bundle_ebooks(user_id);
CREATE INDEX idx_shop_ebooks_slug ON shop_ebooks(slug);
CREATE INDEX idx_bundles_slug ON bundles(slug);
CREATE INDEX idx_bundle_ebooks_bundle ON bundle_ebooks(bundle_id);
CREATE INDEX idx_bundle_ebooks_slug ON bundle_ebooks(slug);