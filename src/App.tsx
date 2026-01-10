import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthPage } from './pages/AuthPage'
import { ApiKeyPage } from './pages/ApiKeyPage'
import { UploadPage } from './pages/UploadPage'
import { PreviewPage } from './pages/PreviewPage'
import { CompletePage } from './pages/CompletePage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/MainLayout'
import { ROUTES } from './types/routes'

// 環境変数から GOOGLE_CLIENT_ID を読み込む
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter basename="/gcal-snap-importer">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.AUTH} element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.API_KEY} element={<ApiKeyPage />} />
              <Route path={ROUTES.UPLOAD} element={<UploadPage />} />
              <Route path={ROUTES.PREVIEW} element={<PreviewPage />} />
              <Route path={ROUTES.COMPLETE} element={<CompletePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
