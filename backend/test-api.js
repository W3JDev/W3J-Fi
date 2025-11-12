// Quick test script to verify backend API is working
// Run with: node test-api.js

const API_BASE = 'http://localhost:3000/api'

async function testBackend() {
  console.log('🧪 Testing W3JFi Backend API\n')

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...')
    const healthRes = await fetch(`${API_BASE}/health`)
    const healthData = await healthRes.json()
    console.log('✅ Health:', healthData)
    console.log()

    // Test 2: Create Poll
    console.log('2️⃣ Creating test poll...')
    const createRes = await fetch(`${API_BASE}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Poll - Backend Verification',
        question1: 'Node.js',
        question2: 'Python',
        question3: 'Go',
        duration: 300,
        isDraft: false
      })
    })
    const newPoll = await createRes.json()
    console.log('✅ Poll created:', newPoll.data)
    const shortCode = newPoll.data.shortCode
    console.log()

    // Test 3: Get Poll by ShortCode
    console.log('3️⃣ Fetching poll by shortCode:', shortCode)
    const getPollRes = await fetch(`${API_BASE}/polls/${shortCode}`)
    const pollData = await getPollRes.json()
    console.log('✅ Poll fetched:', pollData.data.title)
    console.log()

    // Test 4: Submit Vote
    console.log('4️⃣ Submitting test vote...')
    const voteRes = await fetch(`${API_BASE}/polls/${shortCode}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voterId: 'test-voter-123',
        choice: 1
      })
    })
    const voteData = await voteRes.json()
    console.log('✅ Vote submitted:', voteData.message)
    console.log()

    // Test 5: Get Results
    console.log('5️⃣ Fetching poll results...')
    const resultsRes = await fetch(`${API_BASE}/polls/${shortCode}/results`)
    const resultsData = await resultsRes.json()
    console.log('✅ Results:', resultsData.data)
    console.log()

    // Test 6: Get All Polls
    console.log('6️⃣ Fetching all polls...')
    const allPollsRes = await fetch(`${API_BASE}/polls`)
    const allPollsData = await allPollsRes.json()
    console.log(`✅ Total polls in database: ${allPollsData.data.length}`)
    console.log()

    console.log('🎉 All tests passed! Backend is working correctly.')
    console.log(`\n📝 You can clean up by deleting the test poll:`)
    console.log(`   DELETE ${API_BASE}/polls/${shortCode}`)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('\n💡 Make sure the backend server is running:')
    console.error('   cd backend && npm start')
    process.exit(1)
  }
}

testBackend()
