/**
 * Curated, self-hosted fonts — no Google request at build or run time. A site
 * picks one for headings and one for body text in Sanity → Site Settings →
 * Theme, and only those fonts' Latin files are sent to its visitors.
 *
 * To add a font: `npm i -D @fontsource-variable/<name>`, add a row below, then
 * run `npm run sync-fonts` (copies the files into public/fonts).
 */
export interface FontOption {
  id: string
  label: string
  stack: string
  kind: 'sans' | 'serif' | 'system'
  /** CSS family name of the self-hosted variable font (absent for "system") */
  family?: string
  /** File prefix in /public/fonts, e.g. "inter" → inter-latin-wght-normal.woff2 */
  file?: string
  /** Weight range of the variable font */
  weights?: string
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'system', label: 'System UI (fastest)', kind: 'system', stack: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  { id: 'inter', label: 'Inter', kind: 'sans', family: 'Inter Variable', file: 'inter', weights: '100 900', stack: "'Inter Variable', ui-sans-serif, system-ui, sans-serif" },
  { id: 'dm-sans', label: 'DM Sans', kind: 'sans', family: 'DM Sans Variable', file: 'dm-sans', weights: '100 1000', stack: "'DM Sans Variable', ui-sans-serif, system-ui, sans-serif" },
  { id: 'jakarta', label: 'Plus Jakarta Sans', kind: 'sans', family: 'Plus Jakarta Sans Variable', file: 'plus-jakarta-sans', weights: '200 800', stack: "'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, sans-serif" },
  { id: 'outfit', label: 'Outfit', kind: 'sans', family: 'Outfit Variable', file: 'outfit', weights: '100 900', stack: "'Outfit Variable', ui-sans-serif, system-ui, sans-serif" },
  { id: 'merriweather', label: 'Merriweather (serif)', kind: 'serif', family: 'Merriweather Variable', file: 'merriweather', weights: '300 900', stack: "'Merriweather Variable', Georgia, 'Times New Roman', serif" },
  { id: 'lora', label: 'Lora (serif)', kind: 'serif', family: 'Lora Variable', file: 'lora', weights: '400 700', stack: "'Lora Variable', Georgia, 'Times New Roman', serif" },
  { id: 'playfair', label: 'Playfair Display (serif, headings)', kind: 'serif', family: 'Playfair Display Variable', file: 'playfair-display', weights: '400 900', stack: "'Playfair Display Variable', Georgia, 'Times New Roman', serif" },
]

export const DEFAULT_HEADING_FONT = 'inter'
export const DEFAULT_BODY_FONT = 'inter'

function findFont(id: string | undefined, fallbackId: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS.find((f) => f.id === fallbackId)!
}

export function fontStack(id: string | undefined, fallbackId: string): string {
  return findFont(id, fallbackId).stack
}

/** The (one or two) distinct web fonts a site actually uses — system UI needs no files. */
export function usedFonts(headingId: string | undefined, bodyId: string | undefined): FontOption[] {
  const picked = [findFont(headingId, DEFAULT_HEADING_FONT), findFont(bodyId, DEFAULT_BODY_FONT)]
  return picked.filter((f, i) => f.file && picked.findIndex((g) => g.id === f.id) === i)
}

// Same unicode-range split Google Fonts uses: "latin" is downloaded by almost every
// visitor, "latin-ext" only when a page contains an accented character beyond it.
const LATIN_RANGE =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
const LATIN_EXT_RANGE =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'

export function fontFileUrl(font: FontOption, subset: 'latin' | 'latin-ext' = 'latin'): string {
  return `/fonts/${font.file}-${subset}-wght-normal.woff2`
}

/** @font-face rules for only the fonts in use (rendered into the server-side theme <style>). */
export function fontFaceCss(fonts: FontOption[]): string {
  return fonts
    .map((f) =>
      ([['latin-ext', LATIN_EXT_RANGE], ['latin', LATIN_RANGE]] as const)
        .map(
          ([subset, range]) =>
            `@font-face{font-family:'${f.family}';font-style:normal;font-display:swap;font-weight:${f.weights};src:url(${fontFileUrl(f, subset)}) format('woff2');unicode-range:${range}}`,
        )
        .join(''),
    )
    .join('')
}
