# Design Guidelines: Jogo de Espiões

## Design Approach
**Gaming-Optimized System Design** - Adapted from Material Design and modern gaming UI patterns (Among Us, Jackbox Games, Skribbl.io) to balance clarity, engagement, and fast-paced interaction.

## Core Design Principles
1. **State Clarity**: Every game phase must be instantly recognizable
2. **Role Distinction**: Visual hierarchy clearly separates player roles without spoiling secrets
3. **Rapid Comprehension**: Information presented in scannable chunks for timed gameplay
4. **Tactile Feedback**: All interactive elements provide immediate visual response

## Typography System

**Font Families**:
- Primary: 'Poppins' (Google Fonts) - headings, buttons, game states
- Secondary: 'Inter' (Google Fonts) - body text, descriptions, timers

**Hierarchy**:
- Game Title: 3rem (mobile) / 4rem (desktop), extrabold
- Phase Headers: 1.75rem / 2.5rem, bold
- Role Titles: 2rem / 2.5rem, bold
- Mission Titles: 1.5rem / 2rem, semibold
- Body/Descriptions: 1rem / 1.125rem, regular
- Timer Display: 2.5rem / 3rem, bold, monospace
- Button Text: 1rem / 1.125rem, semibold
- Small UI Text: 0.875rem, medium

## Layout System

**Spacing Units**: Tailwind primitives - 2, 4, 8, 12, 16, 24, 32 units
- Consistent card padding: p-6 (mobile) / p-8 (desktop)
- Section spacing: space-y-6 (mobile) / space-y-8 (desktop)
- Button groups: gap-3
- Grid gaps: gap-4

**Container Structure**:
- Max-width: max-w-2xl for main game container
- Modal max-width: max-w-lg
- Minigame canvas: max-w-3xl for drawing/decoding interfaces

**Responsive Breakpoints**:
- Mobile-first approach
- Tablet (md:): 768px
- Desktop (lg:): 1024px

## Component Library

### Navigation & Header
- Fixed position mute button (top-right corner, floating with blur backdrop)
- Phase indicator bar showing current round (1/3, 2/3, 3/3) with progress dots
- Back to lobby button (always accessible, subtle placement)

### Cards & Containers
**Game Container**:
- Glassmorphic effect with backdrop blur
- Rounded corners: rounded-2xl
- Elevated shadow for depth

**Role Reveal Cards**:
- Full-width cards with generous padding (p-8)
- Icon/emoji at top (text-6xl size)
- Role name as prominent heading
- Description in readable chunks
- Special info boxes (Secret Facts) with distinct border treatment

**Mission Cards**:
- Compact header with mission number badge
- Clear instruction section
- Public hint box with visual separator
- Action area at bottom

**Minigame Interfaces**:
- Canvas Container: Centered, max-w-3xl, aspect-ratio preserved
- Drawing Interface: Full-width canvas with tool palette below (brush size, clear button)
- Decoding Interface: Monospace text area with decoder wheel/helper UI
- Memory Game: Grid of cards (grid-cols-3 to grid-cols-4) with flip animations

### Buttons
**Primary Actions**: Large touch targets (min 48px height), rounded-xl, full-width on mobile
**Vote Buttons**: Grid layout (grid-cols-2 md:grid-cols-3), equal sizing, clear selection state with scale transform
**Special Ability Buttons**: Icon + text, positioned in floating action bar, badge for unused abilities
**Timer Controls**: Small, subtle, positioned near timer display

### Voting System
- Player cards in grid (2-3 columns)
- Large tap targets with player names
- Selected state: scale-105 with glow effect
- Disabled state: opacity-40 with strikethrough on eliminated players
- Vote confirmation: Check mark icon appears on selected card

### Results & Scoring
- Winner announcement: Full-screen takeover with confetti/celebration elements (CSS particles)
- Role reveal grid: All players displayed with their roles and vote counts
- Stats summary: Clean table or card grid showing voting history
- Achievement unlock notifications: Toast-style from top-right

### Achievements & Stats Dashboard
- Achievement cards: Grid layout (2 cols mobile, 3 cols desktop)
- Lock icon for locked achievements with progress bar
- Stats counters: Large numbers with descriptive labels
- Graph/chart integration for win rates (simple bar charts via CSS)

### Modals & Overlays
**Instructions Modal**:
- Dark backdrop with blur (backdrop-blur-md)
- Scrollable content area
- Sticky close button at top-right
- Tabbed sections (Overview / Roles / Missions / Victory)

**Ability Prompt Modal**:
- Centered, compact (max-w-sm)
- Ability icon and name
- Description text
- Use/Cancel buttons

### Timers & Countdowns
- Circular progress ring (SVG) for visual countdown
- Large numeric display in center
- Pulse animation at <10 seconds remaining
- Phase transition: Brief "Next Phase" interstitial (2s)

## Animations & Interactions

**Critical Animations** (keep subtle):
- Card flip on role reveal: rotate3d transform (0.6s)
- Phase transitions: Fade in/out (0.4s)
- Button press: Scale down slightly on active (scale-95)
- Vote selection: Scale up + glow (0.2s)
- Timer pulse: Gentle scale pulse at low time
- Achievement unlock: Slide-in from top-right (0.5s)

**Prohibited**: Excessive background animations, auto-playing particles, distracting hover effects during timed phases

## Minigame-Specific Design

### Drawing Minigame
- Canvas: White background, border, max 600x400px
- Tool Palette: Horizontal row below canvas (brush sizes: S/M/L, clear button, basic shapes)
- Brush preview: Small circle showing current size
- Time remaining: Prominent above canvas

### Decoding Minigame
- Cipher text: Large, monospace, letter-spaced
- Decoder area: Input field below with real-time preview
- Hint button: Positioned to side, limited uses indicated
- Submit button: Disabled until attempt is ready

### Memory Game
- Card grid: Square tiles, flip animation on reveal
- Matched pairs: Slight opacity reduction, non-interactive
- Lives/attempts: Heart icons or counter display
- Pattern display phase: All cards visible briefly, then flip back

### Special Abilities UI
- Floating action button (bottom-center on mobile, side panel on desktop)
- Badge indicator: Number of abilities remaining
- Ability cards: Icon, name, description, cooldown/one-time indicator
- Confirmation dialog before critical abilities (vote swap, force revote)

## Images
- **Game Logo/Icon**: Spy-themed icon (magnifying glass, silhouette, fingerprint motif) displayed in splash screen above title
- **Role Icons**: Emoji or simple icon graphics for each role type (shield for Agent, mask for Spy, dual-face for Triple Agent, jester hat for Fool)
- **Achievement Badges**: Icon-based graphics for unlockable achievements (first win, perfect game, betrayal, etc.)
- **Mission Backgrounds** (optional): Subtle textured backgrounds for mission cards (map patterns, code motifs)
- No large hero images - game interface is information-dense and functional

## Accessibility
- Touch targets minimum 44x44px
- Focus states on all interactive elements (2px outline offset)
- Clear disabled states (opacity + cursor-not-allowed)
- Screen reader labels for timer, vote counts, role information
- Keyboard navigation: Tab through voteable players, Enter to select

## Critical Implementation Notes
- All game state transitions must be smooth but fast (<0.5s)
- Vote buttons must prevent double-voting with disabled state immediately on selection
- Timer must be client-side with visual-only updates (no game logic disruption)
- Achievement/stats tracking persists via localStorage
- Minigame scores should integrate into voting discussion (optional reveal)
- Mobile optimization: Stack all grids to single column, increase touch target sizes, fixed position for timer/controls