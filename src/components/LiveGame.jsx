import { useMemo, useRef, useState } from 'react'
import { parseGame } from '../lib/game'
import Board from './Board'
import MoveList from './MoveList'

const MS_PER_SQUARE = 150

// Move-by-move mode: the moves are entered one at a time and each is animated as it's played.
export default function LiveGame({ moves, setMoves }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const inputRef = useRef(null)

  // Replaying from the start each time keeps piece ids identical between positions,
  // so the board animates only the piece(s) that moved.
  const game = useMemo(() => parseGame(moves.join(' ')), [moves])
  const current = game.plies.at(-1)
  const toMove = moves.length % 2 === 0 ? 'w' : 'b'
  const over = Boolean(game.result)

  const update = (next) => {
    setMoves(next)
    setError(null)
    inputRef.current?.focus()
  }

  const submit = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    // Accepts one move or several ("e4 e5 Nf3"); all of them must be legal.
    const result = parseGame(`${moves.join(' ')} ${text}`)
    if (result.error) {
      setError(result.error)
      return
    }
    update(result.plies.slice(1).map((p) => p.move.san))
    setInput('')
  }

  return (
    <div className="game-layout">
      <div className="board-col">
        <Board
          pieces={current.pieces}
          lastMove={current.move}
          checkSquare={current.checkSquare}
          flipped={flipped}
          msPerSquare={MS_PER_SQUARE}
        />
      </div>
      <div className="side-col">
        <div className="live-panel">
          <div className="turn">
            {!over && <span className={`turn-dot ${toMove}`} />}
            {over ? (
              <span className="result">{game.result}</span>
            ) : (
              <span>
                {toMove === 'w' ? 'White' : 'Black'} to move
                {current.checkSquare ? ' (in check)' : ''}
              </span>
            )}
          </div>
          <form className="move-form" onSubmit={submit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError(null)
              }}
              placeholder={over ? 'Game over' : `Move ${Math.floor(moves.length / 2) + 1}${toMove === 'w' ? '.' : '...'} e.g. ${toMove === 'w' ? 'e4' : 'e5'}`}
              disabled={over}
              aria-invalid={Boolean(error)}
              aria-label="Next move"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <button className="primary" type="submit" disabled={over || !input.trim()}>
              Play
            </button>
          </form>
          {error ? (
            <p className="live-error">{error}</p>
          ) : (
            <p className="hint">Type a move like Nf3, exd5, O-O, e8=Q or g1f3, then press Enter.</p>
          )}
          <div className="live-actions">
            <button onClick={() => update(moves.slice(0, -1))} disabled={moves.length === 0} title="Take back the last move">
              ↶ Undo
            </button>
            <button onClick={() => update([])} disabled={moves.length === 0} title="Back to the starting position">
              Reset
            </button>
            <button onClick={() => setFlipped((v) => !v)} aria-pressed={flipped} title="Flip board">
              ⇅ Flip
            </button>
          </div>
        </div>
        <MoveList plies={game.plies} ply={game.plies.length - 1} />
      </div>
    </div>
  )
}
