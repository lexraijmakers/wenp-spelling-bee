# Dutch Spelling Bee Web Application

A real-time spelling bee application built with Next.js and Pusher, designed for Dutch spelling contests following Scripps National Spelling Bee rules.

## 🎯 Features

-   **Real-time synchronization** between judge and display interfaces
-   **Timer system** with visual phases (green/yellow/red)
-   **Word information system** (definitions, sentences, pronunciation, etc.)
-   **Audio feedback** for correct/incorrect answers
-   **Room-based sessions** for multiple concurrent games
-   **Responsive design** for various screen sizes

## 🏗️ Architecture

### Two Main Interfaces

1. **Judge Interface** (`/judge?room=XXXX`)

    - Word selection and management
    - Timer controls
    - Information provision buttons
    - Scoring decisions

2. **Display Interface** (`/display?room=XXXX`)
    - Contestant view (projected screen)
    - Timer display with color phases
    - Information display
    - Results announcement

### Real-time Communication

-   **Pusher Channels** for WebSocket communication
-   **API Routes** for event triggering
-   **Room isolation** using unique room codes

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   Yarn package manager
-   Pusher account (free tier available)

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd wp-spelling-bee
    ```

2. **Install dependencies**

    ```bash
    yarn install
    ```

3. **Set up Pusher**

    - Create account at [pusher.com](https://pusher.com)
    - Choose "Channels" (not Beams)
    - Create new app with React + Node.js stack

4. **Configure environment variables**

    Create `.env.local` file:

    ```env
    # Pusher Configuration
    PUSHER_APP_ID=your_app_id
    PUSHER_KEY=your_key
    PUSHER_SECRET=your_secret
    PUSHER_CLUSTER=your_cluster

    # Next.js Public Variables (accessible in browser)
    NEXT_PUBLIC_PUSHER_KEY=your_key
    NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
    ```

5. **Run development server**

    ```bash
    yarn dev
    ```

6. **Open application**
    - Navigate to `http://localhost:3000`
    - Create a session and get room code
    - Open judge interface: `/judge?room=YOUR_ROOM_CODE`
    - Open display interface: `/display?room=YOUR_ROOM_CODE`

## 📖 How to Use

### Setting Up a Game

1. **Start the application** and create a new session
2. **Get the room code** (4-digit number)
3. **Open two browser windows/tabs:**
    - Judge interface (for the judge/moderator)
    - Display interface (for projection to contestant)

### Game Flow

1. **Judge selects a word** from categories and difficulty levels
2. **Judge starts the timer** (90 seconds total)
3. **Contestant can request information** during green/yellow phases
4. **Judge provides information** using dedicated buttons
5. **Contestant spells the word** during any phase
6. **Judge marks correct/incorrect** to end the round

### Timer Phases

-   **Green (60s)**: All requests allowed
-   **Yellow (30s)**: Final requests period
-   **Red (15s)**: Must begin spelling

### Available Information

-   Word definition
-   Example sentence
-   Part of speech
-   Pronunciation guide
-   Language of origin

## 🛠️ Development

### Project Structure

```
src/
├── app/
│   ├── api/pusher/          # Pusher API routes
│   ├── display/             # Display interface
│   ├── judge/               # Judge interface
│   └── page.tsx             # Home page
├── lib/
│   ├── audio.ts             # Audio management
│   ├── pusher.ts            # Pusher configuration
│   ├── realtime.ts          # Real-time communication
│   └── words.ts             # Word database management
```

### API Routes

-   `POST /api/pusher/word-selected` - New word selection
-   `POST /api/pusher/timer-start` - Start timer
-   `POST /api/pusher/timer-reset` - Reset timer
-   `POST /api/pusher/info-provided` - Provide word information
-   `POST /api/pusher/judge-decision` - Final decision

### Event System

All events use Pusher channels with format: `spelling-bee-{roomCode}`

**Events:**

-   `word-selected` - New word chosen
-   `timer-start` - Timer started
-   `timer-reset` - Timer reset
-   `info-provided` - Information provided
-   `judge-decision` - Round completed

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - automatic builds on push

### Other Platforms

The application is serverless-ready and can be deployed on:

-   Netlify
-   Railway
-   AWS Amplify
-   Any Node.js hosting platform

## 📝 Word Database

Words are stored in `lib/words.ts` with the following structure:

```typescript
interface Word {
    word: string
    definition: string
    sentence: string
    partOfSpeech: string
    category: string
    difficulty: number // 1-5
    pronunciation?: string
    origin?: string
}
```

### Adding Words

Edit `lib/words.ts` to add new words to the database. Words are organized by:

-   **Categories**: Different subject areas
-   **Difficulty**: 1 (easy) to 5 (very hard)

## 🎵 Audio System

The application includes audio feedback:

-   **Success sound** for correct answers
-   **Bell sound** for incorrect answers
-   **Audio initialization** on first user interaction

## 🔧 Configuration

### Pusher Settings

-   **Free tier limits**: 200k messages/day, 100 concurrent connections
-   **Channels**: Use public channels for this application
-   **Cluster**: Choose closest to your users (eu, us-east-1, etc.)

### Timer Configuration

Default timer settings in `lib/realtime.ts`:

-   Total time: 90 seconds
-   Yellow phase: Last 30 seconds
-   Red phase: Last 15 seconds

## 🐛 Troubleshooting

### Common Issues

1. **Real-time not working**

    - Check Pusher credentials in `.env.local`
    - Verify room codes match between interfaces
    - Check browser console for errors

2. **Build errors**

    - Run `yarn build` to check for TypeScript errors
    - Ensure all environment variables are set

3. **Audio not playing**
    - Audio requires user interaction to initialize
    - Check browser audio permissions

### Debug Mode

Enable Pusher logging in development:

```javascript
// In browser console
Pusher.logToConsole = true
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

For issues and questions:

-   Check the troubleshooting section
-   Review Pusher documentation
-   Create an issue in the repository
