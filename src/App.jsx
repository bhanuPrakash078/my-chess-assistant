import { useState } from 'react'
import { parseGame } from './lib/game'
import { SAMPLES } from './lib/samples'
import NotationInput from './components/NotationInput'
import Replay from './components/Replay'

export default function App() {
  const [text, setText] = useState(SAMPLES[0].pgn)
  const [game, setGame] = useState(() => ({ ...parseGame(SAMPLES[0].pgn), key: 0 }))

  const load = (pgn) => setGame((g) => ({ ...parseGame(pgn), key: g.key + 1 }))

  return (
    <main>
      <header>
        <h1>Chess Replay</h1>
        <p>Paste a game in chess notation and watch it play out.</p>
      </header>
      <NotationInput text={text} onChange={setText} onLoad={load} />
      {game.error && <div className="error">{game.error}. Showing the moves up to that point.</div>}
      {/* key resets playback whenever a new game is loaded */}
      <Replay key={game.key} game={game} />
    </main>
  )
}
