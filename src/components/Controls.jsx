export default function Controls({ replay, lastPly, flipped, onFlip }) {
  const { ply, playing } = replay
  return (
    <div className="controls">
      <div className="buttons">
        <button onClick={replay.start} disabled={ply === 0} title="Start (Home)">⏮</button>
        <button onClick={replay.prev} disabled={ply === 0} title="Previous (←)">◀</button>
        <button className="play" onClick={replay.toggle} title="Play / pause (Space)">
          {playing ? '❚❚' : '▶'}
        </button>
        <button onClick={replay.next} disabled={ply === lastPly} title="Next (→)">▶︎|</button>
        <button onClick={replay.end} disabled={ply === lastPly} title="End (End)">⏭</button>
        <button onClick={onFlip} title="Flip board (F)" aria-pressed={flipped}>⇅</button>
      </div>
      <label className="speed">
        <span>Speed</span>
        <input
          type="range"
          min={60}
          max={300}
          step={10}
          value={360 - replay.msPerSquare}
          onChange={(e) => replay.setMsPerSquare(360 - Number(e.target.value))}
        />
      </label>
    </div>
  )
}
