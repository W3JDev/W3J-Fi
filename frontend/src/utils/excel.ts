import * as XLSX from 'xlsx'
import type { Person } from '../store/lottery'

export interface ExcelParticipant {
  Name: string
  Department?: string
  Avatar?: string
  'Photo URL'?: string
}

/**
 * Import participants from an Excel file
 * @param file - The Excel file to import
 * @returns Array of Person objects
 */
export async function importParticipantsFromExcel(file: File): Promise<Person[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result
      if (!arrayBuffer) {
        reject(new Error('Failed to read file'))
        return
      }
      const data = new Uint8Array(arrayBuffer as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          reject(new Error('No worksheets found in file'))
          return
        }
        const worksheet = workbook.Sheets[firstSheetName]
        if (!worksheet) {
          reject(new Error('Worksheet is empty'))
          return
        }
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<ExcelParticipant>(worksheet)
        
        // Map to Person objects
        const participants: Person[] = jsonData.map((row, index) => ({
          id: `import-${Date.now()}-${index}`,
          name: row.Name || `Participant ${index + 1}`,
          department: row.Department || undefined,
          avatar: row.Avatar || row['Photo URL'] || undefined,
          isWin: false,
          prizeName: [],
          prizeTime: [],
          prizeId: [],
        }))
        
        // Remove duplicates by name
        const uniqueParticipants = participants.filter((participant, index, self) =>
          index === self.findIndex((p) => p.name === participant.name)
        )
        
        resolve(uniqueParticipants)
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Export participants to an Excel file
 * @param participants - Array of Person objects
 * @param filename - Name of the file to download
 */
export function exportParticipantsToExcel(participants: Person[], filename: string = 'participants.xlsx') {
  // Map participants to Excel format
  const excelData = participants.map(p => ({
    Name: p.name,
    Department: p.department || '',
    'Photo URL': p.avatar || '',
    'Has Won': p.isWin ? 'Yes' : 'No',
    'Prizes Won': p.prizeName.join(', '),
  }))

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData)
  
  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants')
  
  // Auto-size columns
  const maxWidth = 50
  const colWidths = [
    { wch: Math.min(maxWidth, Math.max(10, ...excelData.map(d => d.Name.length))) },
    { wch: Math.min(maxWidth, Math.max(12, ...excelData.map(d => (d.Department || '').length))) },
    { wch: Math.min(maxWidth, Math.max(10, ...excelData.map(d => (d['Photo URL'] || '').length))) },
    { wch: 10 },
    { wch: Math.min(maxWidth, Math.max(12, ...excelData.map(d => d['Prizes Won'].length))) },
  ]
  worksheet['!cols'] = colWidths
  
  // Write file
  XLSX.writeFile(workbook, filename)
}

/**
 * Export winners to an Excel file
 * @param winners - Array of Person objects who won
 * @param filename - Name of the file to download
 */
export function exportWinnersToExcel(winners: Person[], filename: string = 'winners.xlsx') {
  // Map winners to Excel format with prize details
  const excelData = winners.flatMap(winner => 
    winner.prizeName.map((prize, index) => ({
      Name: winner.name,
      Department: winner.department || '',
      Prize: prize,
      'Win Time': winner.prizeTime[index] ? new Date(winner.prizeTime[index]).toLocaleString() : '',
    }))
  )

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData)
  
  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Winners')
  
  // Auto-size columns
  const maxWidth = 50
  const colWidths = [
    { wch: Math.min(maxWidth, Math.max(10, ...excelData.map(d => d.Name.length))) },
    { wch: Math.min(maxWidth, Math.max(12, ...excelData.map(d => (d.Department || '').length))) },
    { wch: Math.min(maxWidth, Math.max(10, ...excelData.map(d => d.Prize.length))) },
    { wch: 20 },
  ]
  worksheet['!cols'] = colWidths
  
  // Write file
  XLSX.writeFile(workbook, filename)
}

/**
 * Create a template Excel file for participants
 */
export function createParticipantTemplate() {
  const templateData = [
    { Name: 'John Doe', Department: 'Engineering', 'Photo URL': 'https://example.com/photo1.jpg' },
    { Name: 'Jane Smith', Department: 'Marketing', 'Photo URL': 'https://example.com/photo2.jpg' },
    { Name: 'Bob Johnson', Department: 'Sales', 'Photo URL': '' },
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants')
  
  // Add column widths
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 40 },
  ]
  
  XLSX.writeFile(workbook, 'participant_template.xlsx')
}
