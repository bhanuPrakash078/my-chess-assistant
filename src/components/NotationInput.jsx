import { SAMPLES } from '../lib/samples'

export default function NotationInput({ text, onChange, onLoad }) {
  return (
    <div className="notation">
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a game, e.g. 1. e4 e5 2. Nf3 Nc6 ..."
        spellCheck={false}
        rows={5}
      />
      <div className="notation-actions">
        <select
          value=""
          onChange={(e) => {
            const sample = SAMPLES[Number(e.target.value)]
            onChange(sample.pgn)
            onLoad(sample.pgn)
          }}
        >
          <option value="" disabled>Sample games…</option>
          {SAMPLES.map((s, i) => (
            <option key={s.name} value={i}>{s.name}</option>
          ))}
        </select>
        <button className="primary" onClick={() => onLoad(text)}>Load game</button>
      </div>
    </div>
  )
}
