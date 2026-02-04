import { useState, useRef, useCallback, ChangeEvent, DragEvent, useEffect } from 'react'
import { UploadCloud, ShieldCheck, Download, Trash2, File as FileIcon, Loader2, CheckCircle2, Archive, X } from 'lucide-react'
import JSZip from 'jszip'

interface FileItem {
  id: string
  file: File
}

interface ProcessedResult {
  name: string
  size: number
  blob: Blob
}

const FileEncryption = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [processedList, setProcessedList] = useState<ProcessedResult[]>([])
  const [finalDownloadBlob, setFinalDownloadBlob] = useState<Blob | null>(null)
  const [isZipResult, setIsZipResult] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file
    }))
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles])
      setStatus('')
    }
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file
    }))
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles])
      setStatus('')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    if (files.length <= 1) setStatus('')
  }

  const handleDownloadAction = () => {
    if (!finalDownloadBlob) return
    const url = URL.createObjectURL(finalDownloadBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = isZipResult ? 'cryptz_package.zip' : (processedList[0]?.name || 'processed_file')
    a.click()
    URL.revokeObjectURL(url)
  }

  const processFiles = async (mode: 'encrypt' | 'decrypt') => {
    if (files.length === 0 || !password) return
    
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current)
    
    setLoading(true)
    setCurrentFileIndex(0)
    setStatus(mode === 'encrypt' ? 'Shielding' : 'Unlocking')

    const results: ProcessedResult[] = []

    try {
      const encoder = new TextEncoder()
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
      )

      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i + 1)
        const item = files[i]
        
        const arrayBuffer = await item.file.arrayBuffer()
        const salt = mode === 'encrypt' 
          ? window.crypto.getRandomValues(new Uint8Array(16)) 
          : new Uint8Array(arrayBuffer.slice(0, 16))

        const aesKey = await window.crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: salt, iterations: 600000, hash: 'SHA-256' },
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          false,
          [mode === 'encrypt' ? 'encrypt' : 'decrypt']
        )

        let processedData: Uint8Array
        let outputName: string

        if (mode === 'encrypt') {
          const iv = window.crypto.getRandomValues(new Uint8Array(12))
          const encryptedBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, arrayBuffer)
          const combined = new Uint8Array(16 + 12 + encryptedBuffer.byteLength)
          combined.set(salt, 0)
          combined.set(iv, 16)
          combined.set(new Uint8Array(encryptedBuffer), 28)
          
          processedData = combined
          outputName = `${item.file.name}.cphr`
        } else {
          const iv = new Uint8Array(arrayBuffer.slice(16, 28))
          const encryptedData = arrayBuffer.slice(28)
          const decryptedBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, encryptedData)
          
          processedData = new Uint8Array(decryptedBuffer)
          outputName = item.file.name.endsWith('.cphr') ? item.file.name.slice(0, -5) : `decrypted_${item.file.name}`
        }

        results.push({ 
          name: outputName, 
          size: processedData.byteLength,
          blob: new Blob([processedData.buffer as ArrayBuffer])
        })
      }

      if (results.length > 1) {
        const zip = new JSZip()
        results.forEach(res => zip.file(res.name, res.blob))
        const zipContent = await zip.generateAsync({ type: 'blob' })
        setFinalDownloadBlob(zipContent)
        setIsZipResult(true)
      } else {
        setFinalDownloadBlob(results[0].blob)
        setIsZipResult(false)
      }

      setProcessedList(results)
      setShowSuccessModal(true)
      setFiles([])
      setPassword('')
      setStatus(`Successfully processed ${results.length} files!`)
    } catch (err) {
      console.error(err)
      setStatus('Error: Incorrect password or corrupted file.')
    } finally {
      setLoading(false)
      statusTimeoutRef.current = setTimeout(() => {
        setStatus('')
      }, 5000)
    }
  }

  return (
    <div className="space-y-6 relative">
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        
        .spin-force { animation: spin-slow 1s linear infinite; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-zoom-in { animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      {/* LOADING OVERLAY */}
      {loading && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            color: 'white'
          }}
        >
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Loader2 size={54} className="spin-force" style={{ color: 'var(--primary, #0070f3)' }} />
          </div>
          <p style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.2em', marginBottom: '0.5rem', color: '#ccc' }}>
            {status.toUpperCase()}
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
            {currentFileIndex} <span style={{ color: '#666' }}>/</span> {files.length}
          </p>
          <p style={{ fontSize: '11px', marginTop: '1rem', color: '#888' }}>Processing in-browser. Do not close tab.</p>
        </div>
      )}

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && (
        <div 
          className="animate-fade-in"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 1000000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            backdropFilter: 'blur(10px)' 
          }}
        >
          <div 
            className="animate-zoom-in"
            style={{ 
              background: '#111', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              width: '100%', 
              maxWidth: '450px', 
              padding: '30px', 
              position: 'relative', 
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' 
            }}
          >
            <button 
              onClick={() => setShowSuccessModal(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20}/>
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                width: '70px', 
                height: '70px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <CheckCircle2 size={40} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Mission Accomplished</h3>
              <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{processedList.length} files processed successfully</p>
            </div>

            <div 
              className="custom-scrollbar" 
              style={{ 
                maxHeight: '180px', 
                overflowY: 'auto', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '10px', 
                padding: '4px', 
                marginBottom: '24px', 
                border: '1px solid rgba(255,255,255,0.05)' 
              }}
            >
              {processedList.map((f, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px', 
                  borderBottom: i !== processedList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' 
                }}>
                  <span style={{ fontSize: '12px', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                    {f.name}
                  </span>
                  <span style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace' }}>
                    {(f.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={handleDownloadAction} 
              className="btn btn-primary w-full" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px', 
                padding: '16px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {isZipResult ? <Archive size={18} /> : <Download size={18} />}
              {isZipResult ? 'Download All as ZIP' : 'Download Processed File'}
            </button>
          </div>
        </div>
      )}

      {/* INPUT AREA */}
      <div className="input-group">
        <label className="label">Select Files to Encrypt/Decrypt</label>
        
        <div 
          className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            border: '2px dashed #27272a'
          }}
        >
          <div className="drag-drop-content flex flex-col items-center gap-3">
            <div style={{ background: '#18181b', padding: '12px', borderRadius: '50%', border: '1px solid #27272a' }}>
              <UploadCloud size={28} className={isDragging ? 'text-white' : 'text-zinc-500'} />
            </div>
            <p className="drag-drop-text">
              {isDragging ? 'Drop files here' : 'Drag & drop files or click to select'}
            </p>
            <div className="drag-drop-subtext">
              <p>Supports all formats • Max ~1GB/file</p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden-file-input"
        />

        {files.length > 0 && (
          <div className="uploaded-files-wrapper mt-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Queue ({files.length})
              </span>
              <button onClick={() => { setFiles([]); setStatus(''); }} className="btn btn-sm" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--action-remove)', padding: '4px 12px', fontSize: '10px' }}>
                Clear All
              </button>
            </div>
            
            <div className="uploaded-files-list custom-scrollbar">
              {files.map((item) => (
                <div key={item.id} className="uploaded-file-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      <FileIcon size={16} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.75rem', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.file.name}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{(item.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(item.id); }} className="remove-file-btn">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="input-group">
        <label className="label">Master Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter secret key..."
          className="input"
        />
      </div>

      <div className="flex-gap">
        <button onClick={() => processFiles('encrypt')} className="btn btn-primary w-full" disabled={loading || files.length === 0 || !password}>
          <ShieldCheck size={18} /> {loading ? '...' : 'Encrypt'}
        </button>
        <button onClick={() => processFiles('decrypt')} className="btn btn-secondary w-full" disabled={loading || files.length === 0 || !password}>
          <Download size={18} /> {loading ? '...' : 'Decrypt'}
        </button>
      </div>

      <div style={{ minHeight: '24px', marginTop: '1rem' }}>
        {status && !loading && (
          <p className="text-center text-sm" style={{ color: status.includes('Error') ? 'var(--action-remove)' : 'var(--text-secondary)' }}>
            {status}
          </p>
        )}
      </div>
    </div>
  )
}

export default FileEncryption;