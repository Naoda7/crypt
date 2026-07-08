import { useState, useRef, useCallback, useEffect } from 'react'
import { saveAs } from 'file-saver'
import { UploadCloud, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  file: File
}

const ImageLayoutTools = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [customFileName, setCustomFileName] = useState('')
  const [columns, setColumns] = useState<number>(4)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [zoomScale, setZoomScale] = useState<number>(1)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalZoomScale, setModalZoomScale] = useState<number>(1)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const modalCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      file: file
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      const newFiles = droppedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        file: file
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => resolve(img)
      img.onerror = (err) => reject(err)
    })
  }

  const drawGridLayout = useCallback(async (canvas: HTMLCanvasElement) => {
    if (files.length === 0) return

    const loadedImages = await Promise.all(files.map(f => loadImage(f.file)))
    const baseWidth = loadedImages[0].width
    const baseHeight = loadedImages[0].height

    const currentColumns = columns > 0 ? columns : 1
    const rows = Math.ceil(loadedImages.length / currentColumns)

    const calculatedTotalWidth = currentColumns * baseWidth
    const calculatedTotalHeight = rows * baseHeight

    const MAX_WIDTH = 4000
    let finalCanvasWidth = calculatedTotalWidth
    let finalCanvasHeight = calculatedTotalHeight
    let scaleFactor = 1

    if (calculatedTotalWidth > MAX_WIDTH) {
      scaleFactor = MAX_WIDTH / calculatedTotalWidth
      finalCanvasWidth = MAX_WIDTH
      finalCanvasHeight = calculatedTotalHeight * scaleFactor
    }

    const cellWidth = baseWidth * scaleFactor
    const cellHeight = baseHeight * scaleFactor

    canvas.width = finalCanvasWidth
    canvas.height = finalCanvasHeight
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, finalCanvasWidth, finalCanvasHeight)

    loadedImages.forEach((img, index) => {
      const colIndex = index % currentColumns
      const rowIndex = Math.floor(index / currentColumns)

      const posX = colIndex * cellWidth
      const posY = rowIndex * cellHeight

      ctx.drawImage(img, posX, posY, cellWidth, cellHeight)
      URL.revokeObjectURL(img.src)
    })
  }, [files, columns])

  useEffect(() => {
    if (previewCanvasRef.current && files.length > 0) {
      drawGridLayout(previewCanvasRef.current)
    }
  }, [files, columns, drawGridLayout])

  useEffect(() => {
    if (isModalOpen && modalCanvasRef.current && files.length > 0) {
      drawGridLayout(modalCanvasRef.current)
    }
  }, [isModalOpen, files, columns, drawGridLayout])

  const processAndDownloadLayout = async () => {
    if (files.length === 0) return
    setIsProcessing(true)

    try {
      const exportCanvas = document.createElement('canvas')
      await drawGridLayout(exportCanvas)

      const outputName = customFileName.trim() ? customFileName.trim() : 'layout-grid-image'
      
      exportCanvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${outputName}.png`)
        }
        setIsProcessing(false)
      }, 'image/png')

    } catch (error) {
      console.error(error)
      setIsProcessing(false)
    }
  }

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomScale(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleModalZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setModalZoomScale(prev => Math.min(prev + 0.25, 4))
  }

  const handleModalZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setModalZoomScale(prev => Math.max(prev - 0.25, 0.25))
  }

  return (
    <div className="space-y-6">
      <div className="input-group">
        <label className="label">Upload Images for Grid Layout</label>
        
        <div 
          className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            cursor: 'pointer',
            border: '2px dashed #27272a',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            background: isDragging ? 'rgba(255,255,255,0.05)' : 'transparent'
          }}
        >
          <div className="drag-drop-content flex flex-col items-center gap-3">
            <div style={{ background: '#111', padding: '12px', borderRadius: '50%', border: '1px solid #333' }}>
              <UploadCloud size={28} className={isDragging ? 'text-white' : 'text-zinc-500'} />
            </div>
            <div>
              <p className="drag-drop-text font-semibold">
                {isDragging ? 'Drop to upload' : 'Click or drag images here'}
              </p>
              <p className="drag-drop-subtext text-xs text-zinc-500 mt-1">
                (Supported formats: PNG, JPG, JPEG)
              </p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden-file-input"
        />

        {files.length > 0 && (
          <div className="uploaded-list" style={{ marginTop: '16px', marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '8px', fontSize: '0.875rem', color: '#a1a1aa', fontWeight: '500' }}>
              Selected Files ({files.length})
            </h4>
            <div 
              style={{ 
                maxHeight: '150px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px' 
              }} 
              className="custom-scrollbar"
            >
              {files.map((file, idx) => (
                <div 
                  key={file.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontSize: '0.8rem', 
                    background: '#18181b', 
                    padding: '10px 14px', 
                    borderRadius: '10px', 
                    border: '1px solid #27272a', 
                    gap: '12px' 
                  }}
                >
                  <span style={{ color: '#e4e4e7', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    Slot {idx + 1}: {file.name}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} 
                    style={{ color: '#71717a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0, padding: '2px' }}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <>
          <div 
            className="input-group"
            style={{ 
              position: 'sticky', 
              top: '65px', 
              zIndex: 40, 
              background: '#09090b', 
              paddingTop: '10px',
              paddingBottom: '16px'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <label className="label mb-0">Live Layout Preview</label>
              
              <div className="flex items-center gap-1" style={{ background: '#18181b', padding: '4px', borderRadius: '8px', border: '1px solid #27272a' }}>
                <button 
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  style={{ background: 'none', border: 'none', color: '#a1a1aa', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}
                  className="hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <ZoomOut size={16} />
                </button>
                <span style={{ fontSize: '0.75rem', minWidth: '36px', textAlign: 'center', color: '#e4e4e7', fontWeight: '500' }}>
                  {Math.round(zoomScale * 100)}%
                </span>
                <button 
                  onClick={handleZoomIn}
                  title="Zoom In"
                  style={{ background: 'none', border: 'none', color: '#a1a1aa', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}
                  className="hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
                <div style={{ width: '1px', height: '16px', background: '#27272a', margin: '0 4px' }} />
                <button 
                  onClick={() => setIsModalOpen(true)}
                  title="Tampilan Ukuran Real"
                  style={{ background: 'none', border: 'none', color: '#a1a1aa', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}
                  className="hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <Maximize2 size={15} />
                </button>
              </div>
            </div>

            <div 
              className="preview-container"
              onClick={() => setIsModalOpen(true)}
              style={{
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                border: '1px solid #27272a',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '320px', 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#111',
                padding: '16px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: `scale(${zoomScale})`,
                  transition: 'transform 0.15s ease-out',
                  transformOrigin: 'center center'
                }}
              >
                <canvas 
                  ref={previewCanvasRef} 
                  className="preview-canvas" 
                  style={{ 
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }} 
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="label">Images Per Row (Columns)</label>
            <input
              type="number"
              value={columns}
              onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
              className="input"
              min="1"
              max="30"
            />
          </div>

          <div className="input-group">
            <label className="label">Output File Name</label>
            <input
              type="text"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              className="input"
              placeholder="Enter layout output image name..."
            />
          </div>

          <button
            onClick={processAndDownloadLayout}
            className="btn btn-primary w-full"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing Grid Layout...' : 'Process & Download Grid Layout'}
          </button>
        </>
      )}

      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{
              position: 'absolute',
              top: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#18181b',
              padding: '6px 14px',
              borderRadius: '24px',
              border: '1px solid #27272a',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          >
            <button 
              onClick={handleModalZoomOut}
              style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex' }}
              className="hover:text-white"
            >
              <ZoomOut size={18} />
            </button>
            <span style={{ fontSize: '0.85rem', color: '#e4e4e7', fontWeight: '600', minWidth: '45px', textAlign: 'center' }}>
              {Math.round(modalZoomScale * 100)}%
            </span>
            <button 
              onClick={handleModalZoomIn}
              style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex' }}
              className="hover:text-white"
            >
              <ZoomIn size={18} />
            </button>
            <div style={{ width: '1px', height: '16px', background: '#27272a', margin: '0 4px' }} />
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', display: 'flex' }}
              className="hover:text-red-400"
            >
              <X size={18} />
            </button>
          </div>

          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95%',
              maxHeight: '85%',
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              borderRadius: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
            className="custom-scrollbar"
          >
            <div
              style={{
                transform: `scale(${modalZoomScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.1s ease-out'
              }}
            >
              <canvas 
                ref={modalCanvasRef}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageLayoutTools