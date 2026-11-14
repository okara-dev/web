-- ============================================================
-- EMORA DATENBANK-SCHEMA (Supabase)
-- ============================================================

-- ===== USERS =====
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    supabase_uid UUID UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== ENTRIES =====
CREATE TABLE IF NOT EXISTS entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    content TEXT NOT NULL,
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
    mood_tags TEXT[],
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, entry_date)
);

-- ===== TODOS =====
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'not-urgent-not-important',
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== PASSIONS =====
CREATE TABLE IF NOT EXISTS passions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10) DEFAULT '❤️',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== LETTERS =====
CREATE TABLE IF NOT EXISTS letters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'month',
    open_date TIMESTAMP NOT NULL,
    is_opened BOOLEAN DEFAULT FALSE,
    opened_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== INDIZES =====
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_entry_date ON entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_mood_score ON entries(mood_score);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON todos(is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_passions_user_id ON passions(user_id);
CREATE INDEX IF NOT EXISTS idx_passions_is_active ON passions(is_active);
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON letters(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_open_date ON letters(open_date);
CREATE INDEX IF NOT EXISTS idx_letters_is_opened ON letters(is_opened);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON users(supabase_uid);

-- ============================================================
-- RLS AKTIVIEREN (WICHTIG: VOR den Policies!)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE passions ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- ===== USERS =====
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (supabase_uid = auth.uid());

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (supabase_uid = auth.uid());

-- ===== ENTRIES =====
CREATE POLICY "Users see own entries"
    ON entries FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users insert own entries"
    ON entries FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users update own entries"
    ON entries FOR UPDATE
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users delete own entries"
    ON entries FOR DELETE
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- ===== TODOS =====
CREATE POLICY "Users see own todos"
    ON todos FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users insert own todos"
    ON todos FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users update own todos"
    ON todos FOR UPDATE
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users delete own todos"
    ON todos FOR DELETE
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- ===== PASSIONS =====
CREATE POLICY "Users see own passions"
    ON passions FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users insert own passions"
    ON passions FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users update own passions"
    ON passions FOR UPDATE
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users delete own passions"
    ON passions FOR DELETE
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- ===== LETTERS =====
CREATE POLICY "Users see own letters"
    ON letters FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users insert own letters"
    ON letters FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users update own letters"
    ON letters FOR UPDATE
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));

CREATE POLICY "Users delete own letters"
    ON letters FOR DELETE
    USING (user_id IN (SELECT id FROM users WHERE supabase_uid = auth.uid()));