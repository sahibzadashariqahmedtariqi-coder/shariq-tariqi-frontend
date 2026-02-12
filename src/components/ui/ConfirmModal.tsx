import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { Button } from './button'

type ModalType = 'danger' | 'warning' | 'success' | 'info'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName?: string
  itemId?: string | number
  type?: ModalType
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const typeConfig = {
  danger: {
    gradient: 'from-red-500 to-red-600',
    icon: AlertTriangle,
    confirmBg: 'bg-red-600 hover:bg-red-700',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  warning: {
    gradient: 'from-yellow-500 to-orange-500',
    icon: AlertCircle,
    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  },
  success: {
    gradient: 'from-green-500 to-green-600',
    icon: CheckCircle,
    confirmBg: 'bg-green-600 hover:bg-green-700',
    badge: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  info: {
    gradient: 'from-blue-500 to-blue-600',
    icon: Info,
    confirmBg: 'bg-blue-600 hover:bg-blue-700',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemId,
  type = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}: ConfirmModalProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header with icon */}
            <div className={`bg-gradient-to-r ${config.gradient} p-6 text-center`}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                {message}
              </p>
              
              {(itemName || itemId) && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                  {itemName && (
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                      {itemName}
                    </p>
                  )}
                  {itemId && (
                    <span className={`inline-block ${config.badge} px-3 py-1 rounded-full text-sm font-medium mt-2`}>
                      {typeof itemId === 'number' ? `ID: ${itemId}` : itemId}
                    </span>
                  )}
                </div>
              )}
              
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-4">
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-0">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-300 dark:border-gray-600"
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                className={`flex-1 ${config.confirmBg} text-white`}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
