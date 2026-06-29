'use client'

import { useEffect, useRef } from 'react'
import s from './cursor.module.css'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only activate on pointer-fine (desktop) devices
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Show cursors once pointer moves
    dot.style.opacity  = '1'
    ring.style.opacity = '1'

    let mouseX = 0, mouseY = 0
    let ringX  = 0, ringY  = 0
    let rafId  = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      // Dot follows immediately
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      // Ring follows with a lag
      ringX = lerp(ringX, mouseX, 0.12)
      ringY = lerp(ringY, mouseY, 0.12)
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    // Scale down ring on interactive elements
    const onPointerEnter = () => ring.setAttribute('data-hover', 'true')
    const onPointerLeave = () => ring.removeAttribute('data-hover')

    const interactives = document.querySelectorAll('a, button, [role="button"], label, select')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onPointerEnter)
      el.addEventListener('mouseleave', onPointerLeave)
    })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', onPointerEnter)
        el.removeEventListener('mouseleave', onPointerLeave)
      })
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className={s.dot}  aria-hidden="true" />
      <div ref={ringRef} className={s.ring} aria-hidden="true" />
    </>
  )
}
