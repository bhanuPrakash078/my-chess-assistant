import { useState } from 'react'
import { slideMs, squareDistance } from '../lib/game'

const FILES = 'abcdefgh'

function squareXY(square, flipped) {
  const f = FILES.indexOf(square[0])
  const r = Number(square[1])
  return flipped ? [7 - f, r - 1] : [f, 8 - r]
}

function placeAt(square, flipped) {
  const [x, y] = squareXY(square, flipped)
  return { transform: `translate(${x * 100}%, ${y * 100}%)` }
}

export default function Board({ pieces, lastMove, checkSquare, flipped, msPerSquare }) {
  // Remember the previous position: where each piece was, so its slide time is based on
  // how far it actually travels (also when jumping several moves via the move list), and
  // which pieces were just captured, so they can stay on the board until the attacker
  // reaches them.
  const [shown, setShown] = useState({ pieces, fromSquares: {}, captured: [] })
  if (shown.pieces !== pieces) {
    const remaining = new Set(pieces.map((p) => p.id))
    setShown({
      pieces,
      fromSquares: Object.fromEntries(shown.pieces.map((p) => [p.id, p.square])),
      captured: shown.pieces.filter((p) => !remaining.has(p.id)),
    })
  }

  const slideStyle = (p) => {
    const from = shown.fromSquares[p.id]
    const style = placeAt(p.square, flipped)
    if (from && from !== p.square) style.transitionDuration = `${slideMs(squareDistance(from, p.square), msPerSquare)}ms`
    return style
  }

  // A captured piece stays visible while the attacker covers every square but the last,
  // then fades out as the attacker moves onto it.
  const captureStyle = (victim) => {
    const attacker = pieces.find((p) => p.square === victim.square && shown.fromSquares[p.id] !== p.square)
    const from = attacker && shown.fromSquares[attacker.id]
    const squares = from ? squareDistance(from, victim.square) : 1 // en passant: pawn moves one square
    // The slide is linear, so the attacker enters the last square after (squares-1)/squares of it.
    const perSquare = slideMs(squares, msPerSquare) / squares
    return {
      ...placeAt(victim.square, flipped),
      animationDelay: `${Math.round((squares - 1) * perSquare)}ms`,
      animationDuration: `${Math.round(perSquare)}ms`,
    }
  }

  // Captured pieces are kept in the same id order as the rest, so no <img> ever changes
  // place in the DOM (that would cancel its slide).
  const drawn = [...pieces, ...shown.captured.map((p) => ({ ...p, captured: true }))].sort((a, b) =>
    a.id < b.id ? -1 : 1,
  )

  const files = flipped ? [...FILES].reverse() : [...FILES]
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1]

  return (
    <div className="board">
      {lastMove &&
        [lastMove.from, lastMove.to].map((sq) => (
          <div key={'hl-' + sq} className="overlay last-move" style={placeAt(sq, flipped)} />
        ))}
      {checkSquare && <div className="overlay check" style={placeAt(checkSquare, flipped)} />}

      {/* Light/dark pattern of the edge squares is the same flipped or not. */}
      {ranks.map((r, i) => (
        <span key={'r' + r} className={`coord rank ${i % 2 ? 'on-dark' : 'on-light'}`} style={{ top: `${i * 12.5}%` }}>
          {r}
        </span>
      ))}
      {files.map((f, i) => (
        <span key={'f' + f} className={`coord file ${i % 2 ? 'on-light' : 'on-dark'}`} style={{ left: `${(i + 1) * 12.5}%` }}>
          {f}
        </span>
      ))}

      {drawn.map((p) => (
        <img
          key={p.id}
          className={p.captured ? 'piece captured' : 'piece'}
          src={`/assets/pieces/cburnett/${p.color}${p.type.toUpperCase()}.svg`}
          alt={`${p.color}${p.type} on ${p.square}${p.captured ? ' (captured)' : ''}`}
          draggable={false}
          style={p.captured ? captureStyle(p) : slideStyle(p)}
        />
      ))}
    </div>
  )
}
