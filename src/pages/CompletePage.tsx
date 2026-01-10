import { Celebration } from '@mui/icons-material'
import { useAppStore } from '../store/useAppStore'
import { ROUTES } from '../types/routes'

export const CompletePage = () => {
  const { reset } = useAppStore()

  const handleRestart = () => {
    reset()
    window.location.href = ROUTES.AUTH
  }

  return (
    <div className="text-center py-12">
      <div className="mb-4 flex justify-center">
        <Celebration sx={{ fontSize: 80, color: '#10b981' }} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">登録完了！</h2>
      <p className="text-gray-600 mb-8">Google カレンダーにシフトが登録されました。</p>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleRestart}
          className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-all font-medium"
        >
          最初に戻る
        </button>
      </div>
    </div>
  )
}
