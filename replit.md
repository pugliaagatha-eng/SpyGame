# SpyGamePlus

## Overview
SpyGamePlus is a multiplayer social deduction game where players take on roles as Agents, Spies, Triple Agents, or Jesters. Players work together (or against each other) through missions, voting, and discussions to identify the spies among them.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Express.js + Node.js
- **Real-time**: WebSocket (ws library)
- **UI**: Radix UI + Tailwind CSS + Framer Motion
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form + Zod
- **Storage**: In-memory (MemStorage)

## Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   │   ├── game/   # Game-specific components
│   │   │   └── ui/     # Reusable UI components (shadcn)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utilities and helpers
│   │   └── pages/      # Page components
│   └── public/         # Static assets (audio files)
├── server/             # Express backend
│   ├── index.ts        # Main server entry point
│   ├── routes.ts       # API routes
│   ├── storage.ts      # In-memory storage logic
│   ├── websocket.ts    # WebSocket handlers
│   └── vite.ts         # Vite dev server integration
└── shared/             # Shared TypeScript types
    └── schema.ts       # Game types and constants
```

## Key Features
- **8 Unique Abilities**: Including Shield, Swap Vote, Extra Time, Force Revote, Peek Role, Negative Vote, Forensic Investigation, and Scramble Fact
- **150+ Missions**: Various mission types including drawing, emoji, code, gesture, word, ranking, and explanation missions
- **Real-time Communication**: WebSocket-based synchronization for multiplayer gameplay
- **Voting System**: Tie detection and elimination mechanics
- **Drawing Canvas**: Interactive canvas for drawing missions
- **Audio System**: Background music and victory sound effects
- **Auto-reconnect**: Players can rejoin games after disconnection
- **Spy Chat**: Secret communication channel for spies

## Development

### Running Locally
The dev server runs on port 5000 and serves both the API and the frontend:
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

## Game Mechanics

### Roles
- **Agents**: Know the secret, must identify and eliminate all spies
- **Spies**: Don't know the secret, must avoid detection or achieve majority
- **Triple Agent**: Appears as spy but wins with agents
- **Jester**: Wins by getting eliminated

### Game Phases
1. Role Reveal - Players see their secret role
2. Mission - Players receive mission (Agents see secret, Spies don't)
3. Drawing - If mission requires drawing, all players draw
4. Discussion - Players discuss and identify suspects
5. Voting - Vote to eliminate someone
6. Voting Result - See who was eliminated
7. Game Over - Winners announced

### Win Conditions
- **Agents**: Eliminate all spies
- **Spies**: Achieve absolute majority
- **Jester**: Get eliminated

## Configuration

### Server Settings
- Default port: 5000 (configurable via PORT env var)
- Host: 0.0.0.0 (accepts all connections)
- Max players per room: 12 (configurable in storage.ts)

### Storage
Currently using in-memory storage (MemStorage). Rooms are lost when server restarts. For persistence, a database implementation would be needed.

## Recent Changes
- November 30, 2024: Initial Replit setup
  - Configured development workflow on port 5000
  - Set up deployment configuration for VM
  - Added .gitignore for Node.js
  - Server already configured with allowedHosts: true for Replit proxy

## Notes
- The server is configured to work with Replit's proxy system (allowedHosts: true in vite.ts)
- WebSocket connections use the /ws path
- Game state is stored in memory and will be lost on server restart
- Audio files are served from client/public/
