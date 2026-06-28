import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, X } from 'lucide-react'

export default function CVUploader({ onUpload, isLoading }) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const inputRef = useRef(null)

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(selectedFile.type)) {
      setStatus('error')
      return
    }
    setFile(selectedFile)
    setStatus('uploading')
    try {
      await onUpload(selectedFile) // calls uploadCV from parent
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="w-full">
      <label className="text-sm font-medium mb-2 block" style={{ color: '#9CA3AF' }}>
        Your CV or Resume
      </label>

      <motion.div
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        animate={{ borderColor: dragOver ? '#3B82F6' : status === 'success' ? '#10B981' : '#1F2937' }}
        className="relative rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
        style={{ background: '#111827', border: '2px dashed #1F2937', minHeight: '160px' }}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])} />

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div key="idle" className="flex flex-col items-center gap-2 text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="p-3 rounded-full" style={{ background: '#1F2937' }}>
                <Upload size={24} style={{ color: '#3B82F6' }} />
              </div>
              <p style={{ color: '#F9FAFB' }} className="font-medium">Drop your CV or Resume here</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>PDF or DOCX — click to browse</p>
            </motion.div>
          )}

          {status === 'uploading' && (
            <motion.div key="uploading" className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <FileText size={32} style={{ color: '#3B82F6' }} />
              </motion.div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Reading your CV...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="flex flex-col items-center gap-2"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CheckCircle size={32} style={{ color: '#10B981' }} />
              <p className="text-sm font-medium" style={{ color: '#F9FAFB' }}>{file?.name}</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle') }}
                className="flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
                <X size={12} /> Remove
              </button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div key="error" className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sm" style={{ color: '#EF4444' }}>Invalid file type. PDF or DOCX only.</p>
              <button onClick={() => setStatus('idle')} className="text-xs" style={{ color: '#3B82F6' }}>
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}