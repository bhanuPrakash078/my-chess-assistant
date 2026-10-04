import { useEffect, useRef } from 'react'

export default function MoveList({ plies, ply, onSelect }) {
  const listRef = useRef(null)

  // Keep the current move visible without scrolling the whole page.
  useEffect(() => {
    const list = listRef.current
    const el = list?.querySelector('.current')
    if (!el) return
    const top = el.offsetTop // list is the offsetParent (position: relative)
    if (top < list.scrollTop || top + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top - list.clientHeight / 2
    }
  }, [ply])

  const rows = []
  for (let i = 1; i < plies.length; i += 2) rows.push(i)

  const cell = (i) =>
    i < plies.length ? (
      <button className={`san ${i === ply ? 'current' : ''}`} onClick={() => onSelect(i)}>
        {plies[i].move.san}
      </button>
    ) : (
      <span />
    )

  return (
    <div className="move-list" ref={listRef}>
      {rows.length === 0 && <p className="empty">No moves yet.</p>}
      {rows.map((i) => (
        <div className="move-row" key={i}>
          <span className="num">{(i + 1) / 2}.</span>
          {cell(i)}
          {cell(i + 1)}
        </div>
      ))}
    </div>
  )
}
