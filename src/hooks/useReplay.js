import { useEffect, useState } from 'react'

export function useReplay(lastPly) {
  const [ply, setPly] = useState(0)
  const [playingRequested, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(900) // ms per move
  const playing = playingRequested && ply < lastPly

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setPly((p) => Math.min(p + 1, lastPly)), speed)
    return () => clearTimeout(t)
  }, [playing, ply, lastPly, speed])

  const goTo = (p) => setPly(Math.max(0, Math.min(lastPly, p)))

  return {
    ply,
    playing,
    speed,
    setSpeed,
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
