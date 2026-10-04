import { useState } from 'react'
import { parseGame } from './lib/game'
import { SAMPLES } from './lib/samples'
import NotationInput from './components/NotationInput'
import Replay from './components/Replay'
import LiveGame from './components/LiveGame'

const MODES = [
  { id: 'replay', label: 'Replay a game', blurb: 'Paste a game in chess notation and watch it play out.' },
  { id: 'live', label: 'Move by move', blurb: 'Enter moves one at a time and watch each one play.' },
]

export default function App() {
  const [mode, setMode] = useState('replay')
  const [text, setText] = useState(SAMPLES[0].pgn)
  const [game, setGame] = useState(() => ({ ...parseGame(SAMPLES[0].pgn), key: 0 }))
  // Lifted here so switching tabs doesn't lose the game in progress.
  const [liveMoves, setLiveMoves] = useState([])

  const load = (pgn) => setGame((g) => ({ ...parseGame(pgn), key: g.key + 1 }))

  return (
    <main>
      <header>
        <h1>Chess Replay</h1>
        <p>{MODES.find((m) => m.id === mode).blurb}</p>
      </header>
      <div className="tabs" role="tablist">
        {MODES.map((m) => (
          <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => setMode(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      {mode === 'replay' ? (
        <>
          <NotationInput text={text} onChange={setText} onLoad={load} />
          {game.error && <div className="error">{game.error}. Showing the moves up to that point.</div>}
          {/* key resets playback whenever a new game is loaded */}
          <Replay key={game.key} game={game} />
        </>
      ) : (
        <LiveGame moves={liveMoves} setMoves={setLiveMoves} />
      )}
    </main>
  )
}
