'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import OffCanvasNav from './OffCanvasNav'

// Routes that render full-screen (no footer, no bottom padding)
const FULLSCREEN_PATTERNS = [
  /^\/areas\/economies-governance\/dependency-graph\/[^/]+\/?$/,
]

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()
  const isFullscreen = FULLSCREEN_PATTERNS.some(p => p.test(pathname))

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isFullscreen])

  return (
    <>
      <SiteHeader onMenuClick={() => setNavOpen(true)} />
      <OffCanvasNav isOpen={navOpen} onClose={() => setNavOpen(false)} />

      <div className={isFullscreen ? 'w-full' : 'w-full pb-12'}>
        {children}
      </div>

      {!isFullscreen && <SiteFooter />}
    </>
  )
}
