import { useState, useEffect } from 'react'

interface Props {
  onApiKeyChange: (apiKey: string | null) => void
}

export const ApiKeyInput = ({ onApiKeyChange }: Props) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '')

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key')
    if (storedKey) {
      onApiKeyChange(storedKey)
    }
  }, [onApiKeyChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setApiKey(value)
    onApiKeyChange(value)
  }

  return (
    <div className="mb-6">
      <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 mb-2">
        Gemini API キー
      </label>
      <input
        id="api-key-input"
        type="password"
        value={apiKey}
        onChange={handleChange}
        placeholder="Gemini API キーを入力してください"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
      />
      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
        <span className="text-amber-500">⚠️</span>
        APIキーはブラウザにのみ保存され、外部には送信されません。
      </p>
    </div>
  )
}
