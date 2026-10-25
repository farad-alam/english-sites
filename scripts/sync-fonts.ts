/**
 * Copies the latin + latin-ext subsets of every font in lib/fonts.ts from the
 * @fontsource-variable packages into public/fonts/ (committed to the repo).
 * Only needed when you add or update a font:   npm run sync-fonts
 *
 * Why not import the fontsource CSS? It ships @font-face rules for every
 * language subset of every font, on every page. Serving just the two Latin
 * subsets of the two fonts a site actually uses is much lighter.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { FONT_OPTIONS } from '../lib/fonts'

const out = join(process.cwd(), 'public', 'fonts')
mkdirSync(out, { recursive: true })

let copied = 0
for (const font of FONT_OPTIONS) {
  if (!font.file) continue
  for (const subset of ['latin', 'latin-ext']) {
    const name = `${font.file}-${subset}-wght-normal.woff2`
    const from = join(process.cwd(), 'node_modules', '@fontsource-variable', font.file, 'files', name)
    if (!existsSync(from)) {
      console.error(`Missing ${from} — install @fontsource-variable/${font.file}`)
      process.exitCode = 1
      continue
    }
    copyFileSync(from, join(out, name))
    copied++
  }
}
console.log(`Copied ${copied} font files to public/fonts`)
