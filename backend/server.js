import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const adapter = new JSONFile(join(dataDir, 'db.json'));
const defaultData = { polls: [], votes: [], lotterySessions: [] };
const db = new Low(adapter, defaultData);
await db.read();
db.data ||= defaultData;
await db.write();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// SSE connections map
const sseClients = new Map();

// Helper: Generate short code
function generateShortCode() {
  return nanoid(8).toUpperCase();
}

// Helper: Broadcast to SSE clients
function broadcast(pollId, data) {
  const clients = sseClients.get(pollId) || [];
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(res => res.write(message));
}

// ============================================
// POLL ROUTES
// ============================================

// GET /api/polls - List all polls
app.get('/api/polls', (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM polls';
    const params = [];

    if (status === 'active') {
      query += ' WHERE is_draft = 0 AND datetime(start_at) <= datetime("now") AND datetime(end_at) >= datetime("now")';
    } else if (status === 'draft') {
      query += ' WHERE is_draft = 1';
    } else if (status === 'expired') {
      query += ' WHERE is_draft = 0 AND datetime(end_at) < datetime("now")';
    }

    query += ' ORDER BY created_at DESC';

    const polls = db.prepare(query).all(...params);

    // Get vote counts for each poll
    const pollsWithVotes = polls.map(poll => {
      const voteCount = db.prepare('SELECT COUNT(*) as count FROM votes WHERE poll_id = ?').get(poll.id);
      return { ...poll, voteCount: voteCount.count };
    });

    res.json(pollsWithVotes);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// GET /api/polls/:shortCode - Get poll by short code
app.get('/api/polls/:shortCode', (req, res) => {
  try {
    const { shortCode } = req.params;
    const poll = db.prepare('SELECT * FROM polls WHERE short_code = ?').get(shortCode);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Get votes
    const votes = db.prepare('SELECT * FROM votes WHERE poll_id = ?').all(poll.id);

    res.json({ ...poll, votes });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// POST /api/polls - Create new poll
app.post('/api/polls', (req, res) => {
  try {
    const { title, question1, question2, question3, question4, question5, duration, isDraft } = req.body;

    // Validation
    if (!title || !question1 || !question2) {
      return res.status(400).json({ error: 'Title and at least 2 questions are required' });
    }

    const shortCode = generateShortCode();
    const startAt = new Date().toISOString();
    const endAt = new Date(Date.now() + (duration || 60) * 1000).toISOString();

    const stmt = db.prepare(`
      INSERT INTO polls (short_code, title, question1, question2, question3, question4, question5, is_draft, start_at, end_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      shortCode,
      title,
      question1,
      question2,
      question3 || null,
      question4 || null,
      question5 || null,
      isDraft ? 1 : 0,
      startAt,
      endAt
    );

    const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// POST /api/polls/:shortCode/vote - Submit vote
app.post('/api/polls/:shortCode/vote', (req, res) => {
  try {
    const { shortCode } = req.params;
    const { choice, voterId } = req.body;

    // Validation
    if (!choice || !voterId) {
      return res.status(400).json({ error: 'Choice and voterId are required' });
    }

    if (choice < 1 || choice > 5) {
      return res.status(400).json({ error: 'Choice must be between 1 and 5' });
    }

    // Get poll
    const poll = db.prepare('SELECT * FROM polls WHERE short_code = ?').get(shortCode);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll is active
    const now = new Date();
    const startAt = new Date(poll.start_at);
    const endAt = new Date(poll.end_at);

    if (now < startAt || now > endAt) {
      return res.status(400).json({ error: 'Poll is not active' });
    }

    // Check if already voted
    const existingVote = db.prepare('SELECT * FROM votes WHERE poll_id = ? AND voter_id = ?').get(poll.id, voterId);
    if (existingVote) {
      return res.status(400).json({ error: 'Already voted' });
    }

    // Insert vote
    const stmt = db.prepare('INSERT INTO votes (poll_id, voter_id, choice) VALUES (?, ?, ?)');
    const result = stmt.run(poll.id, voterId, choice);

    const vote = db.prepare('SELECT * FROM votes WHERE id = ?').get(result.lastInsertRowid);

    // Broadcast to SSE clients
    broadcast(poll.id, { type: 'vote', vote });

    res.status(201).json(vote);
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// GET /api/polls/:shortCode/results - Get poll results
app.get('/api/polls/:shortCode/results', (req, res) => {
  try {
    const { shortCode } = req.params;
    const poll = db.prepare('SELECT * FROM polls WHERE short_code = ?').get(shortCode);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Get vote distribution
    const votes = db.prepare('SELECT choice, COUNT(*) as count FROM votes WHERE poll_id = ? GROUP BY choice').all(poll.id);

    const results = {
      poll,
      totalVotes: votes.reduce((sum, v) => sum + v.count, 0),
      distribution: votes,
    };

    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// DELETE /api/polls/:shortCode - Delete poll
app.delete('/api/polls/:shortCode', (req, res) => {
  try {
    const { shortCode } = req.params;
    const poll = db.prepare('SELECT * FROM polls WHERE short_code = ?').get(shortCode);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    db.prepare('DELETE FROM polls WHERE id = ?').run(poll.id);

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
});

// ============================================
// SSE ROUTE FOR LIVE UPDATES
// ============================================

app.get('/api/polls/:shortCode/live', (req, res) => {
  const { shortCode } = req.params;

  // Get poll
  const poll = db.prepare('SELECT * FROM polls WHERE short_code = ?').get(shortCode);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Add client to map
  if (!sseClients.has(poll.id)) {
    sseClients.set(poll.id, []);
  }
  sseClients.get(poll.id).push(res);

  // Send initial data
  res.write(`data: ${JSON.stringify({ type: 'connected', pollId: poll.id })}\n\n`);

  // Remove client on close
  req.on('close', () => {
    const clients = sseClients.get(poll.id) || [];
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
    }
    if (clients.length === 0) {
      sseClients.delete(poll.id);
    }
  });
});

// ============================================
// LOTTERY SESSION ROUTES
// ============================================

// GET /api/lottery/sessions - List lottery sessions
app.get('/api/lottery/sessions', async (req, res) => {
  try {
    await db.read();
    const sessions = db.data.lotterySessions || [];
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

// GET /api/lottery/sessions/:sessionId - Get lottery session
app.get('/api/lottery/sessions/:sessionId', async (req, res) => {
  try {
    await db.read();
    const { sessionId } = req.params;
    const session = db.data.lotterySessions.find(s => s.id === sessionId);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch session' });
  }
});

// POST /api/lottery/sessions - Create/Update lottery session
app.post('/api/lottery/sessions', async (req, res) => {
  try {
    await db.read();
    const { id, name, participants, prizes, winners, settings } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'name is required' });
    }

    const sessionId = id || `lottery-session-${Date.now()}`;
    const now = new Date().toISOString();

    // Check if session exists
    const existingIndex = db.data.lotterySessions.findIndex(s => s.id === sessionId);

    if (existingIndex !== -1) {
      // Update existing session
      db.data.lotterySessions[existingIndex] = {
        ...db.data.lotterySessions[existingIndex],
        name,
        participants: participants || [],
        prizes: prizes || [],
        winners: winners || [],
        settings: settings || null,
        updatedAt: now
      };
      await db.write();
      res.json({ success: true, data: db.data.lotterySessions[existingIndex] });
    } else {
      // Create new session
      const newSession = {
        id: sessionId,
        name,
        participants: participants || [],
        prizes: prizes || [],
        winners: winners || [],
        drawHistory: [],
        settings: settings || null,
        createdAt: now,
        updatedAt: now
      };
      db.data.lotterySessions.push(newSession);
      await db.write();
      res.json({ success: true, data: newSession });
    }
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ success: false, error: 'Failed to save session' });
  }
});

// DELETE /api/lottery/sessions/:sessionId - Delete lottery session
app.delete('/api/lottery/sessions/:sessionId', async (req, res) => {
  try {
    await db.read();
    const { sessionId } = req.params;
    const initialLength = db.data.lotterySessions.length;
    db.data.lotterySessions = db.data.lotterySessions.filter(s => s.id !== sessionId);
    
    if (db.data.lotterySessions.length < initialLength) {
      await db.write();
      res.json({ success: true, message: 'Session deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Session not found' });
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, error: 'Failed to delete session' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
    version: '1.0.0'
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n✅ W3JFi Backend Server is running!`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Database: data/w3jfi.db\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close();
  process.exit(0);
});
