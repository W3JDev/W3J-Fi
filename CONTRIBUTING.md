# Contributing to W3JDev United

Thank you for your interest in contributing to W3JDev United! This document provides guidelines and instructions for contributing.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Commit Messages](#commit-messages)
7. [Pull Request Process](#pull-request-process)
8. [Project Structure](#project-structure)

---

## Code of Conduct

### Our Pledge
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/W3J-Fi.git
   cd W3J-Fi
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/W3JDev/W3J-Fi.git
   ```

4. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### Creating a New Feature

1. **Update your fork**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow coding standards
   - Add tests if applicable

4. **Test your changes**
   ```bash
   npm run build
   npm run lint  # if linter is set up
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in the template

---

## Coding Standards

### TypeScript/JavaScript

**Style Guide:**
- Use TypeScript for type safety
- Follow ESLint rules (if configured)
- Use meaningful variable names
- Add JSDoc comments for functions

**Example:**
```typescript
/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns Shuffled copy of the array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  // Implementation...
  return result
}
```

### Vue Components

**Structure:**
```vue
<script setup lang="ts">
// Imports
import { ref, computed } from 'vue'

// Props and emits
const props = defineProps<{
  items: string[]
}>()

// State
const selectedItem = ref<string | null>(null)

// Computed
const hasItems = computed(() => props.items.length > 0)

// Methods
function selectItem(item: string) {
  selectedItem.value = item
}
</script>

<template>
  <!-- Template with semantic HTML -->
  <div class="container">
    <h2>Title</h2>
    <!-- Content -->
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
```

### CSS/Tailwind

**Guidelines:**
- Use Tailwind utility classes first
- Create custom classes only when needed
- Follow mobile-first approach
- Use semantic class names

**Example:**
```vue
<!-- Good -->
<button class="btn btn-primary">Click Me</button>

<!-- Avoid -->
<button style="background: blue; padding: 10px;">Click Me</button>
```

---

## Testing Guidelines

### Manual Testing

Before submitting:
1. **Test in multiple browsers**
   - Chrome
   - Firefox
   - Safari
   - Edge

2. **Test responsive design**
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

3. **Test all features**
   - Each module works correctly
   - All buttons are functional
   - No console errors
   - Data persists correctly

### Test Cases to Verify

**3D Lottery:**
- [ ] Add participants manually
- [ ] Import Excel file
- [ ] Export participants
- [ ] Add prizes
- [ ] Draw winners
- [ ] Confetti animation works
- [ ] Sound effects play
- [ ] Winner list updates

**Name Picker:**
- [ ] Add names
- [ ] Bulk import
- [ ] Draw name
- [ ] Remove winner option works
- [ ] History updates
- [ ] Sound effects play

**Live Polls:**
- [ ] Create poll
- [ ] Vote on poll
- [ ] View results
- [ ] OBS overlay displays
- [ ] QR code shows

---

## Commit Messages

### Format
```
Type: Brief description (50 chars max)

Detailed explanation if needed (wrap at 72 chars).
Reference issues: #123, #456
```

### Types
- **Add:** New feature
- **Fix:** Bug fix
- **Update:** Modify existing feature
- **Remove:** Delete feature/code
- **Refactor:** Code restructuring
- **Docs:** Documentation only
- **Style:** Formatting, no code change
- **Test:** Adding tests
- **Chore:** Maintenance tasks

### Examples
```
Add: Excel import validation

- Validate file format before processing
- Show error message for invalid files
- Add unit tests for validation
Fixes #123

Fix: Confetti not showing on winner announcement

Updated canvas-confetti initialization to trigger
after animation completes.
Fixes #456

Docs: Update deployment guide with Vercel steps
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass (if applicable)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] Documentation updated
- [ ] Screenshots added (for UI changes)
- [ ] Commit messages are clear

### PR Title Format
```
[Type] Brief description of changes
```

Examples:
- `[Feature] Add dark mode toggle`
- `[Fix] Resolve Excel import error`
- `[Docs] Update user guide with new features`

### PR Description Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of specific changes
- Another change
- One more change

## Testing Done
- Describe how you tested
- List browsers tested
- Any edge cases verified

## Screenshots
(If applicable)

## Related Issues
Closes #123
Related to #456

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Build succeeds
```

### Review Process

1. **Automated Checks**
   - Build must succeed
   - All checks must pass

2. **Code Review**
   - At least one approving review
   - Address all comments
   - Make requested changes

3. **Merge**
   - Squash and merge (preferred)
   - Rebase and merge (for clean history)

---

## Project Structure

### Frontend Organization
```
frontend/
├── src/
│   ├── components/
│   │   ├── lottery/     # Lottery-specific components
│   │   ├── picker/      # Picker-specific components
│   │   ├── poll/        # Poll-specific components
│   │   └── shared/      # Shared components
│   ├── store/
│   │   ├── global.ts    # Global state
│   │   ├── lottery.ts   # Lottery state
│   │   ├── picker.ts    # Picker state
│   │   └── poll.ts      # Poll state
│   ├── services/
│   │   ├── three/       # Three.js services
│   │   ├── audio/       # Audio services
│   │   ├── animation/   # Animation services
│   │   └── api/         # API services
│   ├── utils/
│   │   ├── excel.ts     # Excel utilities
│   │   ├── random.ts    # Random utilities
│   │   └── storage.ts   # Storage utilities
│   ├── views/           # Page components
│   ├── router/          # Vue Router config
│   └── style.css        # Global styles
├── public/              # Static assets
└── package.json         # Dependencies
```

### Adding a New Feature

1. **Plan the feature**
   - What problem does it solve?
   - How does it fit existing code?
   - What components are needed?

2. **Create necessary files**
   - Component(s) in appropriate directory
   - Store if state management needed
   - Utility functions if reusable logic
   - Update router if new page

3. **Implement the feature**
   - Write clean, typed code
   - Add comments for complex logic
   - Follow existing patterns

4. **Document the feature**
   - Update USER_GUIDE.md
   - Add to README if significant
   - Include usage examples

---

## Areas for Contribution

### High Priority
- [ ] Symfony backend for polls
- [ ] Server-Sent Events implementation
- [ ] Mobile app (React Native/Flutter)
- [ ] Unit tests
- [ ] E2E tests

### Medium Priority
- [ ] Additional themes
- [ ] Internationalization (i18n)
- [ ] Advanced prize configurations
- [ ] Analytics dashboard
- [ ] Webhook integrations

### Low Priority
- [ ] Custom animations
- [ ] Alternative 3D effects
- [ ] Plugin system
- [ ] CLI tool

### Good First Issues
Look for issues tagged `good-first-issue`:
- Documentation improvements
- Minor bug fixes
- UI enhancements
- Additional themes

---

## Questions?

- **Issues:** GitHub Issues for bugs
- **Discussions:** GitHub Discussions for questions
- **Email:** [Your Contact Email]

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured on project website (if applicable)

Thank you for making W3JDev United better! 🎉
