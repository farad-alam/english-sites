'use client'

import { useEffect, useRef } from 'react'

/** 3px progress bar pinned under the sticky header; transform-only, updated in rAF. */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = document.getElementById(targetId)
      const bar = barRef.current
      if (!el || !bar) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight * 0.5
      const done = -rect.top + window.innerHeight * 0.25
      bar.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, done / total)) : 0})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [targetId])

  return (
    <div aria-hidden="true" className="fixed top-16 inset-x-0 z-40 h-[3px] pointer-events-none">
      <div ref={barRef} className="h-full w-full bg-brand-primary origin-left will-change-transform" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}
