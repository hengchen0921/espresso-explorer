import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { CompareProvider } from '@/hooks/useCompare'
import { UnitsProvider } from '@/hooks/useUnits'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// The 3D routes pull in three.js and drei. Splitting them keeps the landing
// page's initial payload to the app shell; the homepage's hero canvas fetches
// the same chunk lazily once the page has already painted.
const MachinePage = lazy(() =>
  import('@/pages/MachinePage').then((m) => ({ default: m.MachinePage })),
)
const ComparePage = lazy(() =>
  import('@/pages/ComparePage').then((m) => ({ default: m.ComparePage })),
)
const LineupPage = lazy(() =>
  import('@/pages/LineupPage').then((m) => ({ default: m.LineupPage })),
)
const FinderPage = lazy(() =>
  import('@/pages/FinderPage').then((m) => ({ default: m.FinderPage })),
)

function RouteFallback() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <span className="eyebrow animate-pulse">Loading</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <UnitsProvider>
        <CompareProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route
              path="machines/:id"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <MachinePage />
                </Suspense>
              }
            />
            <Route
              path="finder"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <FinderPage />
                </Suspense>
              }
            />
            <Route
              path="lineup"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <LineupPage />
                </Suspense>
              }
            />
            <Route
              path="compare"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ComparePage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </CompareProvider>
      </UnitsProvider>
    </BrowserRouter>
  )
}
