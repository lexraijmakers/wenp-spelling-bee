# Dutch Spelling Bee - Development Context for Cline

## Quick Start Development Guide

### Project Structure
```
wp-spelling-bee/
├── src/app/
│   ├── page.tsx              # Home/session creation
│   ├── judge/page.tsx        # Judge interface
│   ├── display/page.tsx      # Contestant display
│   └── api/
│       └── socket/route.ts   # Socket.io API route
├── public/
│   ├── dutch-words.json      # Word database
│   └── sounds/
│       ├── bell.mp3          # Error bell
│       └── success.mp3       # Success sound
├── lib/
│   ├── socket.ts             # Socket.io client setup
│   ├── words.ts              # Word filtering/selection logic
│   └── audio.ts              # Audio management
└── components/
    ├── Timer.tsx             # Traffic light timer
    ├── WordDisplay.tsx       # Word information panel
    └── SessionManager.tsx    # Room code management
```

## Core Development Tasks (Phase 1 MVP)

### 1. Session Management (Start Here)
**File: `src/app/page.tsx`**
- Simple home page with "Create Session" and "Join Session" buttons
- Generate 4-digit room codes
- Basic session state management

**File: `components/SessionManager.tsx`**
- Room code input/display
- Connection status indicator
- Error handling for invalid codes

### 2. Socket.io Setup
**File: `src/app/api/socket/route.ts`**
- Socket.io server setup for Next.js 15
- Room-based communication
- Event handlers: `join-room`, `word-selected`, `timer-start`, `request-info`, `judge-decision`

**File: `lib/socket.ts`**
- Client-side Socket.io connection
- Event emitters and listeners
- Reconnection handling

### 3. Word Selection Logic
**File: `lib/words.ts`**
```typescript
interface Word {
  id: number;
  word: string;
  category: string;
  difficulty: number;
  sentence: string;
  definition: string;
  partOfSpeech: string;
  pronunciation?: string;
  origin?: string;
}

// Key functions to implement:
- getWordsByCategory(category: string): Word[]
- getWordsByDifficulty(difficulty: number): Word[]
- getRandomWord(category: string, difficulty: number): Word
- getAvailableInfo(word: Word): string[]
```

### 4. Judge Interface (`/judge`)
**Priority Components:**
1. **Word Selection Panel**
   - Category dropdown (6 categories from JSON)
   - Difficulty slider (1-5)
   - "Get Word" button
   
2. **Word Information Display**
   - Current word (hidden from display)
   - All available information
   - Pronunciation guide
   
3. **Control Buttons**
   - Request handlers: "Definition", "Sentence", "Part of Speech", etc.
   - Judge decisions: "Correct", "Incorrect"
   - Timer controls: "Start", "Reset"

### 5. Display Interface (`/display`)
**Priority Components:**
1. **Status Display**
   - Large, clear status messages
   - Available information indicators
   - Timer visualization
   
2. **Information Feedback**
   - Show when information is requested
   - Display provided information clearly
   - Result animations

### 6. Timer System
**File: `components/Timer.tsx`**
- 90-second countdown
- Traffic light phases (green 60s, yellow 30s, red 15s)
- Visual and audio cues
- Automatic timeout handling

## Socket.io Events Structure

### Judge → Display Events
```typescript
'word-selected': { word: string, availableInfo: string[] }
'timer-start': { duration: 90 }
'timer-reset': {}
'info-provided': { type: string, content: string }
'judge-decision': { correct: boolean, correctSpelling?: string }
```

### Display → Judge Events
```typescript
'request-info': { type: 'definition' | 'sentence' | 'partOfSpeech' | 'origin' }
'contestant-ready': {}
```

## Audio Implementation
**File: `lib/audio.ts`**
- Web Audio API setup
- Preload sounds (bell, success, timer warnings)
- Volume controls
- Browser compatibility handling

## Styling Guidelines (Tailwind)
### Judge Interface
- Compact, functional design
- Mobile-friendly (phone/tablet use)
- Clear button hierarchy
- Information density optimized

### Display Interface  
- Large text (projection-friendly)
- High contrast colors
- Minimal distractions
- Clear visual hierarchy

## Testing Strategy
1. **Local Development**: Two browser windows (judge + display)
2. **Network Testing**: Different devices on same network
3. **Word Database**: Test all categories and difficulties
4. **Timer Accuracy**: Verify 90-second timing
5. **Audio**: Test on different devices/browsers

## Deployment Checklist (Vercel)
- [ ] Socket.io server configuration for Vercel
- [ ] Audio files in public directory
- [ ] Environment variables for production
- [ ] CORS settings for cross-origin requests
- [ ] Error handling and fallbacks

## Development Priority Order
1. **Session creation and joining** (basic connectivity)
2. **Word selection and display** (core functionality)
3. **Timer system** (authentic Scripps timing)
4. **Information requests** (contestant interaction)
5. **Audio feedback** (polish and authenticity)
6. **Error handling and edge cases**

## Key Success Metrics for MVP
- [ ] Judge can create session and get room code
- [ ] Display can join session with room code
- [ ] Judge can select category/difficulty and get random word
- [ ] Display shows available information options
- [ ] Timer works with traffic light system
- [ ] Information requests work bidirectionally
- [ ] Judge can mark correct/incorrect
- [ ] Audio feedback works (bell sound)
- [ ] Works on mobile devices (judge interface)
- [ ] Stable real-time connection

## Common Pitfalls to Avoid
1. **Socket.io with Next.js 15**: Use proper API route setup
2. **Audio autoplay**: Require user interaction before playing sounds
3. **Mobile responsiveness**: Test judge interface on phones
4. **Timer accuracy**: Account for network latency
5. **Word randomization**: Ensure true randomness within filters
6. **Error states**: Handle disconnections gracefully

This context provides everything needed for successful development of the Dutch Spelling Bee MVP!
