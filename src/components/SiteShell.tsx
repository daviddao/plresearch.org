'use client'

import { useState } from 'react'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import OffCanvasNav from './OffCanvasNav'
import OffCanvasSearch from './OffCanvasSearch'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <SiteHeader
        onMenuClick={() => setNavOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
      />
      <OffCanvasNav isOpen={navOpen} onClose={() => setNavOpen(false)} />
      <OffCanvasSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="w-full pb-12">
        {children}
      </div>

      <SiteFooter />
    </>
  )
}
