import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  { ignores: ['.open-next/**', '.next/**', '.wrangler/**', 'node_modules/**', 'public/**', 'wrangler.jsonc'] },
  ...coreWebVitals,
  ...typescript,
]

export default config
