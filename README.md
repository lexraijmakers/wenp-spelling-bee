# Wauw & Pittigman Spelling Bee

A real-time Dutch spelling bee web application built with Next.js and Pusher, designed for spelling contests following official rules.

## 🎯 Overview

Two synchronized interfaces for conducting spelling bees:

-   **Judge Interface**: Word selection, timer control, and scoring
-   **Display Interface**: Contestant view with timer and status updates

## ✅ Features

-   **Real-time synchronization** between judge and display using Pusher Channels
-   **Timer system** with 90-second countdown and color phases (green/yellow/red)
-   **Word selection** by difficulty level (Very Easy to Very Hard)
-   **Room-based sessions** with unique 4-digit codes
-   **Database-driven** word management with PostgreSQL and Prisma
-   **Responsive design** for projection and mobile devices
-   **Dutch language interface**

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+
-   Yarn
-   PostgreSQL database
-   Pusher account

### Setup

1. **Clone and install**

    ```bash
    git clone https://github.com/lexraijmakers/wenp-spelling-bee.git
    cd wp-spelling-bee
    yarn install
    ```

2. **Environment variables** (`.env.local`)

    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/spelling_bee"
    PUSHER_APP_ID=your_app_id
    PUSHER_KEY=your_key
    PUSHER_SECRET=your_secret
    PUSHER_CLUSTER=your_cluster
    NEXT_PUBLIC_PUSHER_KEY=your_key
    NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
    ```

3. **Database setup**

    ```bash
    npx prisma generate
    npx prisma db push
    yarn db:seed
    ```

4. **Run development server**

    ```bash
    yarn dev
    ```

## 📖 Usage

1. **Create session** at `http://localhost:3000`
2. **Judge interface**: `/judge?room=XXXX`
3. **Display interface**: `/display?room=XXXX` (for projection)

### Game Flow

1. Judge selects word by difficulty level
2. Judge starts 90-second timer
3. Contestant spells during any phase
4. Judge marks correct/incorrect to end round

### Timer Phases

-   **Green (60s)**: All requests allowed
-   **Yellow (30s)**: Final requests period
-   **Red (30s)**: Must begin spelling

## 🏗️ Architecture

### Tech Stack

-   **Framework**: Next.js 15 with TypeScript
-   **Database**: PostgreSQL with Prisma ORM
-   **Real-time**: Pusher Channels
-   **Styling**: Tailwind CSS v4
-   **UI**: Radix UI components

### API Routes

-   `POST /api/pusher/word-selected` - New word selection
-   `POST /api/pusher/timer-start` - Start timer
-   `POST /api/pusher/timer-reset` - Reset timer
-   `POST /api/pusher/judge-decision` - Final decision
-   `GET /api/words` - Fetch words
-   `GET /api/words/[id]` - Single word

### Real-time Events

Channel: `spelling-bee-{roomCode}`

-   `word-selected` - New word chosen
-   `timer-start` - Timer started
-   `timer-reset` - Timer reset
-   `judge-decision` - Round completed

## 🗂️ Word Database

Database schema:

```typescript
interface Word {
    id: string
    word: string
    definition: string
    sentence: string
    difficulty: 'VERY_EASY' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD'
}
```

### Management

-   **Seeding**: `yarn db:seed` - loads Dutch words
-   **Admin**: `/words` page for CRUD operations
-   **Content**: 50+ authentic Dutch words from NTR Groot Dictee

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Add environment variables
3. Set up PostgreSQL database
4. Deploy

Compatible with any serverless platform supporting Next.js and PostgreSQL.

## ⚙️ Configuration

Timer settings in `lib/timer-config.ts`:

```typescript
export const DEFAULT_TIMER_CONFIG = {
    totalTime: 90, // Total seconds
    yellowPhaseStart: 60, // Yellow at 30s remaining
    redPhaseStart: 30 // Red at 30s remaining
}
```

## 🐛 Troubleshooting

**Real-time issues**: Check Pusher credentials and room codes match  
**Database issues**: Verify `DATABASE_URL` and run `npx prisma db push`  
**Build errors**: Ensure all environment variables are set

## 📄 License

MIT License

---

Production-ready spelling bee application for Dutch contests.
