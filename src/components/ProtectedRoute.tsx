import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ROUTES } from '../types/routes'

export const ProtectedRoute = () => {
  const { accessToken } = useAppStore()
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to={ROUTES.AUTH} replace />
  }

  // APIキー未設定かつAPI Keyページ以外の場合、API Keyページへリダイレクト
  const hasApiKey = !!localStorage.getItem('gemini_api_key')
  if (!hasApiKey && location.pathname !== ROUTES.API_KEY) {
    return <Navigate to={ROUTES.API_KEY} replace />
  }

  return <Outlet />
}
