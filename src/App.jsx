// Step 1: asset preview — renders the board texture and piece set in the starting position.
// Move parsing and animation come in the next step (see PLAN.md).

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const BACK_RANK = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']

function startingPiece(file, rank) {
  if (rank === 8) return 'b' + BACK_RANK[file]
  if (rank === 7) return 'bP'
  if (rank === 2) return 'wP'
  if (rank === 1) return 'w' + BACK_RANK[file]
  return null
}

export default function App() {
  const squares = []
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const piece = startingPiece(file, rank)
      const isLight = (file + rank) % 2 === 0
      const tone = isLight ? 'on-light' : 'on-dark'
      squares.push(
        <div key={FILES[file] + rank} className="square">
          {piece && <img src={`/assets/pieces/cburnett/${piece}.svg`} alt={piece} draggable={false} />}
          {file === 0 && <span className={`coord rank ${tone}`}>{rank}</span>}
          {rank === 1 && <span className={`coord file ${tone}`}>{FILES[file]}</span>}
        </div>,
      )
    }
  }

  return (
    <main>
      <h1>Chess Replay</h1>
      <p>Asset preview: board and pieces</p>
      <div className="board">{squares}</div>
    </main>
  )
}
