'use client'

import { useState } from 'react'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import OffCanvasNav from './OffCanvasNav'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <SiteHeader onMenuClick={() => setNavOpen(true)} />
      <OffCanvasNav isOpen={navOpen} onClose={() => setNavOpen(false)} />

      <div className="w-full pb-12">
        {children}
      </div>

      <SiteFooter />
    </>
  )
}
