# Dutch Spelling Bee Web Application

A professional spelling bee application built with Next.js, following the official Scripps National Spelling Bee rules. This application provides a complete solution for conducting spelling bee competitions with Dutch words.

## Features

### Core Functionality
- **Two-Interface System**: Separate judge and display interfaces
- **Real-time Communication**: Socket.io for instant synchronization
- **Authentic Rules**: Based on Scripps National Spelling Bee regulations
- **Dutch Word Database**: Comprehensive collection of Dutch words with definitions
- **Audio Feedback**: Sound effects for correct/incorrect answers
- **Timer System**: 90-second countdown with visual phases (green/yellow/red)

### Judge Interface
- Word selection by category and difficulty level
- Real-time timer control (start/reset)
- Information provision buttons (definition, sentence, pronunciation, etc.)
- Correct/incorrect decision marking
- Audio feedback integration

### Display Interface
- Large, clear word display for contestants
- Timer with color-coded phases
- Available information indicators
- Real-time feedback display
- Contestant instruction panel

## Technology Stack

- **Framework**: Next.js 15.4.5 with TypeScript
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.io
- **Audio**: Web Audio API
- **Deployment**: Vercel-ready

## Project Structure

```
wp-spelling-bee/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page with session management
│   │   ├── judge/page.tsx        # Judge interface
│   │   ├── display/page.tsx      # Display interface
│   │   └── api/socket/route.ts   # Socket.io API route
├── lib/
│   ├── words.ts                  # Word management utilities
│   ├── socket.ts                 # Socket.io client configuration
│   └── audio.ts                  # Audio management
├── public/
│   └── dutch-words.json          # Dutch word database
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wp-spelling-bee
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Start the development server:
```bash
yarn dev
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Setting Up a Session

1. **Judge Setup**:
   - Click "Create New Session" on the home page
   - Note the 4-digit room code generated
   - You'll be redirected to the judge interface

2. **Display Setup**:
   - On a separate device/browser, enter the room code
   - Click "Join as Display"
   - The display interface will connect to the judge's session

### Conducting a Spelling Bee

1. **Word Selection** (Judge):
   - Select a category from the dropdown
   - Choose difficulty level (1-5)
   - Click "Get New Word"

2. **Starting the Round**:
   - Click "Start Timer" to begin the 90-second countdown
   - The display will show the timer with color phases:
     - **Green (60s)**: Information requests allowed
     - **Yellow (30s)**: Final requests period
     - **Red (15s)**: Must begin spelling

3. **Providing Information** (Judge):
   - Use the information buttons to provide:
     - Definition
     - Sentence usage
     - Part of speech
     - Pronunciation guide
     - Language origin

4. **Making Decisions** (Judge):
   - Click "✓ Correct" for correct spelling
   - Click "✗ Incorrect" for wrong spelling
   - Audio feedback will play automatically

## Word Database

The application includes a comprehensive Dutch word database with:
- Multiple categories (animals, food, technology, etc.)
- Difficulty levels (1-5)
- Complete definitions
- Example sentences
- Parts of speech
- Pronunciation guides
- Etymology information

### Adding New Words

Edit `public/dutch-words.json` to add new words:

```json
{
  "word": "voorbeeld",
  "definition": "Een ding dat dient ter navolging of ter verduidelijking",
  "sentence": "Dit is een goed voorbeeld van moderne architectuur.",
  "category": "algemeen",
  "difficulty": 2,
  "partOfSpeech": "zelfstandig naamwoord",
  "pronunciation": "voor-beeld",
  "origin": "Nederlands"
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings
4. Vercel will automatically handle the build and deployment

### Other Platforms

The application can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## Development

### Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```

### Socket.io Events

The application uses the following Socket.io events:

**Room Management**:
- `join-room`: Join a spelling bee session
- `room-joined`: Confirmation of room join

**Word Management**:
- `word-selected`: New word selected by judge
- `request-info`: Request word information
- `info-provided`: Information provided by judge

**Timer Control**:
- `timer-start`: Start the countdown timer
- `timer-reset`: Reset the timer

**Decisions**:
- `judge-decision`: Final correct/incorrect decision

## Rules (Scripps National Spelling Bee)

The application follows official Scripps rules:

1. **Time Limit**: 90 seconds per word
2. **Information Requests**: Contestants may request:
   - Word repetition
   - Definition
   - Part of speech
   - Language of origin
   - Sentence usage
   - Pronunciation guide

3. **Timer Phases**:
   - **Green Light (60s)**: All requests allowed
   - **Yellow Light (30s)**: Final opportunity for requests
   - **Red Light (15s)**: Must begin spelling, no more requests

4. **Spelling**: Must be letter-by-letter, clearly pronounced

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

## Future Enhancements

Planned features for future versions:
- Tournament management
- Leaderboards and scoring
- Multiple language support
- Advanced statistics
- Mobile app versions
- Offline mode support
