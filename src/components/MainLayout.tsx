import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { HeaderProfile } from './HeaderProfile'
import { useEffect } from 'react'
import { ROUTE_TO_STEP, type RoutePath } from '../types/routes'

export const MainLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentStep, setCurrentStep } = useAppStore()

  // URLとステップの同期 (URL priority)
  useEffect(() => {
    const currentPath = location.pathname as RoutePath
    const expectedStep = ROUTE_TO_STEP[currentPath]

    if (expectedStep && expectedStep !== currentStep) {
      setCurrentStep(expectedStep)
    }
  }, [location.pathname, currentStep, setCurrentStep])

  const showBackButton = currentStep !== 'auth' && currentStep !== 'complete'

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden">
      {/* ナビゲーションバー (常時表示) */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold text-blue-600 tracking-tight truncate">
              GCal Snap Importer
            </span>
          </div>
          <div className="shrink-0">
            <HeaderProfile />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <Outlet />
        </div>

        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="w-full text-gray-600 py-2 hover:text-gray-800 transition-all"
          >
            ← 戻る
          </button>
        )}
      </div>
    </div>
  )
}
