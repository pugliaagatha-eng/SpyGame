# SpyGamePlus

## Overview
SpyGamePlus is a multiplayer social deduction game (minimum 5 players, maximum 12) where players take on roles as Agents, Spies, Triple Agents, or Jesters. Players work together (or against each other) through missions, voting, and discussions to identify the spies among them.

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
- **4 Mission Types**: Exactly 4 types of missions with dedicated phase components:
  - **Desenho (Drawing)**: 15 missions - Agents draw a secret word, Spies improvise
  - **Ordem (Order)**: 12 missions - Drag 4 emojis into the correct order based on a criteria
  - **Código Secreto (Code)**: 12 missions - Enter a 5-digit secret code
  - **História (Story)**: 10 missions - Each player writes 400 characters to continue a story
- **Real-time Communication**: WebSocket-based synchronization for multiplayer gameplay
- **Voting System**: Tie detection and elimination mechanics
- **Drawing Canvas**: Interactive canvas for drawing missions
- **Audio System**: Background music and victory sound effects
- **Auto-reconnect**: Players can rejoin games after disconnection
- **Spy Chat**: Secret communication channel for spies

## Mission Details

### Desenho (Drawing) - 15 missions
- Agents see the secret word and draw it
- Spies don't know the word and must improvise
- All players draw simultaneously
- Drawings are displayed in the discussion phase for comparison

### Ordem (Order) - 12 missions
- 4 emojis must be arranged in a specific order
- Agents know the criteria (e.g., "smaller to larger", "colder to hotter")
- Spies don't know the criteria and must guess the order
- Draggable cards with up/down arrows for mobile support
- Orders are displayed in the discussion phase

### Código Secreto (Code) - 12 missions
- A 5-digit code must be entered
- Agents see the full code only during the animated phone call overlay (5 seconds)
- Spies see the secret fact with letters scrambled (embaralhado) and can use "Transcrever Ligação" ability to unscramble
- No hints are shown to spies
- All players submit their guesses during the mission phase
- Submissions are compared in the discussion phase

### História (Story) - 10 missions
- Agents know a famous story (e.g., "Chapeuzinho Vermelho")
- Spies don't know the story at all
- Turn-based: each player writes up to 400 characters
- Spies can only see what others have written before their turn
- Contributions are displayed sequentially in discussion phase

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
2. Mission - Players receive mission details (Agents see secret, Spies don't)
3. Activity Phase - Depends on mission type:
   - Drawing: All players draw simultaneously
   - Order: All players arrange 4 emojis in order
   - Code: All players submit 5-digit code guesses
   - Story: Players write 400 chars each (turn-based)
4. Discussion - Players discuss and identify suspects, review submissions
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
- Min players per room: 5
- Max players per room: 12

### Storage
Currently using in-memory storage (MemStorage). Rooms are lost when server restarts. For persistence, a database implementation would be needed.

## Recent Changes
- December 1, 2024: Complete Spy Information Redesign
  - Fixed React error #130 in VotingPhase and OrderPhase by replacing HelpCircle with Info/AlertCircle icons
  - Removed ALL hints from spy views (MissionPhase, DrawingCanvas, DiscussionPhase)
  - Agents receive secret fact ONLY via animated phone call overlay (5 seconds)
  - Spies now have a "Transcrever Ligação" button during mission phase (not discussion)
  - Decrypt button sends scrambled secret to spy chat for all spies to see
  - Added decrypt_secret WebSocket handler that broadcasts to all spies
  - Removed scrambled display from MissionPhase - spies must use decrypt button
  - DrawingCanvas no longer shows hint to spies - only "Você não sabe o que desenhar"
  - DiscussionPhase hints only visible to agents (gated by isAgent check)

- December 1, 2024: Previous Bug Fixes
  - Fixed React error #130 causing black screen for spies in discussion phase
  - Removed problematic HelpCircle lucide-react import that was tree-shaken in production
  - Removed duplicate code display: agents now ONLY see secret during phone call overlay

- December 1, 2024: Auto-Disconnect and Draw Condition
  - Added auto-disconnect feature: players who don't reconnect within 45 seconds are removed
  - Game ends in draw if fewer than 5 active players remain
  - Added 'draw' winner type to schema, GameOver, and AudioSystem
  - Added 'player_disconnected' WebSocket event with client toast notifications
  - Draw game over shows gray-themed "Empate!" message

- December 1, 2024: Jester (Tolo) Role Display Fix
  - Added proper handling for jester role across all mission phases
  - MissionPhase: Yellow-themed info box explaining jester doesn't know the secret
  - OrderPhase: Yellow-themed info for jester with their goal to be eliminated
  - StoryPhase: Yellow-themed messages for jester in header and during writing
  - Code missions: Jester now sees scrambled code display like spies
  - All phases use "doesNotKnowSecret" flag to include jester with spies

- December 1, 2024: Order Phase Implementation
  - Created OrderPhase component with draggable emoji cards
  - 4 emojis can be reordered via drag-and-drop or up/down arrows
  - Agents see the correct criteria, spies must guess
  - Order submissions displayed in DiscussionPhase
  - Added OrderSubmission type and WebSocket handlers
  - Order submissions reset between rounds

- December 1, 2024: UI/UX Improvements
  - Changed minimum players from 3 to 5
  - Removed duplicate "Sair da Sala" button in lobby

- December 1, 2024: Code Mission Improvements
  - Added code submission input fields in MissionPhase for all players
  - Players can now submit their code guesses during the mission phase
  - Code submissions are displayed in DiscussionPhase for comparison
  - For spies: first digit is NEVER revealed, only 2 random digits from positions 2-5 shown
  - Spies see scrambled code display (2 revealed in yellow, 3 hidden as "?") + hint
  - Added CodeSubmission type to schema and WebSocket handler for code_submitted event
  - Code submissions reset between rounds

- December 1, 2024: Story Phase Implementation
  - Added StoryPhase component for turn-based story contributions (400 chars per player)
  - Story missions: spies only see what others write (no scrambled letters)
  - Spies see "História Desconhecida" and must deduce from others' contributions
  - Story phase uses WebSocket for real-time turn synchronization
  - DiscussionPhase now shows story contributions for all players to review

- December 1, 2024: Mission System Overhaul
  - Restricted mission types to exactly 4: Drawing, Order, Code (5 digits), Story
  - Created 15 Drawing missions, 12 Order missions, 12 Code missions, 10 Story missions
  - Updated MissionPhase.tsx with type-specific UI (colors, icons, info blocks)
  - Added storyTitle and storyPrompt fields for Story missions

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
