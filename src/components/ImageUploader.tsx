import { useCallback } from 'react'
import { AddAPhoto } from '@mui/icons-material'

interface Props {
  onImageSelected: (base64: string) => void
  isLoading: boolean
}

export const ImageUploader = ({ onImageSelected, isLoading }: Props) => {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageSelected(reader.result)
        }
      }
      reader.readAsDataURL(file)
    },
    [onImageSelected]
  )

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mb-6 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer group text-center relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="pointer-events-none">
        <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
          <AddAPhoto sx={{ fontSize: 60, color: '#3b82f6' }} />
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">シフト表の画像をアップロード</p>
        <p className="text-sm text-gray-500">対応フォーマット: JPEG, PNG</p>
      </div>
    </div>
  )
}
