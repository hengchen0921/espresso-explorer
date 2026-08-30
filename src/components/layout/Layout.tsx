import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CompareTray } from '@/components/compare/CompareTray'
import { Footer } from './Footer'
import { Header } from './Header'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, search])
  return null
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CompareTray />
    </div>
  )
}
