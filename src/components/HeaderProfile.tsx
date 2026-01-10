import { VpnKey, Logout } from '@mui/icons-material'
import { useAppStore } from '../store/useAppStore'
import { useTypedNavigate } from '../hooks/useTypedNavigate'
import { ROUTES } from '../types/routes'
import { googleLogout } from '@react-oauth/google'
import { useState, useEffect } from 'react'

export const HeaderProfile = () => {
  const { userProfile, setAccessToken, setUserProfile, reset } = useAppStore()
  const navigate = useTypedNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = () => {
    googleLogout()
    setAccessToken(null)
    setUserProfile(null)
    reset()
    navigate(ROUTES.AUTH)
  }

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isDropdownOpen && !target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen])

  if (!userProfile) return null

  return (
    <div className="relative profile-dropdown">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-1 transition-colors"
      >
        <img
          src={userProfile.picture}
          alt={userProfile.name}
          className="w-8 h-8 rounded-full border border-gray-200"
          referrerPolicy="no-referrer"
        />
      </button>

      {/* ドロップダウンメニュー */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
          {/* ユーザー情報 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
          </div>

          {/* メニュー項目 */}
          <div className="py-1">
            <button
              onClick={() => {
                navigate(ROUTES.API_KEY)
                setIsDropdownOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <VpnKey className="w-4 h-4" />
              APIキー設定
            </button>
            <button
              onClick={() => {
                handleLogout()
                setIsDropdownOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Logout className="w-4 h-4" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
