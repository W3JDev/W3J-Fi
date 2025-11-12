import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'data', 'w3jfi.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const initSQL = `
-- Polls table
CREATE TABLE IF NOT EXISTS polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  question1 TEXT NOT NULL,
  question2 TEXT NOT NULL,
  question3 TEXT,
  question4 TEXT,
  question5 TEXT,
  is_draft INTEGER DEFAULT 0,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL,
  voter_id TEXT NOT NULL,
  choice INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  UNIQUE(poll_id, voter_id)
);

-- Lottery Sessions table
CREATE TABLE IF NOT EXISTS lottery_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  participants TEXT NOT NULL,
  prizes TEXT NOT NULL,
  winners TEXT NOT NULL,
  settings TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_polls_short_code ON polls(short_code);
CREATE INDEX IF NOT EXISTS idx_polls_dates ON polls(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_lottery_sessions_session_id ON lottery_sessions(session_id);
`;

try {
  db.exec(initSQL);
  console.log('✅ Database initialized successfully!');
  console.log('📁 Database location: data/w3jfi.db');
} catch (error) {
  console.error('❌ Error initializing database:', error);
  process.exit(1);
}

db.close();
