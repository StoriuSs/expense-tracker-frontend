import { X } from 'lucide-react'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  title?: string
}

const ImageModal = ({ isOpen, onClose, imageUrl, title = 'Receipt' }: ImageModalProps) => {
  if (!isOpen || !imageUrl) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Image Container */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-auto rounded-lg"
          />
        </div>
        
        {/* Footer with Download Link */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Open in new tab →
          </a>
        </div>
      </div>
    </div>
  )
}

export default ImageModal
