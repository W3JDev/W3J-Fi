# W3JFi Copilot Instructions

## Project Overview
W3JFi is a professional lottery and polling application with 3 distinct modules: **Lottery** (3D sphere draws), **Picker** (name selection), and **Poll** (live voting with OBS integration). Built with Vue 3.5 + TypeScript 5.5+ strict mode, using Pinia stores with persistence.

## Architecture & File Organization

### Store-Driven Architecture
All business logic lives in Pinia stores (`src/store/`):
- **lottery.ts**: 615-line comprehensive store with 25+ methods for participants, prizes, winners, drawing state
- **picker.ts**: Simple name list management with history tracking
- **poll.ts**: Real-time voting with shortCode system, multiple question support (1-5 options)
- **global.ts**: Theme management (w3jdev/light/dark/dracula), audio settings, preferences

### View-Store Pattern
Views are thin UI layers that consume store state:
```vue
<script setup lang="ts">
import { useLotteryStore } from '../store/lottery'
const lotteryStore = useLotteryStore()
// Direct store property binding in template
</script>
```

### Service Layer Architecture
- **services/three/Sphere3D.ts**: Three.js 3D lottery sphere with TWEEN animations
- **services/audio/SoundEffects.ts**: Audio management with volume controls
- **services/animation/SlotMachine.ts**: Picker slot machine animations
- **utils/excel.ts**: Excel import/export for participant lists
- **utils/storage.ts**: IndexedDB wrapper using localforage for media/sessions

## Key Development Patterns

### Store Method Signatures
```typescript
// Lottery store follows this pattern:
function addParticipant(name: string, department?: string, avatar?: string)
function markWinner(personId: string, prizeId: string)
function importParticipants(data: Person[])
```

### Poll ShortCode System
Polls use generated shortCodes for public voting URLs:
```typescript
// Poll creation in PollView.vue:
const poll = {
  shortCode: generateShortCode(), // utils/random.ts
  question1-5: string, // Up to 5 questions
  votes: Vote[] // Array of voter choices
}
```

### 3D Graphics Integration
Lottery uses Three.js with specific integration points:
```typescript
// LotteryView.vue initialization:
const sphereContainer = ref<HTMLElement | null>(null)
const sphere3D = new Sphere3DManager(sphereContainer.value!, config)
```

### State Persistence
All stores use `{ persist: true }` with automatic localStorage sync. Critical for maintaining draw state across refreshes.

## Build & Development

### Commands (run in `frontend/` directory):
```bash
npm run dev          # Dev server on port 5173
npm run build        # Production build with TypeScript validation
npm run type-check   # Strict TypeScript checking
```

### TypeScript Strict Mode
- Zero compilation errors required
- All interfaces defined in store files (Person, Prize, Poll, Vote)
- Use `Partial<T>` for update methods
- Import types: `import type { Person } from '../store/lottery'`

### Custom Theming
Uses DaisyUI with W3JDev custom theme (see `tailwind.config.js`):
- Primary: #0f5fd3 (W3J Blue)
- Custom CSS classes: `w3j-primary`, `w3j-success`, etc.
- Theme switching via `globalStore.setTheme()`

## Component Communication

### OBS Integration Pattern
Multiple views for streaming integration:
- **OBSOverlay.vue**: Live poll results overlay
- **OBSQRCode.vue**: QR codes for audience voting
- **ResultsView.vue**: Poll results with confetti effects

### File Import/Export Pattern
Excel integration throughout lottery system:
```typescript
// utils/excel.ts functions used in LotteryView.vue:
importParticipantsFromExcel(file) // Parses Excel to Person[]
exportWinnersToExcel(winners) // Downloads results
```

### Animation Integration
- **Confetti**: `canvas-confetti` component used in multiple views
- **3D Sphere**: Three.js integration in lottery for participant selection
- **Slot Machine**: Custom animation service for name picker

## Common Gotchas

1. **Store State Access**: Always use computed properties for reactive store data in templates
2. **Route Params**: Poll voting uses `:shortCode` param - ensure proper route matching
3. **Media Storage**: Large files (images, audio) use IndexedDB via `utils/storage.ts`, not localStorage
4. **TypeScript Imports**: Use `import type` for interfaces to avoid runtime imports
5. **Build Issues**: Rolldown-vite override in package.json - don't change build tooling without testing

When working on features, understand which of the 3 modules (lottery/picker/poll) you're modifying and follow the established store → view → service pattern.