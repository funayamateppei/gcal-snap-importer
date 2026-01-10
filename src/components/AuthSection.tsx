import { CheckCircle } from '@mui/icons-material'

interface Props {
  isAuthenticated: boolean
  onLogin: () => void
  onLogout: () => void
}

export const AuthSection = ({ isAuthenticated, onLogin, onLogout }: Props) => {
  if (!isAuthenticated) {
    return (
      <div className="text-center mb-8">
        <button
          onClick={onLogin}
          className="bg-white text-gray-700 font-semibold py-3 px-6 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center mx-auto gap-3 transition-all"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-6 h-6"
            alt="Google logo"
          />
          Google アカウントでログインしてカレンダーと連携
        </button>
      </div>
    )
  }

  return (
    <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-8 flex items-center justify-between border border-green-100">
      <span className="flex items-center gap-2 font-medium">
        <CheckCircle className="text-green-600" /> Google カレンダーと連携済み
      </span>
      <button onClick={onLogout} className="text-sm underline hover:text-green-900">
        ログアウト
      </button>
    </div>
  )
}
