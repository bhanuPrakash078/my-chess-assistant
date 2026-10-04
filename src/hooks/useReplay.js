import { useEffect, useState } from 'react'

// moveSquares[ply] = how many squares the move that produced `ply` slides (0 for the start).
export function useReplay(moveSquares) {
  const lastPly = moveSquares.length - 1
  const [ply, setPly] = useState(0)
  const [playingRequested, setPlaying] = useState(false)
  const [msPerSquare, setMsPerSquare] = useState(150)
  const playing = playingRequested && ply < lastPly

  useEffect(() => {
    if (!playing) return
    // let the current slide finish, then pause briefly before the next move
    const delay = moveSquares[ply] * msPerSquare + msPerSquare * 4
    const t = setTimeout(() => setPly((p) => Math.min(p + 1, lastPly)), delay)
    return () => clearTimeout(t)
  }, [playing, ply, lastPly, msPerSquare, moveSquares])

  const goTo = (p) => setPly(Math.max(0, Math.min(lastPly, p)))

  return {
    ply,
    playing,
    msPerSquare,
    setMsPerSquare,
    goTo,
    next: () => goTo(ply + 1),
    prev: () => goTo(ply - 1),
    start: () => goTo(0),
    end: () => goTo(lastPly),
    toggle: () => {
      if (playing) return setPlaying(false)
      if (ply >= lastPly) setPly(0)
      setPlaying(true)
    },
    pause: () => setPlaying(false),
  }
}
