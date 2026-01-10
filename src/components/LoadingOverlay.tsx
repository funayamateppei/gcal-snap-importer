interface Props {
  isVisible: boolean
}

export const LoadingOverlay = ({ isVisible }: Props) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/20 z-60 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <p className="text-lg font-semibold text-gray-800">解析中...</p>
      </div>
    </div>
  )
}
