import { copyFileSync } from 'fs'

// Copy routes-manifest.json to out/ for Vercel static export detection
try {
  copyFileSync('.next/routes-manifest.json', 'out/routes-manifest.json')
  console.log('✓ Copied routes-manifest.json to out/')
} catch (err) {
  console.error('Failed to copy routes-manifest.json:', err.message)
  process.exit(1)
}
