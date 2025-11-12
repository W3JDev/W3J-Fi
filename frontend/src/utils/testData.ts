/**
 * Generate 500 dummy test participants for lottery testing
 */

export interface TestParticipant {
  name: string
  department: string
  avatar?: string
}

const firstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol',
  'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Dorothy', 'Lisa', 'Angela', 'Helen', 'Anna', 'Samantha', 'Katherine', 'Christine', 'Deborah', 'Rachel',
  'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin',
  'Rebecca', 'Laura', 'Stephanie', 'Carolyn', 'Janet', 'Catherine', 'Frances', 'Ann', 'Joyce', 'Diane',
  'Samuel', 'Raymond', 'Gregory', 'Jack', 'Patrick', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose',
  'Alice', 'Ruth', 'Virginia', 'Andrea', 'Christina', 'Pamela', 'Martha', 'Debra', 'Amanda', 'Shirley'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
]

const departments = [
  'Engineering', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations', 'IT Support',
  'Product Management', 'Customer Service', 'Research & Development', 'Quality Assurance', 'Design',
  'Legal', 'Administration', 'Business Development', 'Data Analytics', 'Supply Chain', 'Manufacturing',
  'Logistics', 'Procurement', 'Training', 'Security', 'Facilities', 'Public Relations', 'Strategy'
]

/**
 * Generate 500 unique test participants
 */
export function generate500TestParticipants(): TestParticipant[] {
  const participants: TestParticipant[] = []
  const usedNames = new Set<string>()

  for (let i = 0; i < 500; i++) {
    let name: string
    let attempts = 0
    
    // Ensure unique names
    do {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const suffix = attempts > 0 ? ` ${attempts}` : ''
      name = `${firstName} ${lastName}${suffix}`
      attempts++
    } while (usedNames.has(name) && attempts < 10)
    
    usedNames.add(name)
    
    const department = departments[Math.floor(Math.random() * departments.length)] || 'General'
    
    participants.push({
      name,
      department,
      avatar: '' // Can add avatar URLs if needed
    })
  }

  return participants
}

/**
 * Quick test - generate smaller batches
 */
export function generateTestParticipants(count: number): TestParticipant[] {
  const participants: TestParticipant[] = []
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)] || 'Test'
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)] || 'User'
    const department = departments[Math.floor(Math.random() * departments.length)] || 'General'
    
    participants.push({
      name: `${firstName} ${lastName} ${i + 1}`,
      department,
      avatar: ''
    })
  }

  return participants
}
