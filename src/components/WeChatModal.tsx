import { useEffect } from 'react'
import { X } from 'lucide-react'

interface WeChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WeChatModal({ isOpen, onClose }: WeChatModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 mx-4 max-w-sm rounded-lg border bg-card p-6 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Content */}
        <div className="text-center">
          <h3 className="mb-4 text-lg font-semibold">微信联系我</h3>
          <div className="mb-4">
            <img
              src="/wechat-qr.png"
              alt="微信二维码"
              className="mx-auto h-48 w-48 rounded-lg border"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            扫描二维码添加微信好友
          </p>
        </div>
      </div>
    </div>
  )
}