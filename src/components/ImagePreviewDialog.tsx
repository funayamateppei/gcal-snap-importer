import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch'
import { ZoomOut, ZoomIn, Close } from '@mui/icons-material'

interface ImagePreviewDialogProps {
  imageUrl: string
  isOpen: boolean
  onClose: () => void
}

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls()

  return (
    <div className="flex gap-2 self-end">
      <button
        onClick={() => zoomOut()}
        className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors font-medium"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <button
        onClick={() => resetTransform()}
        className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors font-medium"
      >
        リセット
      </button>
      <button
        onClick={() => zoomIn()}
        className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors font-medium"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
    </div>
  )
}

export const ImagePreviewDialog = ({ imageUrl, isOpen, onClose }: ImagePreviewDialogProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">画像プレビュー</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="閉じる"
          >
            <Close className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <TransformWrapper initialScale={1} minScale={1} maxScale={5} centerOnInit>
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-50 relative min-h-100">
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full flex items-center justify-center"
            >
              <img
                src={imageUrl}
                alt="プレビュー"
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
              />
            </TransformComponent>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Controls />
          </div>
        </TransformWrapper>
      </div>
    </div>
  )
}
