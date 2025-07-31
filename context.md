# Dutch Spelling Bee Web Application

## Project Overview
Create a spelling bee webapp for friends group contests using Dutch words, following official Scripps National Spelling Bee rules and format.

## Core Features (v1)
- **Focus**: Single contestant spelling mechanism (multiple contestants/knockout system in later versions)
- **Language**: Dutch words organized by categories with difficulty levels
- **Rules**: Based on official Scripps National Spelling Bee format
- **Word Selection**: Judge selects category and difficulty, gets random word from that subset
- **Data**: JSON file structure for words (expandable later)

## Application Architecture
**Single Next.js app with two routes**:
- `/display` - Live display for contestant (projected screen)
- `/judge` - Judge interface for computer/phone

## Official Scripps Rules Implementation

### Core Spelling Bee Rules (from official Scripps documentation)
1. **Basic Flow**:
   - Judge pronounces word clearly
   - Contestant may ask for: definition, part of speech, sentence usage, language of origin, alternate pronunciations, root information
   - Contestant spells word letter by letter
   - Judge determines correctness
   - Bell rings for incorrect spelling (elimination)

2. **Timing System** (2025 Scripps standard):
   - **90 seconds total** per word
   - **First 60 seconds**: Green light (contestant may make requests)
   - **30 seconds remaining**: Yellow light with countdown (requests still allowed)
   - **Final 15 seconds**: Red light (must begin spelling, no more requests)

3. **Contestant Rights**:
   - Ask for word repetition
   - Request definition
   - Ask for part of speech
   - Request sentence usage
   - Ask for language of origin
   - Request alternate pronunciations
   - Ask about root words (must specify pronunciation, origin, definition)

4. **Judge Responsibilities**:
   - Pronounce word clearly
   - Provide requested information when available
   - Ring bell immediately upon misspelling
   - Give correct spelling after elimination
   - Maintain fair timing

5. **Elimination Rules**:
   - Misspelling eliminates contestant
   - Exceeding time limit eliminates contestant
   - Changing letters already spoken eliminates contestant
   - If all contestants in round misspell, all are reinstated (do-over)

### Word Data Structure (JSON)
```json
{
  "words": [
    {
      "id": 1,
      "word": "voorbeeld",
      "category": "algemeen",
      "sentence": "Dit is een voorbeeld van een zin.",
      "definition": "Een illustratie of model van iets",
      "partOfSpeech": "zelfstandig naamwoord",
      "pronunciation": "voor-BEELD",
      "origin": "Nederlands",
      "difficulty": 2,
      "roots": ["voor", "beeld"]
    }
  ],
  "categories": [
    "algemeen",
    "dieren", 
    "natuur",
    "wetenschap",
    "geschiedenis"
  ]
}
```

### Required Fields per Word:
- `word` (required)
- `category` (required) 
- `sentence` (required)
- `definition` (required)
- `partOfSpeech` (required)
- `pronunciation` (optional but recommended)
- `origin` (optional)
- `difficulty` (1-5 scale, optional)
- `roots` (optional array)

## User Interface Flow

### Judge App (`/judge`)
- **Word Selection**: Choose category and difficulty level, then get random word
- **Information Panel**: Current word, definition, sentence, pronunciation guide
- **Request Buttons**: "Read Definition", "Use in Sentence", "Repeat Word", "Part of Speech", "Origin"
- **Timer**: Traffic light system (green/yellow/red) with countdown
- **Control Buttons**: "Correct" (advance), "Incorrect" (ring bell), "Reset Timer", "New Word"
- **Audio Controls**: Bell sound, volume controls

### Display App (`/display`)
- **Clean Interface**: Large, projection-friendly design
- **Status Display**: "Ready", "Listening", "Spelling in Progress"
- **Timer Visualization**: Large traffic light indicator
- **Available Information**: Shows which word information is available (definition, sentence, part of speech, origin, pronunciation, etc.)
- **Request Feedback**: "Definition requested", "Sentence requested", etc.
- **Result Display**: "Correct!" or "Incorrect" with animations
- **Instructions**: Clear contestant guidelines and available request options

## Technical Implementation

### Real-time Communication
- **Socket.io** for judge ↔ display synchronization
- Events: word selection, timer start/stop, requests, results
- Room-based sessions with simple codes

### Error Detection & Judging
- **Manual judging** (following official Scripps format)
- Judge listens to contestant's complete spelling
- Judge makes final decision on correctness
- Automatic bell sound on "Incorrect" button
- No real-time typing interface needed

### Audio System
- **Bell sound**: Clear, loud elimination signal
- **Timer warnings**: Subtle audio cues for yellow/red phases
- **Success sounds**: Optional positive feedback
- Web Audio API implementation

## Technical Stack
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io
- **Hosting**: Vercel
- **Audio**: Web Audio API
- **State Management**: React Context (simple for v1)

## Session Management
- Judge creates session → generates room code
- Display joins with room code
- No persistent storage (session-based only)
- Automatic cleanup on disconnect

## Development Phases
1. **Phase 1**: Basic word selection and manual judging
2. **Phase 2**: Timer system with traffic lights
3. **Phase 3**: All contestant request types
4. **Phase 4**: Audio feedback and polish
5. **Future**: Word statistics, session history, tournament mode

## Key Design Principles
- **Simplicity**: Clean, focused interfaces
- **Accessibility**: Large text, clear audio cues, keyboard navigation
- **Reliability**: Robust real-time connection handling
- **Authenticity**: True to official Scripps National Spelling Bee format
- **Expandability**: Easy to add words and features later

## Dutch Word Database
A comprehensive JSON file (`public/dutch-words.json`) has been created with 50+ authentic Dutch words sourced from the official NTR Groot Dictee archives (2012-2016). The database includes:

### Word Categories:
- **algemeen** - Common Dutch words
- **moeilijke woorden** - Difficult/challenging words
- **samengestelde woorden** - Compound words
- **vreemde woorden** - Foreign loanwords
- **eigennamen** - Proper nouns
- **uitdrukkingen** - Expressions/phrases

### Word Data Structure:
Each word includes all required Scripps-standard fields:
- `word` - The Dutch word to spell
- `category` - Word category for filtering
- `sentence` - Usage example in Dutch
- `definition` - Clear Dutch definition
- `partOfSpeech` - Grammatical classification
- `pronunciation` - Phonetic guide
- `origin` - Language origin (Nederlands, Frans, Latijn, etc.)
- `difficulty` - Scale 1-5 (1=easy, 5=very difficult)
- `year` - Source year from Groot Dictee

### Sample Words Include:
- **Easy**: gebakkelei, bewieroken, nonkel
- **Medium**: conciliatie, protegeren, vicedecaan
- **Hard**: kladderadatsch, impardonnabele, hyperboreeërs
- **Very Hard**: promiscuïteitbevorderende, blankebabybilletjesprivilege

This authentic Dutch word collection provides an excellent foundation for challenging spelling bee competitions while maintaining cultural relevance and linguistic accuracy.

## ✅ Current Implementation Status (January 2025)

### Completed Features
- ✅ **Full application architecture** with judge and display interfaces
- ✅ **Real-time communication** using Pusher Channels (migrated from Socket.io)
- ✅ **Complete timer system** with traffic light phases (green/yellow/red)
- ✅ **Word selection system** with categories and difficulty levels
- ✅ **Information request system** (definition, sentence, pronunciation, etc.)
- ✅ **Audio feedback** for correct/incorrect answers
- ✅ **Room-based sessions** with unique codes
- ✅ **Responsive design** for all screen sizes
- ✅ **Vercel deployment ready** (serverless architecture)

### Technical Implementation
- **Framework**: Next.js 15 with TypeScript ✅
- **Styling**: Tailwind CSS ✅
- **Real-time**: Pusher Channels ✅ (upgraded from Socket.io)
- **Hosting**: Vercel-ready ✅
- **Audio**: Web Audio API ✅
- **State Management**: React hooks ✅

### Live Application URLs
- **Judge Interface**: `/judge?room=XXXX`
- **Display Interface**: `/display?room=XXXX`
- **Home Page**: `/` (session creation)

### Ready for Production
The application is fully functional and ready for deployment with:
- Zero build warnings/errors
- Complete Pusher integration
- Professional real-time communication
- Authentic Scripps National Spelling Bee rule implementation
