import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, fontFaceCss, fontStack, usedFonts } from './fonts'

/**
 * Theme = a preset (or your own primary/accent colour) + two fonts + corner
 * roundness. Rendered on the server as CSS variables in <head>, so there is no
 * flash of unstyled colour and no client JavaScript.
 */

export type SurfaceStyle = 'warm' | 'cool' | 'white'
export type RadiusStyle = 'sharp' | 'soft' | 'round'

export interface ThemePreset {
  label: string
  primary: string
  accent: string
  surface: SurfaceStyle
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  emerald: { label: 'Emerald — fresh green', primary: '#0f766e', accent: '#f59e0b', surface: 'warm' },
  forest: { label: 'Forest — deep green', primary: '#166534', accent: '#ea580c', surface: 'warm' },
  ocean: { label: 'Ocean — trusted blue', primary: '#0369a1', accent: '#f97316', surface: 'cool' },
  indigo: { label: 'Indigo — tech / SaaS', primary: '#4338ca', accent: '#f59e0b', surface: 'cool' },
  violet: { label: 'Violet — creative', primary: '#6d28d9', accent: '#14b8a6', surface: 'cool' },
  crimson: { label: 'Crimson — bold', primary: '#be123c', accent: '#0ea5e9', surface: 'warm' },
  sunset: { label: 'Sunset — warm orange', primary: '#c2410c', accent: '#0f766e', surface: 'warm' },
  slate: { label: 'Slate — neutral & clean', primary: '#1e293b', accent: '#22c55e', surface: 'white' },
}

export const DEFAULT_PRESET = 'emerald'

export interface ThemeSettings {
  preset?: string
  primary?: string
  accent?: string
  headingFont?: string
  bodyFont?: string
  radius?: string
}

// ── colour maths ────────────────────────────────────────────────────────────

const HEX = /^#[0-9a-f]{6}$/i

type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h / 6, s, l]
}

function hslToRgb([h, s, l]: [number, number, number]): RGB {
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const f = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)]
}

/** Lighten (+) or darken (−) a colour by a fraction of lightness. */
function shade(rgb: RGB, delta: number): RGB {
  const [h, s, l] = rgbToHsl(rgb)
  return hslToRgb([h, s, Math.min(0.97, Math.max(0.05, l + delta))])
}

/** Mix a colour towards white — for soft tints. */
function tint(rgb: RGB, amount: number): RGB {
  return rgb.map((c) => Math.round(c + (255 - c) * amount)) as RGB
}

function luminance([r, g, b]: RGB): number {
  const f = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/**
 * Text colour for a button/banner of this colour: white when it meets WCAG AA
 * (4.5:1), otherwise near-black. Bright colours such as orange or yellow get
 * dark text — white on orange is only ~2.8:1 and fails accessibility checks.
 */
function onColor(rgb: RGB): string {
  const whiteContrast = 1.05 / (luminance(rgb) + 0.05)
  return whiteContrast >= 4.5 ? '255 255 255' : '28 25 23'
}

const str = (rgb: RGB) => rgb.join(' ')

// ── surfaces & radius ───────────────────────────────────────────────────────

const SURFACES: Record<SurfaceStyle, Record<string, string>> = {
  warm: {
    '--surface-base': '250 248 245',
    '--surface-raised': '244 240 234',
    '--surface-card': '255 255 255',
    '--surface-border': '232 226 217',
    '--surface-hover': '240 235 227',
    '--text-primary': '28 25 23',
    '--text-muted': '96 90 85',
  },
  cool: {
    '--surface-base': '248 250 252',
    '--surface-raised': '241 245 249',
    '--surface-card': '255 255 255',
    '--surface-border': '226 232 240',
    '--surface-hover': '237 242 247',
    '--text-primary': '15 23 42',
    '--text-muted': '88 101 122',
  },
  white: {
    '--surface-base': '255 255 255',
    '--surface-raised': '249 250 251',
    '--surface-card': '255 255 255',
    '--surface-border': '229 231 235',
    '--surface-hover': '243 244 246',
    '--text-primary': '17 24 39',
    '--text-muted': '95 102 116',
  },
}

const RADII: Record<RadiusStyle, Record<string, string>> = {
  sharp: { '--r-md': '2px', '--r-lg': '4px', '--r-xl': '6px', '--r-2xl': '8px' },
  soft: { '--r-md': '6px', '--r-lg': '10px', '--r-xl': '14px', '--r-2xl': '20px' },
  round: { '--r-md': '10px', '--r-lg': '16px', '--r-xl': '22px', '--r-2xl': '30px' },
}

// ── public API ──────────────────────────────────────────────────────────────

export function resolveTheme(theme: ThemeSettings | undefined) {
  const preset = THEME_PRESETS[theme?.preset ?? ''] ?? THEME_PRESETS[DEFAULT_PRESET]
  const primary = theme?.primary && HEX.test(theme.primary) ? theme.primary : preset.primary
  const accent = theme?.accent && HEX.test(theme.accent) ? theme.accent : preset.accent
  const radius = (['sharp', 'soft', 'round'].includes(theme?.radius ?? '') ? theme!.radius : 'soft') as RadiusStyle
  return { preset, primary, accent, radius, surface: preset.surface }
}

/** CSS custom properties for :root. Only validated values are interpolated. */
export function buildThemeCss(theme: ThemeSettings | undefined): string {
  const { primary, accent, radius, surface } = resolveTheme(theme)
  const p = hexToRgb(primary)
  const a = hexToRgb(accent)

  const vars: Record<string, string> = {
    '--brand-primary': str(p),
    '--brand-dark': str(shade(p, -0.08)),
    '--brand-deep': str(shade(p, -0.16)),
    '--brand-gradient': str(shade(p, 0.08)),
    '--brand-soft': str(tint(p, 0.9)),
    '--on-primary': onColor(p),
    '--accent': str(a),
    '--accent-dark': str(shade(a, -0.08)),
    '--on-accent': onColor(a),
    ...SURFACES[surface],
    ...RADII[radius],
    '--font-heading': fontStack(theme?.headingFont, DEFAULT_HEADING_FONT),
    '--font-body': fontStack(theme?.bodyFont, DEFAULT_BODY_FONT),
  }

  const fontFaces = fontFaceCss(usedFonts(theme?.headingFont, theme?.bodyFont))
  return `${fontFaces}:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')}}`
}
