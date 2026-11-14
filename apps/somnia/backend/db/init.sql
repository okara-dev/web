CREATE DATABASE dreamweaver;

\c dreamweaver;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP,
    checkout_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dreams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    dream_text TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sleep_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sleep_date DATE NOT NULL,
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, sleep_date)
);

CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dream_id UUID REFERENCES dreams(id) ON DELETE SET NULL,
    dream_text TEXT NOT NULL,
    analysis JSONB NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_date ON dreams(date);
CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sleep_entries_user_id ON sleep_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_entries_date ON sleep_entries(sleep_date);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger für dreams
DROP TRIGGER IF EXISTS update_dreams_updated_at ON dreams;
CREATE TRIGGER update_dreams_updated_at 
    BEFORE UPDATE ON dreams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger für sleep_entries
DROP TRIGGER IF EXISTS update_sleep_entries_updated_at ON sleep_entries;
CREATE TRIGGER update_sleep_entries_updated_at 
    BEFORE UPDATE ON sleep_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

