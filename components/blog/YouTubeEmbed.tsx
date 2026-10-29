'use client'

import { useState } from 'react'

/** Extracts the 11-character video id from any common YouTube URL. */
function videoId(url: string): string | null {
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null
    if (host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v')
      if (v) return v
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]{6,})/)
      if (m) return m[2]
    }
  } catch {
    /* not a valid URL */
  }
  return null
}

/**
 * Click-to-load YouTube player: only a thumbnail is loaded until the reader
 * presses play, so videos cost nothing for page speed. Uses the
 * privacy-friendly youtube-nocookie.com domain.
 */
export default function YouTubeEmbed({ url, title }: { url: string; title?: string }) {
  const [playing, setPlaying] = useState(false)
  const id = videoId(url)
  if (!id) return null
  const label = title || 'Video'

  return (
    <figure className="my-7 md:my-8">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={label}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${label}`}
            className="group absolute inset-0 h-full w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {title && <figcaption className="mt-2 text-sm text-text-muted">{title}</figcaption>}
    </figure>
  )
}
