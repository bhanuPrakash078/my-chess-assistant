import { useState } from 'react'
import { squareDistance } from '../lib/game'

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
  // Remember where each piece was in the previous position, so its slide time is based
  // on how far it actually travels (also when jumping several moves via the move list).
  const [shown, setShown] = useState({ pieces, fromSquares: {} })
  if (shown.pieces !== pieces) {
    setShown({ pieces, fromSquares: Object.fromEntries(shown.pieces.map((p) => [p.id, p.square])) })
  }

  const slideStyle = (p) => {
    const from = shown.fromSquares[p.id]
    const style = placeAt(p.square, flipped)
    if (from && from !== p.square) style.transitionDuration = `${squareDistance(from, p.square) * msPerSquare}ms`
    return style
  }

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

      {pieces.map((p) => (
        <img
          key={p.id}
          className="piece"
          src={`/assets/pieces/cburnett/${p.color}${p.type.toUpperCase()}.svg`}
          alt={`${p.color}${p.type} on ${p.square}`}
          draggable={false}
          style={slideStyle(p)}
        />
      ))}
    </div>
  )
}
