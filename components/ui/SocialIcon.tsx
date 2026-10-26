/**
 * Small inline icons for the social profiles (no icon font or extra request).
 * Drawn to be recognisable at 18–22 px, in the current text colour.
 */
const FILLED: Record<string, string> = {
  facebook: 'M14 8.5V7c0-.7.2-1 1.1-1H17V3h-2.7C11.2 3 10 4.7 10 7v1.5H8V12h2v9h4v-9h2.6l.4-3.5H14z',
  youtube:
    'M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z',
  x: 'M17.7 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.7 3zm-1.1 16.2h1.7L7.5 4.7H5.6l11 14.5z',
  linkedin:
    'M5.4 9h3v10h-3V9zM6.9 4.2a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zM10.4 9h2.9v1.4h.04c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7V19h-3v-4.9c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V19h-3V9z',
  tiktok:
    'M16.6 3c.3 2.4 1.7 4 4 4.2v3a7.2 7.2 0 0 1-4-1.3v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .7 0 1 .1v3.2a2.5 2.5 0 1 0 1.6 2.3V3h3z',
  pinterest:
    'M12 0C5.4 0 0 5.4 0 12c0 5.1 3.2 9.4 7.6 11.2 -.1 -.9 -.2 -2.4 0 -3.4l1.4 -6s-.4 -.7 -.4 -1.8c0 -1.7 1 -2.9 2.2 -2.9 1 0 1.5 .8 1.5 1.7 0 1 -.7 2.6 -1 4 -.3 1.2 .6 2.2 1.8 2.2 2.1 0 3.8 -2.2 3.8 -5.5 0 -2.9 -2.1 -4.9 -5 -4.9 -3.4 0 -5.4 2.6 -5.4 5.2 0 1 .4 2.1 .9 2.7 .1 .1 .1 .2 .1 .3l-.3 1.4c0 .2 -.2 .3 -.4 .2 -1.5 -.7 -2.4 -2.9 -2.4 -4.6 0 -3.8 2.7 -7.3 7.9 -7.3 4.2 0 7.4 3 7.4 6.9 0 4.1 -2.6 7.5 -6.2 7.5 -1.2 0 -2.4 -.6 -2.8 -1.4l-.7 2.8c-.3 1 -1 2.4 -1.5 3.1 1.1 .3 2.3 .5 3.6 .5 6.6 0 12 -5.4 12 -12S18.6 0 12 0z',
}

export default function SocialIcon({ name, size = 20 }: { name: string; size?: number }) {
  if (name === 'instagram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
      </svg>
    )
  }
  const d = FILLED[name]
  if (!d) return <span aria-hidden="true" className="text-xs font-bold uppercase">{name.slice(0, 2)}</span>
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
