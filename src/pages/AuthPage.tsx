import { useGoogleLogin } from '@react-oauth/google'
import { AuthSection } from '../components/AuthSection'
import { useAppStore } from '../store/useAppStore'
import { useTypedNavigate } from '../hooks/useTypedNavigate'
import { ROUTES } from '../types/routes'
import { useLogin } from '../presentation/hooks'

export const AuthPage = () => {
  const navigate = useTypedNavigate()
  const { accessToken, setAccessToken, setCurrentStep, setUserProfile, userProfile } = useAppStore()
  const { login: loginUseCase, error: loginError } = useLogin()

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setAccessToken(codeResponse.access_token)

      // ユーザー情報を取得 (useLogin hook を使用)
      const userProfileDTO = await loginUseCase(codeResponse.access_token)

      if (userProfileDTO) {
        // Zustand store にユーザープロフィールを保存
        setUserProfile({
          name: userProfileDTO.name,
          picture: userProfileDTO.picture || '',
        })

        // APIキーの有無で遷移先を決定
        const hasApiKey = !!localStorage.getItem('gemini_api_key')
        if (hasApiKey) {
          setCurrentStep('upload')
          navigate(ROUTES.UPLOAD)
        } else {
          setCurrentStep('api_key')
          navigate(ROUTES.API_KEY)
        }
      } else {
        console.error('Failed to fetch user info:', loginError)
      }
    },
    scope:
      'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile',
  })

  // ログイン済みの場合はログアウトを促すか、次へ進むボタンを表示
  if (accessToken && userProfile) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">ログイン済み</h2>
        <p className="text-sm text-gray-600 mb-6">{userProfile.name} さんとしてログイン中</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              // APIキーの有無で遷移先を決定
              const hasApiKey = !!localStorage.getItem('gemini_api_key')
              if (hasApiKey) {
                setCurrentStep('upload')
                navigate(ROUTES.UPLOAD)
              } else {
                setCurrentStep('api_key')
                navigate(ROUTES.API_KEY)
              }
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full"
          >
            次へ進む
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Google アカウント連携</h2>
      <p className="text-sm text-gray-600 mb-6">カレンダーへのアクセス権限を付与します</p>
      <AuthSection
        isAuthenticated={false} // ここでは常に未認証状態としてログインボタンを表示（AuthSectionのprops仕様による）
        onLogin={() => login()}
        onLogout={() => {}} // AuthPageでは直接ログアウトボタンを表示しない（HeaderProfileに任せるか、あるいはここでも出すか。今はログインボタンのみ）
      />
    </div>
  )
}
