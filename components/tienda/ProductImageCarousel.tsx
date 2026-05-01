"use client"

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"

const INTERVAL_MS = 3000

type Props = {
  urls: string[]
  alt: string
  /** Extra classes on the outer aspect box */
  className?: string
  /** Image classes (zoom on hover lives on product card group) */
  imageClassName?: string
}

export function ProductImageCarousel({
  urls,
  alt,
  className = "",
  imageClassName = "",
}: Props) {
  const safe = urls.map((u) => u.trim()).filter(Boolean)
  const galleryKey = safe.join("|")
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setIndex(0)
  }, [galleryKey])

  useEffect(() => {
    if (safe.length <= 1 || paused) return
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % safe.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(t)
  }, [safe.length, paused])

  const go = useCallback(
    (i: number) => {
      setIndex(((i % safe.length) + safe.length) % safe.length)
    },
    [safe.length]
  )

  if (safe.length === 0) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-skailea-blush/20 text-sm text-skailea-rose/75 ${className}`}
      >
        Sin imagen
      </div>
    )
  }

  if (safe.length === 1) {
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        <Image
          src={safe[0]}
          alt={alt}
          fill
          unoptimized
          className={`object-cover transition duration-500 ease-out group-hover:scale-[1.04] ${imageClassName}`}
          sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
        />
      </div>
    )
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {safe.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt={i === index ? alt : ""}
          fill
          unoptimized
          className={`object-cover transition-opacity duration-700 ease-in-out group-hover:scale-[1.04] ${imageClassName} ${
            i === index ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0"
          }`}
          sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
        />
      ))}
      <div className="absolute inset-x-0 bottom-2.5 z-[2] flex justify-center gap-2">
        {safe.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              go(i)
            }}
            className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-skailea-gold focus-visible:ring-offset-1 focus-visible:ring-offset-skailea-deep/20 ${
              i === index
                ? "w-6 bg-skailea-cream shadow-sm"
                : "w-2 bg-skailea-cream/50 hover:bg-skailea-cream/80"
            }`}
            aria-label={`Ver foto ${i + 1} de ${safe.length}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </div>
  )
}
