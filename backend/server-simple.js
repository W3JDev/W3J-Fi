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
  clients.forEach(res => {
    try {
      res.write(message);
    } catch (error) {
      console.error('Error broadcasting:', error);
    }
  });
}

// ============================================
// POLL ROUTES
// ============================================

// GET /api/polls - List all polls
app.get('/api/polls', async (req, res) => {
  try {
    await db.read();
    const { status } = req.query;
    let polls = db.data.polls;

    const now = new Date();
    if (status === 'active') {
      polls = polls.filter(p => !p.isDraft && new Date(p.startAt) <= now && new Date(p.endAt) >= now);
    } else if (status === 'draft') {
      polls = polls.filter(p => p.isDraft);
    } else if (status === 'expired') {
      polls = polls.filter(p => !p.isDraft && new Date(p.endAt) < now);
    }

    // Add vote counts
    const pollsWithVotes = polls.map(poll => {
      const voteCount = db.data.votes.filter(v => v.pollId === poll.id).length;
      return { ...poll, voteCount };
    });

    res.json(pollsWithVotes);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// GET /api/polls/:shortCode - Get poll by short code
app.get('/api/polls/:shortCode', async (req, res) => {
  try {
    await db.read();
    const { shortCode } = req.params;
    const poll = db.data.polls.find(p => p.shortCode === shortCode);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Get votes for this poll
    const votes = db.data.votes.filter(v => v.pollId === poll.id);

    res.json({ ...poll, votes });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// POST /api/polls - Create new poll
app.post('/api/polls', async (req, res) => {
  try {
    const { title, question1, question2, question3, question4, question5, duration, isDraft } = req.body;

    // Validation
    if (!title || !question1 || !question2) {
      return res.status(400).json({ error: 'Title and at least 2 questions are required' });
    }

    await db.read();

    const poll = {
      id: Date.now(),
      shortCode: generateShortCode(),
      title,
      question1,
      question2,
      question3: question3 || null,
      question4: question4 || null,
      question5: question5 || null,
      isDraft: isDraft || false,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + (duration || 60) * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.data.polls.push(poll);
    await db.write();

    res.status(201).json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// POST /api/polls/:shortCode/vote - Submit vote
app.post('/api/polls/:shortCode/vote', async (req, res) => {
  try {
    await db.read();
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
    const poll = db.data.polls.find(p => p.shortCode === shortCode);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll is active
    const now = new Date();
    if (now < new Date(poll.startAt) || now > new Date(poll.endAt)) {
      return res.status(400).json({ error: 'Poll is not active' });
    }

    // Check if already voted
    const existingVote = db.data.votes.find(v => v.pollId === poll.id && v.voterId === voterId);
    if (existingVote) {
      return res.status(400).json({ error: 'Already voted' });
    }

    // Create vote
    const vote = {
      id: Date.now(),
      pollId: poll.id,
      voterId,
      choice,
      createdAt: new Date().toISOString(),
    };

    db.data.votes.push(vote);
    await db.write();

    // Broadcast to SSE clients
    broadcast(poll.id, { type: 'vote', vote });

    res.status(201).json(vote);
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// GET /api/polls/:shortCode/results - Get poll results
app.get('/api/polls/:shortCode/results', async (req, res) => {
  try {
    await db.read();
    const { shortCode } = req.params;
    const poll = db.data.polls.find(p => p.shortCode === shortCode);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Get all votes for this poll
    const votes = db.data.votes.filter(v => v.pollId === poll.id);

    // Calculate distribution
    const distribution = {};
    votes.forEach(v => {
      distribution[v.choice] = (distribution[v.choice] || 0) + 1;
    });

    const results = {
      poll,
      totalVotes: votes.length,
      distribution: Object.entries(distribution).map(([choice, count]) => ({
        choice: parseInt(choice),
        count,
      })),
    };

    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// DELETE /api/polls/:shortCode - Delete poll
app.delete('/api/polls/:shortCode', async (req, res) => {
  try {
    await db.read();
    const { shortCode } = req.params;
    const pollIndex = db.data.polls.findIndex(p => p.shortCode === shortCode);

    if (pollIndex === -1) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const poll = db.data.polls[pollIndex];

    // Remove poll and its votes
    db.data.polls.splice(pollIndex, 1);
    db.data.votes = db.data.votes.filter(v => v.pollId !== poll.id);
    await db.write();

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
});

// ============================================
// SSE ROUTE FOR LIVE UPDATES
// ============================================

app.get('/api/polls/:shortCode/live', async (req, res) => {
  try {
    await db.read();
    const { shortCode } = req.params;
    const poll = db.data.polls.find(p => p.shortCode === shortCode);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Add client to map
    if (!sseClients.has(poll.id)) {
      sseClients.set(poll.id, []);
    }
    sseClients.get(poll.id).push(res);

    // Send initial connection message
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
  } catch (error) {
    console.error('Error setting up SSE:', error);
    res.status(500).json({ error: 'Failed to setup live updates' });
  }
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
    const { sessionId, name, participants, prizes, winners, settings } = req.body;

    if (!sessionId || !name) {
      return res.status(400).json({ error: 'sessionId and name are required' });
    }

    const existingIndex = db.data.lotterySessions.findIndex(s => s.sessionId === sessionId);

    if (existingIndex !== -1) {
      // Update existing
      db.data.lotterySessions[existingIndex] = {
        ...db.data.lotterySessions[existingIndex],
        name,
        participants: participants || [],
        prizes: prizes || [],
        winners: winners || [],
        settings: settings || null,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Create new
      db.data.lotterySessions.push({
        id: Date.now(),
        sessionId,
        name,
        participants: participants || [],
        prizes: prizes || [],
        winners: winners || [],
        settings: settings || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await db.write();

    const session = db.data.lotterySessions.find(s => s.sessionId === sessionId);
    res.json(session);
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// DELETE /api/lottery/sessions/:sessionId - Delete lottery session
app.delete('/api/lottery/sessions/:sessionId', async (req, res) => {
  try {
    await db.read();
    const { sessionId } = req.params;
    const index = db.data.lotterySessions.findIndex(s => s.sessionId === sessionId);

    if (index === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }

    db.data.lotterySessions.splice(index, 1);
    await db.write();

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
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
    version: '1.0.0',
    polls: db.data.polls.length,
    votes: db.data.votes.length,
    lotterySessions: db.data.lotterySessions.length,
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🎉 W3JFi Backend Server is running!`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Database: ${join(dataDir, 'db.json')}\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await db.write();
  process.exit(0);
});
