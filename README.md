# 4 in a Row - Real-Time Multiplayer Game

A full-stack, real-time multiplayer implementation of the classic Connect Four game with competitive bot AI, built for the Backend Engineering Intern Assignment.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6-black.svg)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [User Flow](#-user-flow)
- [System Flow](#-system-flow)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Bot AI Strategy](#-bot-ai-strategy)
- [Deployment](#-deployment)


## ✨ Features

### Core Gameplay
- **Real-time Multiplayer** - Play against other players using WebSocket connections
- **Competitive Bot AI** - Strategic bot with minimax algorithm and alpha-beta pruning
- **Smart Matchmaking** - Auto-match with bot after 10-second timeout
- **Reconnection Support** - 30-second grace period to rejoin games
- **Move Validation** - Server-side validation for all moves
- **Win Detection** - Automatic detection of horizontal, vertical, and diagonal wins

### User Experience
- **Live Leaderboard** - Real-time rankings by wins and win rate
- **Move History** - Track all moves during gameplay with auto-scroll
- **Player Statistics** - Games played, won, lost, and win percentage
- **Animated UI** - Smooth disc drop animations and celebrations
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Dark Theme** - Modern gaming aesthetic with Tailwind CSS

### Technical Features
- **WebSocket Communication** - Real-time bidirectional communication
- **PostgreSQL Database** - Persistent storage with Prisma ORM
- **RESTful API** - Endpoints for stats, leaderboard, and analytics
- **Event Analytics** - Track gameplay events for insights
- **Error Handling** - Comprehensive error handling and user feedback
- **Connection Management** - Auto-reconnect and disconnect handling

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Real-time:** Socket.IO
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Environment:** dotenv

### Frontend
- **Framework:** React 18.2
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **WebSocket:** Socket.IO Client
- **Effects:** react-confetti

### DevOps
- **Version Control:** Git
- **Package Manager:** npm
- **Database Hosting:** Neon / Supabase (recommended)
- **Backend Hosting:** Render / Railway / Heroku
- **Frontend Hosting:** Vercel / Netlify / Cloudflare Pages

## Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        UI[React UI]
        SC[Socket Context]
        GC[Game Context]
    end
    
    subgraph Server["Server Layer"]
        WS[WebSocket Server]
        API[REST API]
        GM[Game Manager]
        MM[Matchmaking]
        BOT[Bot AI]
    end
    
    subgraph Data["Data Layer"]
        DB[(PostgreSQL)]
        PRISMA[Prisma ORM]
    end
    
    UI --> SC
    UI --> GC
    SC <-->|Socket.IO| WS
    GC <-->|HTTP| API
    
    WS --> GM
    WS --> MM
    GM --> BOT
    
    API --> PRISMA
    GM --> PRISMA
    PRISMA <--> DB
    
    style Client fill:#4299e1
    style Server fill:#48bb78
    style Data fill:#ed8936
```

## User Flow

```mermaid
graph TD
    START([User Opens App]) --> CONNECT{Connected to Server?}
    
    CONNECT -->|No| WAIT[Show Connecting...]
    WAIT --> CONNECT
    
    CONNECT -->|Yes| ENTER[Enter Username]
    ENTER --> JOIN[Join Game]
    
    JOIN --> STATS[Show Player Stats]
    STATS --> FIND[Click Find Match]
    
    FIND --> QUEUE[Enter Matchmaking Queue]
    QUEUE --> MATCH{Match Found?}
    
    MATCH -->|Player Found < 10s| PVP[Start PvP Game]
    MATCH -->|Timeout 10s| BOT[Start Bot Game]
    
    PVP --> GAME[Game Screen]
    BOT --> GAME
    
    GAME --> TURN{My Turn?}
    
    TURN -->|Yes| CLICK[Click Column]
    CLICK --> DROP[Drop Disc]
    DROP --> UPDATE[Update Board]
    
    TURN -->|No| WAITING[Wait for Opponent]
    WAITING --> RECEIVE[Receive Move]
    RECEIVE --> UPDATE
    
    UPDATE --> HISTORY[Update Move History]
    HISTORY --> CHECK{Game Over?}
    
    CHECK -->|No| TURN
    CHECK -->|Yes| RESULT[Show Result Modal]
    
    RESULT --> WINNER{Winner?}
    WINNER -->|Yes| CONFETTI[🎉 Confetti]
    WINNER -->|Draw| DRAW[🤝 Draw Message]
    WINNER -->|Forfeit| FORFEIT[Opponent Disconnected]
    
    CONFETTI --> CHOICE[User Choice]
    DRAW --> CHOICE
    FORFEIT --> CHOICE
    
    CHOICE -->|Play Again| FIND
    CHOICE -->|Back to Menu| STATS
    
    style START fill:#4299e1
    style GAME fill:#48bb78
    style RESULT fill:#ed8936
    style CONFETTI fill:#f6e05e
```

## System Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Socket Server
    participant GM as Game Manager
    participant MM as Matchmaking
    participant BOT as Bot AI
    participant DB as Database
    
    Note over C,DB: Connection & Authentication
    C->>S: Connect via WebSocket
    S-->>C: Connection Established
    C->>S: join(username)
    S->>DB: findOrCreatePlayer(username)
    DB-->>S: Player Data
    S-->>C: joined(stats)
    
    Note over C,DB: Matchmaking Phase
    C->>S: find-match(username)
    S->>MM: joinQueue(username)
    
    alt Player Found
        MM->>GM: createGame(player1, player2)
        GM-->>S: Game Created
        S-->>C: match-found(game, opponent)
    else 10 Second Timeout
        MM->>GM: createGame(player1, null, isBot=true)
        GM->>BOT: Initialize Bot
        GM-->>S: Bot Game Created
        S-->>C: match-found(game, opponent=Bot)
    end
    
    Note over C,DB: Gameplay Phase
    loop Each Turn
        C->>S: make-move(gameId, username, col)
        S->>GM: makeMove(gameId, username, col)
        GM->>GM: Validate Move
        GM->>GM: Update Board
        GM->>GM: Check Winner
        
        alt Valid Move
            GM-->>S: Move Result
            S-->>C: move-made(board, nextTurn)
            S->>DB: logEvent(move_made)
            
            alt Bot Game & Bot's Turn
                GM->>BOT: getBestMove(board)
                BOT->>BOT: Minimax Algorithm
                BOT-->>GM: Best Column
                GM->>GM: Make Bot Move
                GM-->>S: Bot Move Result
                S-->>C: move-made(board, nextTurn)
            end
            
            alt Game Over
                GM->>DB: saveGame(gameData)
                GM->>DB: updatePlayerStats()
                DB-->>GM: Updated Stats
                S-->>C: move-made(gameOver=true, winner)
            end
        else Invalid Move
            GM-->>S: Error
            S-->>C: move-error(message)
        end
    end
    
    Note over C,DB: Post-Game
    C->>S: Request Leaderboard
    S->>DB: getLeaderboard(limit=10)
    DB-->>S: Top Players
    S-->>C: Leaderboard Data
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher) OR Cloud Database (Neon/Supabase)
- npm or yarn
- Git

### Clone Repository
```bash
git clone https://github.com/rajat-sharma-3745/4-in-a-row.git
cd 4-in-a-row
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Install Prisma
npm install @prisma/client
npm install -D prisma

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database or view in Prisma Studio
npx prisma studio

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/four_in_a_row"

# For Neon (Free Cloud Database)
# DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# For Supabase (Free Cloud Database)
# DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"
```

### Frontend (.env)
```env
# Backend WebSocket URL
VITE_SOCKET_URL=http://localhost:5000

# Production
# VITE_SOCKET_URL=https://your-backend-url.com
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

**Access Application:**
Open your browser and navigate to `http://localhost:5173`


##  API Documentation

### REST Endpoints

#### Health Check
```http
GET /health
```
Returns server status and timestamp.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1704067200000
}
```

#### Game Statistics
```http
GET /stats
```
Returns overall game statistics.

**Response:**
```json
{
  "activeGames": 5,
  "playersInQueue": 2,
  "totalGames": 150,
  "gamesWithBot": 80,
  "gamesWithPlayers": 70,
  "avgDuration": 180000,
  "avgMoveCount": 25.5,
  "totalPlayers": 50,
  "activePlayers": 35,
  "gamesLast7Days": 45
}
```

#### Leaderboard
```http
GET /leaderboard?limit=10
```
Returns top players by wins.

**Query Parameters:**
- `limit` (optional): Number of players to return (default: 10)

**Response:**
```json
[
  {
    "username": "Alice",
    "gamesPlayed": 20,
    "gamesWon": 15,
    "gamesLost": 3,
    "gamesDrawn": 2,
    "winRate": 75.0
  }
]
```

#### Player Statistics
```http
GET /player/:username
```
Returns detailed player statistics and recent games.

**Response:**
```json
{
  "player": {
    "username": "Alice",
    "gamesPlayed": 20,
    "gamesWon": 15,
    "winRate": 75.0
  },
  "rank": 1,
  "recentGames": [...]
}
```

#### Analytics
```http
GET /analytics
```
Returns game analytics and insights.

**Response:**
```json
{
  "stats": {...},
  "topWinners": [...]
}
```

### WebSocket Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ username: string }` | Join game with username |
| `find-match` | `{ username: string }` | Enter matchmaking queue |
| `make-move` | `{ gameId: string, username: string, col: number }` | Make a move |
| `leave-queue` | `{ username: string }` | Leave matchmaking queue |
| `get-game-state` | `{ gameId: string }` | Request current game state |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `joined` | `{ username: string, stats: object }` | Join confirmation with stats |
| `match-found` | `{ game: object, opponent: string }` | Match found notification |
| `matchmaking-waiting` | `{ message: string }` | Waiting for opponent |
| `move-made` | `{ board: array, nextTurn: number, gameOver: boolean }` | Move update |
| `opponent-disconnected` | `{ username: string, message: string }` | Opponent left game |
| `opponent-reconnected` | `{ username: string }` | Opponent rejoined |
| `game-reconnected` | `{ game: object }` | Reconnected to existing game |
| `error` | `{ message: string }` | Error notification |

## Bot AI Strategy

The bot uses a sophisticated minimax algorithm with alpha-beta pruning:

### Priority System
1. **Immediate Win** - Take winning move if available
2. **Block Opponent** - Block opponent's winning move
3. **Strategic Play** - Use minimax algorithm (depth 4) for optimal moves
4. **Center Preference** - Favor center columns for more opportunities

### Evaluation Criteria
- **4-in-a-row** = +100 points (win)
- **3-in-a-row + 1 empty** = +5 points (strong position)
- **2-in-a-row + 2 empty** = +2 points (potential)
- **Opponent 3-in-a-row + 1 empty** = -4 points (must block)

### Algorithm
```javascript
minimax(board, depth, alpha, beta, isMaximizing) {
  // Evaluate board position
  // Recursive tree search with alpha-beta pruning
  // Returns best move column
}
```

## Deployment

### Backend Deployment (Render)

1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add DATABASE_URL, PORT, etc.

### Frontend Deployment (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:** Add VITE_SOCKET_URL

### Database (Neon)

1. Create account on [Neon](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to backend environment variables


## Testing

### Backend Tests
```bash
cd backend

# Test game logic
node src/game/test.js
```