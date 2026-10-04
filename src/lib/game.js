import { Chess } from 'chess.js'

const BACK_RANK = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
const FILES = 'abcdefgh'
const RESULTS = new Set(['1-0', '0-1', '1/2-1/2', '½-½', '*'])

// Turns PGN or plain SAN text into a list of move tokens.
export function tokenize(text) {
  let s = text
    .replace(/\[[^\]]*\]/g, ' ') // headers
    .replace(/\{[^}]*\}/g, ' ') // comments
    .replace(/;[^\n]*/g, ' ') // line comments
    .replace(/\$\d+/g, ' ') // NAGs
  // variations can nest, so peel them from the inside out
  while (/\([^()]*\)/.test(s)) s = s.replace(/\([^()]*\)/g, ' ')
  return s
    .replace(/\d+\.+/g, ' ') // move numbers: "12." and "12..."
    .split(/\s+/)
    .map((t) => t.replace(/[!?]+$/, ''))
    .filter((t) => t && !RESULTS.has(t))
}

// Pieces keyed by square. Each piece's id is its starting square, which stays
// with it all game so React can keep the same DOM node and animate the slide.
function initialPieces() {
  const board = {}
  for (let f = 0; f < 8; f++) {
    const file = FILES[f]
    board[file + '1'] = { id: file + '1', color: 'w', type: BACK_RANK[f] }
    board[file + '2'] = { id: file + '2', color: 'w', type: 'p' }
    board[file + '7'] = { id: file + '7', color: 'b', type: 'p' }
    board[file + '8'] = { id: file + '8', color: 'b', type: BACK_RANK[f] }
  }
  return board
}

function applyMove(board, move) {
  const next = { ...board }
  const piece = next[move.from]
  delete next[move.from]
  if (move.flags.includes('e')) delete next[move.to[0] + move.from[1]]
  next[move.to] = { ...piece, type: move.promotion || piece.type }

  const rank = move.from[1]
  const rookMove = move.flags.includes('k') ? ['h', 'f'] : move.flags.includes('q') ? ['a', 'd'] : null
  if (rookMove) {
    next[rookMove[1] + rank] = next[rookMove[0] + rank]
    delete next[rookMove[0] + rank]
  }
  return next
}

function snapshot(board) {
  return Object.entries(board).map(([square, p]) => ({ ...p, square }))
}

function kingSquare(board, color) {
  return Object.keys(board).find((sq) => board[sq].type === 'k' && board[sq].color === color)
}

function describeEnd(chess) {
  if (chess.isCheckmate()) return `Checkmate. ${chess.turn() === 'w' ? 'Black' : 'White'} wins`
  if (chess.isStalemate()) return 'Stalemate. Draw'
  if (chess.isInsufficientMaterial()) return 'Draw by insufficient material'
  if (chess.isThreefoldRepetition()) return 'Draw by threefold repetition'
  return null
}

/**
 * Replays a game from the starting position.
 * Returns plies[0..n]: plies[0] is the start, plies[i] is the position after move i.
 * Stops at the first illegal move and reports it in `error`.
 */
export function parseGame(text) {
  const chess = new Chess()
  let board = initialPieces()
  const plies = [{ pieces: snapshot(board), move: null, checkSquare: null }]
  let error = null

  for (const [i, token] of tokenize(text).entries()) {
    let move
    try {
      move = chess.move(token)
    } catch {
      move = null
    }
    if (!move) {
      error = `Move ${Math.floor(i / 2) + 1}${i % 2 ? '...' : '.'} ${token} is illegal or unreadable`
      break
    }
    board = applyMove(board, move)
    plies.push({
      pieces: snapshot(board),
      move: { san: move.san, from: move.from, to: move.to, color: move.color },
      checkSquare: chess.inCheck() ? kingSquare(board, chess.turn()) : null,
    })
  }

  return { plies, error, result: error ? null : describeEnd(chess) }
}
