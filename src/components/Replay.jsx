import { useEffect, useMemo, useState } from 'react'
import { useReplay } from '../hooks/useReplay'
import Board from './Board'
import Controls from './Controls'
import MoveList from './MoveList'

export default function Replay({ game }) {
  const { plies, result } = game
  const lastPly = plies.length - 1
  const moveSquares = useMemo(() => plies.map((p) => p.move?.squares ?? 0), [plies])
  const replay = useReplay(moveSquares)
  const [flipped, setFlipped] = useState(false)
  const current = plies[replay.ply]

  useEffect(() => {
    const onKey = (e) => {
      if (['TEXTAREA', 'INPUT', 'SELECT'].includes(e.target.tagName)) return
      const actions = {
        ArrowRight: replay.next,
        ArrowLeft: replay.prev,
        Home: replay.start,
        End: replay.end,
        ' ': replay.toggle,
        f: () => setFlipped((v) => !v),
      }
      const action = actions[e.key]
      if (!action) return
      e.preventDefault()
      if (e.key !== ' ') replay.pause()
      action()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const status = current.move
    ? `${Math.ceil(replay.ply / 2)}${current.move.color === 'w' ? '.' : '...'} ${current.move.san}`
    : 'Starting position'

  return (
    <div className="game-layout">
      <div className="board-col">
        <Board
          pieces={current.pieces}
          lastMove={current.move}
          checkSquare={current.checkSquare}
          flipped={flipped}
          msPerSquare={replay.msPerSquare}
        />
        <div className="status">
          <strong>{status}</strong>
          <span>
            Move {replay.ply} of {lastPly}
            {replay.ply === lastPly && result ? ` · ${result}` : ''}
          </span>
        </div>
      </div>
      <div className="side-col">
        <Controls replay={replay} lastPly={lastPly} flipped={flipped} onFlip={() => setFlipped((v) => !v)} />
        <MoveList
          plies={plies}
          ply={replay.ply}
          onSelect={(i) => {
            replay.pause()
            replay.goTo(i)
          }}
        />
      </div>
    </div>
  )
}
