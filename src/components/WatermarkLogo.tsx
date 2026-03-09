import { useState, useRef, useEffect, useCallback } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { UploadCloud, X, Image as ImageIcon, ChevronDown } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  file: File
}

const WatermarkLogo = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [watermarkedResults, setWatermarkedResults] = useState<string[]>([])
  const [selectedResults, setSelectedResults] = useState<number[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(0.2)
  const [opacity, setOpacity] = useState(0.5)
  const [position, setPosition] = useState('center')
  const [isDragging, setIsDragging] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const getLogoPosition = useCallback((imgWidth: number, imgHeight: number, logoWidth: number, logoHeight: number) => {
    const margin = 20
    switch(position) {
      case 'top-left': 
        return { x: margin, y: margin }
      case 'top-right': 
        return { x: imgWidth - logoWidth - margin, y: margin }
      case 'center': 
        return { x: (imgWidth - logoWidth) / 2, y: (imgHeight - logoHeight) / 2 }
      case 'bottom-left': 
        return { x: margin, y: imgHeight - logoHeight - margin }
      case 'bottom-right': 
        return { x: imgWidth - logoWidth - margin, y: imgHeight - logoHeight - margin }
      default: 
        return { x: margin, y: margin }
    }
  }, [position])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
    const newFiles = Array.from(e.target.files || []).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      file: file
    }))
    setFiles(prev => [...prev, ...newFiles])
    if (!selectedFile && newFiles.length > 0) setSelectedFile(newFiles[0])
  }, [selectedFile])

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoPreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== id)
      if (selectedFile?.id === id) setSelectedFile(updatedFiles[0] || null)
      return updatedFiles
    })
  }, [selectedFile])

  const generatePreview = useCallback(async (file: File) => {
    return new Promise<string>((resolve) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        if (logoPreview) {
          const logoImg = new Image()
          logoImg.src = logoPreview
          logoImg.onload = () => {
            const scaleFactor = (img.width * logoSize) / logoImg.width
            const logoWidth = logoImg.width * scaleFactor
            const logoHeight = logoImg.height * scaleFactor

            const { x, y } = getLogoPosition(img.width, img.height, logoWidth, logoHeight)
            
            ctx.globalAlpha = opacity
            ctx.drawImage(logoImg, x, y, logoWidth, logoHeight)
            resolve(canvas.toDataURL())
          }
        } else {
          resolve(canvas.toDataURL())
        }
      }
    })
  }, [logoPreview, logoSize, opacity, getLogoPosition])

  const processFiles = useCallback(async () => {
    const results = await Promise.all(files.map(async (file) => {
      return generatePreview(file.file)
    }))
    setWatermarkedResults(results)
    setSelectedResults([])
  }, [files, generatePreview])

  useEffect(() => {
    if (selectedFile) {
      generatePreview(selectedFile.file).then((preview) => {
        const img = new Image()
        img.src = preview
        img.onload = () => {
          if (canvasRef.current) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')!
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
          }
        }
      })
    }
  }, [selectedFile, logoPreview, generatePreview])

  const toggleResultSelection = useCallback((index: number) => {
    setSelectedResults(prev => prev.includes(index) 
      ? prev.filter(i => i !== index) 
      : [...prev, index]
    )
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedResults(prev => 
      prev.length === watermarkedResults.length 
        ? [] 
        : Array.from({ length: watermarkedResults.length }, (_, i) => i)
    )
  }, [watermarkedResults.length])

  const downloadSelected = useCallback(async () => {
    const zip = new JSZip()
    const folder = zip.folder("Watermarked_Images")
    selectedResults.forEach(index => {
      const result = watermarkedResults[index]
      const fileName = `wm-${files[index].name}`
      const base64Data = result.split(',')[1]
      folder?.file(fileName, base64Data, { base64: true })
    })
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "watermarked-collection.zip")
  }, [selectedResults, watermarkedResults, files])

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
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileUpload({ target: { files: droppedFiles } })
    }
  }, [handleFileUpload])

  return (
    <div className="space-y-6">
      <div className="input-group">
        <label className="label">Upload Images</label>
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
            background: isDragging ? '#18181b' : 'transparent'
          }}
        >
          <div className="drag-drop-content flex flex-col items-center gap-3">
            <div style={{ background: '#18181b', padding: '12px', borderRadius: '50%', border: '1px solid #27272a' }}>
              <UploadCloud size={28} className={isDragging ? 'text-white' : 'text-zinc-500'} />
            </div>
            <div>
              <p className="drag-drop-text font-semibold">
                {isDragging ? 'Drop to upload' : 'Click or drag images here'}
              </p>
              <p className="drag-drop-subtext text-xs text-zinc-500 mt-1">(Supports: PNG, JPG, JPEG)</p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {files.length > 0 && (
          <div className="uploaded-list" style={{ marginBottom: '24px', marginTop: '16px' }}>
            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }} className="custom-scrollbar">
              {files.map(f => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: '#18181b', padding: '10px 14px', borderRadius: '10px', border: '1px solid #27272a', gap: '12px' }}>
                  <span style={{ color: '#e4e4e7', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {f.name}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} 
                    style={{ color: '#71717a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
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
        <div className="input-group">
          <label className="label text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2">Watermark Logo</label>
          <div 
            onClick={() => logoInputRef.current?.click()}
            style={{ 
              height: '48px', 
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid #27272a',
              borderRadius: '8px',
              cursor: 'pointer',
              background: '#111',
              padding: '0 12px',
              transition: 'border-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#3f3f46'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#27272a'}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 overflow-hidden">
                <div style={{ background: '#18181b', padding: '6px', borderRadius: '6px', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', flexShrink: 0 }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={16} className="text-zinc-500" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-medium truncate">
                  {logoPreview ? "Logo loaded (Click to change)" : "Click to upload watermark logo"}
                </p>
              </div>
              {logoPreview && (
                <div className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded font-bold uppercase ml-2 flex-shrink-0">
                  Replace
                </div>
              )}
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {files.length > 0 && (
        <>
          <div 
            className="input-group"
            style={{ 
              position: 'sticky', 
              top: '4rem', 
              zIndex: 40, 
              background: '#09090b', 
              paddingTop: '10px',
              paddingBottom: '16px'
            }}
          >
            <label className="label">Live Preview</label>
            <div 
              className="preview-container"
              style={{
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                border: '1px solid #27272a',
                borderRadius: '16px',
                overflow: 'hidden',
                maxHeight: '200px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#111'
              }}
            >
              <canvas 
                ref={canvasRef} 
                className="preview-canvas" 
                style={{ 
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '200px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="label">Logo Size ({Math.round(logoSize * 100)}%)</label>
              <input
                type="range"
                value={logoSize}
                onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                min="0.05"
                max="0.8"
                step="0.01"
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="label">Opacity ({Math.round(opacity * 100)}%)</label>
              <input
                type="range"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.1"
                className="input"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="label">Position</label>
            <div className="select-wrapper">
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="center">Center</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
              <ChevronDown className="select-arrow" size={18} />
            </div>
          </div>

          <button
            onClick={processFiles}
            className="btn btn-primary w-full py-4 font-semibold shadow-lg shadow-blue-500/10"
          >
            Process All Files
          </button>
        </>
      )}

      {watermarkedResults.length > 0 && (
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Processed Results</h3>
            {selectedResults.length > 0 && (
                <button
                onClick={downloadSelected}
                className="btn btn-secondary px-6"
                >
                {selectedResults.length === watermarkedResults.length
                    ? 'Download All (ZIP)'
                    : `Download Selected (${selectedResults.length})`}
                </button>
            )}
          </div>

          <div className="flex items-center mb-6 p-3 bg-zinc-900/30 rounded-lg w-fit">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectedResults.length === watermarkedResults.length}
              onChange={toggleSelectAll}
              className="result-checkbox w-4 h-4 cursor-pointer"
            />
            <label htmlFor="selectAll" className="ml-3 text-sm font-medium text-zinc-300 cursor-pointer select-none">Select All Items</label>
          </div>

          <div className="results-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {watermarkedResults.map((result, index) => (
              <div key={index} className="result-item group relative bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <img
                  src={result}
                  alt={`Result ${index + 1}`}
                  className="result-image w-full aspect-square object-cover"
                />
                <div className="result-actions absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <input
                    type="checkbox"
                    checked={selectedResults.includes(index)}
                    onChange={() => toggleResultSelection(index)}
                    className="result-checkbox self-end w-5 h-5 cursor-pointer"
                  />
                  {selectedResults.length === 0 && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = result
                        link.download = `watermarked-${files[index].name}`
                        link.click()
                      }}
                      className="btn btn-primary btn-sm w-full py-2 text-xs"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WatermarkLogo