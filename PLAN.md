# Chess Replay: Implementation Plan

**Goal:** paste a game in chess notation (PGN / SAN, e.g. `1. e4 e5 2. Nf3 Nc6 ...`) and watch the pieces move on the board.

## Stack
- **React 19 + Vite**: UI and dev server
- **chess.js**: parses PGN/SAN, validates moves, and resolves ambiguous moves (`Nbd7`), castling, en passant and promotion into exact from/to squares. We won't write our own notation parser.
- **Assets** (`public/assets/`): cburnett SVG pieces and wood board texture (see `CREDITS.md`)

## Step 1: Assets and scaffold ✅ (this commit)
- Vite React app, chess.js installed
- Pieces and board textures downloaded
- `App.jsx` renders a static board in the starting position (asset preview)

## Step 2: Parse notation into a position timeline ✅
- `src/lib/game.js`: `parseGame(pgnText)` → `{ positions: Board[], moves: MoveMeta[], error }`
  - Use `chess.loadPgn()`; fall back to replaying plain SAN tokens move by move, so input without PGN headers works too
  - Strip move numbers, comments `{...}`, variations `(...)`, NAGs `$1`, and results `1-0`
  - For each move record `{ san, from, to, piece, captured, promotion, flags }` plus the board after it (`chess.board()`)
  - On an illegal move, return the moves up to that point and an error naming the move (e.g. "Move 12… Qxf7 is illegal")

## Step 3: Board component ✅
- `Board.jsx`: 8×8 grid with the wood texture (already working), coordinates, flip-board option
- `Piece.jsx`: positioned absolutely using `transform: translate(file*12.5%, rank*12.5%)`
- Each piece gets a **stable id** across moves so React keeps the same DOM node. Changing the transform then gives a smooth CSS slide (`transition: transform 250ms ease`) with no animation library.
- Highlight the last move's from/to squares; outline the king when it's in check

## Step 4: Playback controls ✅
- `NotationInput.jsx`: textarea plus "Load" button, with a few sample games (e.g. Opera Game, Immortal Game)
- `Controls.jsx`: ⏮ start · ◀ prev · ▶ play/pause · ▶ next · ⏭ end · speed slider
- `MoveList.jsx`: numbered SAN moves; click one to jump there, current move highlighted
- Keyboard: ← → to step, Space to play/pause, Home/End
- State lives in a `useReplay(positions)` hook: `{ ply, playing, speed, next, prev, goTo, toggle }`

## Step 5: Polish
- Special moves: castling slides both king and rook; en passant removes the right pawn; promotion swaps the piece at the end of the slide; captured pieces fade out
- Optional move sound (needs one more small audio asset)
- Responsive layout (board on top, move list below on mobile)
- Unit tests (Vitest) for `parseGame`: castling, promotion, en passant, disambiguation, illegal moves, messy PGN

## File layout (target)
```
src/
  App.jsx
  components/Board.jsx, Piece.jsx, Controls.jsx, MoveList.jsx, NotationInput.jsx
  hooks/useReplay.js
  lib/game.js
  lib/samples.js
public/assets/pieces/cburnett/*.svg, boards/*
```
