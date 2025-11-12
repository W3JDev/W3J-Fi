// Seed database with dummy data for testing
// Run with: node seed-data.js

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const adapter = new JSONFile(join(__dirname, 'data', 'db.json'));
const db = new Low(adapter, { polls: [], votes: [], lotterySessions: [] });

await db.read();

// Clear existing data
db.data = { polls: [], votes: [], lotterySessions: [] };

console.log('🌱 Seeding W3JFi database with dummy data...\n');

// ============================================
// SEED POLLS
// ============================================

const now = new Date();
const polls = [
  {
    id: Date.now(),
    title: 'Best Programming Language 2025',
    shortCode: nanoid(8).toUpperCase(),
    startAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // Started 2 hours ago
    endAt: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(), // Ends in 1 hour
    question1: 'JavaScript/TypeScript',
    question2: 'Python',
    question3: 'Rust',
    question4: 'Go',
    question5: 'Java',
    isDraft: false,
    votes: []
  },
  {
    id: Date.now() + 1,
    title: 'Company Annual Party Theme',
    shortCode: nanoid(8).toUpperCase(),
    startAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // Started 30 min ago
    endAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // Ends in 30 min
    question1: 'Beach Party',
    question2: 'Casino Night',
    question3: 'Masquerade Ball',
    question4: 'Retro 80s',
    isDraft: false,
    votes: []
  },
  {
    id: Date.now() + 2,
    title: 'Q1 2026 Team Building Activity',
    shortCode: nanoid(8).toUpperCase(),
    startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Starts in 2 days
    endAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 3 days
    question1: 'Escape Room',
    question2: 'Hiking Trip',
    question3: 'Cooking Class',
    isDraft: false,
    votes: []
  },
  {
    id: Date.now() + 3,
    title: 'Draft: Christmas Party Ideas',
    shortCode: nanoid(8).toUpperCase(),
    startAt: now.toISOString(),
    endAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    question1: 'Secret Santa',
    question2: 'White Elephant',
    question3: 'Charity Auction',
    isDraft: true,
    votes: []
  }
];

// Add votes to active polls
const voterIds = [
  'employee-001', 'employee-002', 'employee-003', 'employee-004', 'employee-005',
  'employee-006', 'employee-007', 'employee-008', 'employee-009', 'employee-010',
  'employee-011', 'employee-012', 'employee-013', 'employee-014', 'employee-015'
];

// Poll 1 votes (Programming Languages)
for (let i = 0; i < 15; i++) {
  const choice = Math.floor(Math.random() * 5) + 1; // Random choice 1-5
  polls[0].votes.push({
    id: Date.now() + i,
    voterId: voterIds[i],
    choice: choice,
    createdAt: new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000).toISOString()
  });
}

// Poll 2 votes (Party Theme)
for (let i = 0; i < 10; i++) {
  const choice = Math.floor(Math.random() * 4) + 1; // Random choice 1-4
  polls[1].votes.push({
    id: Date.now() + 100 + i,
    voterId: voterIds[i],
    choice: choice,
    createdAt: new Date(now.getTime() - Math.random() * 30 * 60 * 1000).toISOString()
  });
}

db.data.polls = polls;

console.log(`✅ Created ${polls.length} polls:`);
polls.forEach(p => {
  console.log(`   - "${p.title}" (${p.shortCode}) - ${p.votes.length} votes - ${p.isDraft ? 'Draft' : 'Active'}`);
});

// ============================================
// SEED LOTTERY SESSION
// ============================================

const lotterySession = {
  id: 'lottery-session-' + Date.now(),
  name: 'W3JFi 2025 Annual Lottery',
  createdAt: now.toISOString(),
  participants: [
    { id: '1', name: 'Alice Johnson', department: 'Engineering', avatar: '👩‍💻' },
    { id: '2', name: 'Bob Smith', department: 'Marketing', avatar: '👨‍💼' },
    { id: '3', name: 'Carol Williams', department: 'Sales', avatar: '👩‍💼' },
    { id: '4', name: 'David Brown', department: 'Engineering', avatar: '👨‍💻' },
    { id: '5', name: 'Emma Davis', department: 'HR', avatar: '👩‍🦰' },
    { id: '6', name: 'Frank Miller', department: 'Finance', avatar: '👨‍💼' },
    { id: '7', name: 'Grace Wilson', department: 'Operations', avatar: '👩‍💼' },
    { id: '8', name: 'Henry Taylor', department: 'Engineering', avatar: '👨‍💻' },
    { id: '9', name: 'Iris Anderson', department: 'Marketing', avatar: '👩‍💼' },
    { id: '10', name: 'Jack Thomas', department: 'Sales', avatar: '👨‍💼' },
    { id: '11', name: 'Kate Martinez', department: 'Engineering', avatar: '👩‍💻' },
    { id: '12', name: 'Leo Garcia', department: 'HR', avatar: '👨‍💼' },
    { id: '13', name: 'Mia Rodriguez', department: 'Finance', avatar: '👩‍💼' },
    { id: '14', name: 'Noah Lee', department: 'Operations', avatar: '👨‍💻' },
    { id: '15', name: 'Olivia White', department: 'Marketing', avatar: '👩‍💼' },
    { id: '16', name: 'Peter Harris', department: 'Sales', avatar: '👨‍💼' },
    { id: '17', name: 'Quinn Clark', department: 'Engineering', avatar: '👩‍💻' },
    { id: '18', name: 'Ryan Lewis', department: 'HR', avatar: '👨‍💼' },
    { id: '19', name: 'Sophia Walker', department: 'Finance', avatar: '👩‍💼' },
    { id: '20', name: 'Tom Hall', department: 'Operations', avatar: '👨‍💻' }
  ],
  prizes: [
    { id: 'p1', name: 'MacBook Pro M3', quantity: 1, icon: '💻', winner: null },
    { id: 'p2', name: 'iPhone 15 Pro', quantity: 2, icon: '📱', winner: null },
    { id: 'p3', name: 'AirPods Pro', quantity: 3, icon: '🎧', winner: null },
    { id: 'p4', name: '$500 Gift Card', quantity: 5, icon: '🎁', winner: null },
    { id: 'p5', name: 'Wireless Charger', quantity: 10, icon: '⚡', winner: null }
  ],
  winners: [],
  drawHistory: []
};

db.data.lotterySessions.push(lotterySession);

console.log(`\n✅ Created lottery session: "${lotterySession.name}"`);
console.log(`   - ${lotterySession.participants.length} participants`);
console.log(`   - ${lotterySession.prizes.length} prize tiers`);

// Save to database
await db.write();

console.log(`\n🎉 Database seeded successfully!`);
console.log(`📊 Location: ${join(__dirname, 'data', 'db.json')}`);
console.log(`\n📝 Summary:`);
console.log(`   - Polls: ${db.data.polls.length}`);
console.log(`   - Total Votes: ${db.data.polls.reduce((sum, p) => sum + p.votes.length, 0)}`);
console.log(`   - Lottery Sessions: ${db.data.lotterySessions.length}`);
console.log(`\n💡 Start the backend server: npm start`);
console.log(`💡 Then access frontend: http://localhost:5173`);
console.log(`\n🔗 Test poll URLs:`);
db.data.polls.filter(p => !p.isDraft).forEach(p => {
  console.log(`   - http://localhost:5173/poll/${p.shortCode}`);
});
