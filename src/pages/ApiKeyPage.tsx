import { useEffect } from 'react'
import { ApiKeyInput } from '../components/ApiKeyInput'
import { StatusMessage } from '../components/StatusMessage'
import { useAppStore } from '../store/useAppStore'
import { useTypedNavigate } from '../hooks/useTypedNavigate'
import { ROUTES } from '../types/routes'
import { updateGeminiApiKey } from '../di/container'

export const ApiKeyPage = () => {
  const navigate = useTypedNavigate()
  const { apiKey, setApiKey, setCurrentStep, message, setMessage } = useAppStore()

  // 初期化時にLocalStorageからAPIキーを読み込む
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key')
    if (storedKey && !apiKey) {
      setApiKey(storedKey)
      // DI Container の Gemini API Key も更新
      updateGeminiApiKey(storedKey)
    }
  }, [apiKey, setApiKey])

  const handleNext = () => {
    if (!apiKey) {
      setMessage({ text: 'API キーを入力してください。', type: 'error' })
      return
    }
    // LocalStorageに保存
    localStorage.setItem('gemini_api_key', apiKey)
    // DI Container の Gemini API Key を更新
    updateGeminiApiKey(apiKey)
    setMessage(null)
    setCurrentStep('upload')
    navigate(ROUTES.UPLOAD)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">API キーの設定</h2>
      <p className="text-sm text-gray-600 mb-6">Gemini API キーを入力してください</p>

      <StatusMessage message={message} />

      <div className="mb-6">
        <ApiKeyInput onApiKeyChange={setApiKey} />
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!apiKey}
      >
        次へ進む
      </button>
    </div>
  )
}
