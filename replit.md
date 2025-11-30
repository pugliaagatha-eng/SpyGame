# Jogo de Espiões (Spy Game)

## Overview

Jogo de Espiões is a multiplayer social deduction game inspired by titles like Among Us, Jackbox Games, and Skribbl.io. Players compete to identify spies among them through drawing challenges, strategic voting, and special abilities. The game supports both local (pass-and-play) and online multiplayer modes with real-time WebSocket communication.

The application features a cyberpunk-themed UI with neon aesthetics, role-based gameplay mechanics, and interactive mini-games centered around drawing and discussion phases. Players are assigned secret roles (Agents, Spies, Triple Agents, or Jesters) and must use deduction and social manipulation to achieve their faction's victory conditions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR support
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management with disabled refetching (stale time set to Infinity)

**UI Component System:**
- Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, tooltips, etc.)
- Shadcn/ui component library with customized "new-york" style variant
- Tailwind CSS for utility-first styling with custom design tokens
- Custom cyberpunk/gaming theme with neon glow effects, cyan/purple color palette, and specialized fonts (Rajdhani, Orbitron, JetBrains Mono)

**State Management:**
- Local component state with React hooks (useState, useEffect, useCallback)
- Custom `useWebSocket` hook for real-time game state synchronization
- Game state stored in-memory on both client and server, synced via WebSocket messages

**Key Design Patterns:**
- Component composition with examples directory for isolated component development
- Custom hooks for reusable logic (useWebSocket, useToast, useIsMobile)
- Mobile-first responsive design with breakpoints at 768px (tablet) and 1024px (desktop)

### Backend Architecture

**Server Framework:**
- Express.js HTTP server with TypeScript
- WebSocket server using `ws` library mounted on the same HTTP server
- Custom logging middleware for request tracking and debugging

**Game Logic:**
- In-memory storage implementation (`MemStorage` class) for room and player management
- No persistent database - all game state is ephemeral and expires after inactivity
- Automatic cleanup of old rooms via interval-based garbage collection (60-second intervals)

**API Structure:**
- RESTful endpoints for room creation and joining (`/api/rooms`, `/api/rooms/join`)
- WebSocket protocol for real-time game updates (player actions, phase transitions, voting)
- Message-based WebSocket communication with typed action handlers

**Build System:**
- Custom build script using esbuild for server bundling
- Vite for client bundling with separate output directories
- Dependency allowlisting to bundle specific packages and reduce syscalls for faster cold starts

### Real-Time Communication

**WebSocket Implementation:**
- Persistent connections with heartbeat/ping-pong mechanism (30-second intervals)
- Room-based message broadcasting - clients subscribe to specific room channels
- Extended WebSocket interface tracking roomId, playerId, and connection health
- Automatic reconnection handling on client side with connection status tracking

**Message Types:**
- `room_update`: Full room state synchronization
- `player_joined`, `player_left`: Player connection events
- `game_started`: Game initialization with role assignments
- `phase_changed`: Game phase transitions
- `vote_cast`, `drawing_submitted`: Player action events
- `error`: Error notifications to clients

### Game State Management

**Core Game Phases:**
1. `waiting`: Lobby phase where players join
2. `role_reveal`: Individual role and ability reveals
3. `mission`: Mission briefing with secret information distribution
4. `drawing`: Canvas-based drawing mini-game
5. `discussion`: Timed discussion phase with drawing reveals
6. `voting`: Sequential voting with hidden selections
7. `voting_result`: Vote reveal and elimination
8. `game_over`: Victory condition display and game recap

**Role System:**
- Agents: Know the secret word, must identify spies
- Spies: Don't know the secret word, must avoid detection
- Triple Agents: Know the secret word but win with spies
- Jesters: Win if eliminated, adding strategic chaos

**Ability System:**
- Each player receives one random ability per game (role-dependent for special cases)
- Standard Abilities: spy vote, swap vote, extra time, force revote, peek role, shield
- Role-Specific Abilities:
  - **Jester - Voto Negativo (Passive)**: Jester's votes count as -1 instead of +1, potentially saving players from elimination
  - **Agent - Investigação Forense (Rare, 10% chance)**: View who voted for whom in the previous round
- Single-use abilities with targeting mechanics where applicable
- Passive abilities (like Voto Negativo) are automatically applied without manual activation

### Data Schema

**Type System:**
- Zod schemas for runtime validation (`@shared/schema.ts`)
- Shared TypeScript types between client and server
- Validation schemas for API requests (createRoomSchema, joinRoomSchema)

**Core Data Models:**
- `Room`: Game session with players, current phase, mission data, votes, and game configuration
- `Player`: User data including role, abilities, voting status, and elimination state
- `Mission`: Drawing challenge with secret facts, hints, and duration
- `DrawingData`: Canvas image data associated with player submissions

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Complete suite of headless UI primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **cmdk**: Command palette component for potential future features

### WebSocket & Real-Time
- **ws**: Core WebSocket server implementation
- **@neondatabase/serverless**: Neon's serverless driver (configured but not actively used - database provisioning expected)

### Database (Configured but Inactive)
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect
- **drizzle-zod**: Schema-to-Zod conversion utilities
- Configuration points to PostgreSQL via `DATABASE_URL` environment variable
- Migration directory setup at `./migrations`
- Note: Current implementation uses in-memory storage; database integration is prepared but not implemented

### Form Handling & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Resolver integration for schema validation
- **zod**: Runtime type validation and schema definition
- **zod-validation-error**: Enhanced error messages for validation failures

### Utility Libraries
- **clsx** & **tailwind-merge**: Conditional className composition
- **class-variance-authority**: Type-safe variant API for component styling
- **date-fns**: Date manipulation utilities
- **nanoid**: Unique identifier generation

### Development Tools
- **Replit Plugins**: Development banner, cartographer, and runtime error overlay for Replit environment
- **tsx**: TypeScript execution for development and build scripts
- **vite**: Development server and build tool
- **esbuild**: Production server bundling

### Fonts (External CDN)
- Google Fonts: Rajdhani (primary UI), Orbitron (headings), JetBrains Mono (code/timers)