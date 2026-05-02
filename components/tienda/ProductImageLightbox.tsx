"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type Props = {
  open: boolean
  onClose: () => void
  urls: string[]
  initialIndex: number
  alt: string
}

function touchDistance(
  a: { clientX: number; clientY: number },
  b: { clientX: number; clientY: number }
): number {
  const dx = a.clientX - b.clientX
  const dy = a.clientY - b.clientY
  return Math.hypot(dx, dy)
}

export function ProductImageLightbox({
  open,
  onClose,
  urls,
  initialIndex,
  alt,
}: Props) {
  const safe = useMemo(
    () => urls.map((u) => u.trim()).filter(Boolean),
    [urls]
  )
  const [index, setIndex] = useState(initialIndex)
  const [animReady, setAnimReady] = useState(false)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const scaleLive = useRef(1)
  const panLive = useRef({ x: 0, y: 0 })
  useEffect(() => {
    scaleLive.current = scale
  }, [scale])
  useEffect(() => {
    panLive.current = pan
  }, [pan])

  const pinchRef = useRef<{ dist: number; baseScale: number } | null>(null)
  const swipeRef = useRef<{ x: number } | null>(null)
  const dragRef = useRef<{
    startX: number
    startY: number
    panStart: { x: number; y: number }
  } | null>(null)

  useEffect(() => {
    if (open) {
      setIndex(
        Math.min(
          Math.max(0, initialIndex),
          Math.max(0, safe.length - 1)
        )
      )
      setScale(1)
      scaleLive.current = 1
      setPan({ x: 0, y: 0 })
      panLive.current = { x: 0, y: 0 }
      const id = requestAnimationFrame(() => setAnimReady(true))
      return () => cancelAnimationFrame(id)
    }
    setAnimReady(false)
    return undefined
  }, [open, initialIndex, safe.length])

  useEffect(() => {
    if (!open || safe.length <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setIndex((i) => (i - 1 + safe.length) % safe.length)
        setScale(1)
        scaleLive.current = 1
        setPan({ x: 0, y: 0 })
        panLive.current = { x: 0, y: 0 }
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        setIndex((i) => (i + 1) % safe.length)
        setScale(1)
        scaleLive.current = 1
        setPan({ x: 0, y: 0 })
        panLive.current = { x: 0, y: 0 }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, safe.length])

  const goPrev = useCallback(() => {
    if (safe.length <= 1) return
    setIndex((i) => (i - 1 + safe.length) % safe.length)
    setScale(1)
    scaleLive.current = 1
    setPan({ x: 0, y: 0 })
    panLive.current = { x: 0, y: 0 }
  }, [safe.length])

  const goNext = useCallback(() => {
    if (safe.length <= 1) return
    setIndex((i) => (i + 1) % safe.length)
    setScale(1)
    scaleLive.current = 1
    setPan({ x: 0, y: 0 })
    panLive.current = { x: 0, y: 0 }
  }, [safe.length])

  const resetZoom = useCallback(() => {
    setScale(1)
    scaleLive.current = 1
    setPan({ x: 0, y: 0 })
    panLive.current = { x: 0, y: 0 }
  }, [])

  const currentSrc = safe[index] ?? ""

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchRef.current = {
        dist: touchDistance(e.touches[0], e.touches[1]),
        baseScale: scaleLive.current,
      }
      swipeRef.current = null
      dragRef.current = null
      return
    }
    if (e.touches.length === 1) {
      pinchRef.current = null
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      if (scaleLive.current > 1.02) {
        dragRef.current = {
          startX: x,
          startY: y,
          panStart: { ...panLive.current },
        }
        swipeRef.current = null
      } else {
        swipeRef.current = { x }
        dragRef.current = null
      }
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const d = touchDistance(e.touches[0], e.touches[1])
      const ratio = d / pinchRef.current.dist
      const next = Math.min(
        4,
        Math.max(1, pinchRef.current.baseScale * ratio)
      )
      setScale(next)
      scaleLive.current = next
      if (next <= 1.02) {
        setPan({ x: 0, y: 0 })
        panLive.current = { x: 0, y: 0 }
      }
      e.preventDefault()
      return
    }
    if (e.touches.length === 1 && dragRef.current && scaleLive.current > 1.02) {
      const dx = e.touches[0].clientX - dragRef.current.startX
      const dy = e.touches[0].clientY - dragRef.current.startY
      const nextPan = {
        x: dragRef.current.panStart.x + dx,
        y: dragRef.current.panStart.y + dy,
      }
      setPan(nextPan)
      panLive.current = nextPan
      e.preventDefault()
    }
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length >= 1) {
        if (e.touches.length < 2) pinchRef.current = null
        return
      }
      pinchRef.current = null
      dragRef.current = null

      if (scaleLive.current > 1.02) {
        swipeRef.current = null
        return
      }

      const start = swipeRef.current
      swipeRef.current = null
      if (!start || safe.length <= 1) return
      const endX = e.changedTouches[0]?.clientX
      if (endX == null) return
      const dx = endX - start.x
      const threshold = 56
      if (dx > threshold) goPrev()
      else if (dx < -threshold) goNext()
    },
    [safe.length, goPrev, goNext]
  )

  if (!open || safe.length === 0) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col bg-[rgba(0,0,0,0.9)] transition-opacity duration-300 ease-out ${
        animReady ? "opacity-100" : "opacity-0"
      }`}
      role="presentation"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute right-3 top-3 z-[110] flex h-11 w-11 items-center justify-center rounded-full border border-skailea-gold/55 bg-skailea-deep/95 text-skailea-cream shadow-lg transition hover:bg-skailea-deep hover:brightness-110 focus-visible:outline focus-visible:ring-2 focus-visible:ring-skailea-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 sm:right-5 sm:top-5"
        aria-label="Cerrar visor"
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {safe.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            className="absolute left-2 top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-skailea-gold/50 bg-skailea-deep/92 text-skailea-cream shadow-md transition hover:brightness-110 focus-visible:outline focus-visible:ring-2 focus-visible:ring-skailea-gold sm:left-4 sm:h-12 sm:w-12"
            aria-label="Foto anterior"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            className="absolute right-2 top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-skailea-gold/50 bg-skailea-deep/92 text-skailea-cream shadow-md transition hover:brightness-110 focus-visible:outline focus-visible:ring-2 focus-visible:ring-skailea-gold sm:right-4 sm:h-12 sm:w-12"
            aria-label="Foto siguiente"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <div
        className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-3 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative flex max-h-[min(85vh,920px)] w-full max-w-[min(96vw,1100px)] flex-1 items-center justify-center transition-transform duration-300 ease-out ${
            animReady ? "scale-100" : "scale-[0.96]"
          }`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "none" }}
        >
          <div
            className="relative flex max-h-full max-w-full items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentSrc}
              alt={alt}
              className="mx-auto max-h-[min(85vh,920px)] w-auto max-w-full select-none object-contain"
              draggable={false}
            />
          </div>
        </div>

        {safe.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-[110] flex justify-center gap-2 px-4 sm:bottom-8">
            {safe.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIndex(i)
                  resetZoom()
                }}
                className={`h-2.5 rounded-full transition-all focus-visible:outline focus-visible:ring-2 focus-visible:ring-skailea-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black/80 ${
                  i === index
                    ? "w-8 bg-skailea-gold shadow-sm"
                    : "w-2.5 bg-skailea-blush/55 hover:bg-skailea-blush"
                }`}
                aria-label={`Foto ${i + 1} de ${safe.length}`}
                aria-current={i === index}
              />
            ))}
          </div>
        )}
      </div>

      {scale > 1.05 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            resetZoom()
          }}
          className="absolute bottom-[5.25rem] left-1/2 z-[110] -translate-x-1/2 rounded-full border border-skailea-gold/45 bg-skailea-deep/90 px-4 py-2 text-xs font-medium text-skailea-cream shadow-md sm:bottom-[6rem]"
        >
          Restablecer zoom
        </button>
      )}
    </div>
  )
}
