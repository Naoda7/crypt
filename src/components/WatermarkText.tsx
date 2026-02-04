import { useState, useRef, useEffect, useCallback } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { UploadCloud, X } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  file: File
}

const WatermarkText = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [watermarkedResults, setWatermarkedResults] = useState<string[]>([])
  const [selectedResults, setSelectedResults] = useState<number[]>([])
  const [text, setText] = useState('')
  const [fontColor, setFontColor] = useState('#000000')
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [opacity, setOpacity] = useState(0.5)
  const [position, setPosition] = useState('center')
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fontOptions = [
    { name: 'Sans Serif (Arial)', value: 'Arial' },
    { name: 'Serif (Times New Roman)', value: 'Times New Roman' },
    { name: 'Monospace (Courier New)', value: 'Courier New' },
    { name: 'Modern (Geist)', value: 'Geist, sans-serif' },
    { name: 'Bold Impact', value: 'Impact' },
    { name: 'Handwritten (Brush Script MT)', value: 'Brush Script MT, cursive' },
  ];

  const getTextPosition = useCallback((imgWidth: number, imgHeight: number, textWidth: number) => {
    switch(position) {
      case 'top-left': return { x: 10, y: 40 }
      case 'top-right': return { x: imgWidth - textWidth - 10, y: 40 }
      case 'center': return { x: imgWidth/2 - textWidth/2, y: imgHeight/2 }
      case 'bottom-left': return { x: 10, y: imgHeight - 30 }
      case 'bottom-right': return { x: imgWidth - textWidth - 10, y: imgHeight - 30 }
      default: return { x: 10, y: 40 }
    }
  }, [position])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      file: file
    }))
    setFiles(prev => [...prev, ...newFiles])
    if (!selectedFile && newFiles.length > 0) setSelectedFile(newFiles[0])
  }, [selectedFile])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (selectedFile?.id === id) {
        setSelectedFile(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
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
        if (text) {
          const fontWeight = isBold ? 'bold' : 'normal'
          const fontStyle = isItalic ? 'italic' : ''
          ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
          
          ctx.fillStyle = fontColor
          ctx.globalAlpha = opacity
          const textWidth = ctx.measureText(text).width
          const { x, y } = getTextPosition(img.width, img.height, textWidth)
          ctx.fillText(text, x, y)
        }
        resolve(canvas.toDataURL())
      }
    })
  }, [text, fontColor, fontSize, fontFamily, isBold, isItalic, opacity, getTextPosition])

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
          const canvas = canvasRef.current!
          const ctx = canvas.getContext('2d')!
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
        }
      })
    }
  }, [selectedFile, generatePreview])

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
    const folder = zip.folder("WMImg")
    selectedResults.forEach(index => {
      const result = watermarkedResults[index]
      const fileName = `watermarked-${files[index].name}`
      const base64Data = result.split(',')[1]
      folder?.file(fileName, base64Data, { base64: true })
    })
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "WM-images.zip")
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
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      const newFiles = droppedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        file: file
      }))
      setFiles(prev => [...prev, ...newFiles])
      if (!selectedFile) setSelectedFile(newFiles[0])
    }
  }, [selectedFile])

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
              {files.map(file => (
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
                  <span 
                    style={{ 
                      color: '#e4e4e7', 
                      fontWeight: '500', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap', 
                      flex: 1 
                    }}
                  >
                    {file.name}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} 
                    style={{ 
                      color: '#71717a', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      flexShrink: 0,
                      padding: '2px'
                    }}
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
              top: '0px', 
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
                borderRadius: '12px',
                overflow: 'hidden',
                maxHeight: '250px',
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
                  maxHeight: '250px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>
          
          <div className="input-group">
            <label className="label">Watermark Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input"
              placeholder="Enter watermark text..."
            />
          </div>

          <div className="input-group">
            <label className="label">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="select"
              style={{ fontFamily: fontFamily }}
            >
              {fontOptions.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="label">Font Style</label>
            <div className="flex gap-3">
              <button 
                type="button"
                className={`btn ${isBold ? 'btn-primary' : 'btn-secondary'} flex-1`}
                onClick={() => setIsBold(!isBold)}
              >
                <span className="font-bold mr-2">B</span> Bold
              </button>
              <button 
                type="button"
                className={`btn ${isItalic ? 'btn-primary' : 'btn-secondary'} flex-1`}
                onClick={() => setIsItalic(!isItalic)}
              >
                <span className="italic font-serif mr-2">I</span> Italic
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="label">Font Color</label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="color-input"
            />
          </div>

          <div className="input-group">
            <label className="label">Font Size ({fontSize}px)</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 0)}
              className="input"
              min="10"
              max="200"
            />
          </div>

          <div className="input-group">
            <label className="label">Opacity ({Math.round(opacity * 100)}%)</label>
            <input
              type="range"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="input"
              min="0"
              max="1"
              step="0.05"
            />
          </div>

          <div className="input-group">
            <label className="label">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="select"
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="center">Center</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          <button
            onClick={processFiles}
            className="btn btn-primary w-full"
          >
            Process All Files
          </button>
        </>
      )}

      {watermarkedResults.length > 0 && (
        <div className="m-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Processed Results</h3>
            
            {(selectedResults.length > 0 || selectedResults.length === watermarkedResults.length) && (
              <button
                onClick={downloadSelected}
                className="btn btn-secondary"
              >
                {selectedResults.length === watermarkedResults.length
                  ? 'Download All as ZIP'
                  : `Download Selected (${selectedResults.length}) as ZIP`}
              </button>
            )}
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={selectedResults.length === watermarkedResults.length && watermarkedResults.length > 0}
              onChange={toggleSelectAll}
              className="result-checkbox"
            />
            <span className="ml-2 text-sm">Select All</span>
          </div>

          <div className="results-grid">
            {watermarkedResults.map((result, index) => (
              <div key={index} className="result-item">
                <img
                  src={result}
                  alt={`Result ${index + 1}`}
                  className="result-image"
                />
                <div className="result-actions">
                  <input
                    type="checkbox"
                    checked={selectedResults.includes(index)}
                    onChange={() => toggleResultSelection(index)}
                    className="result-checkbox"
                  />
                  {selectedResults.length === 0 && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = result
                        link.download = `WMImg-${files[index].name}`
                        link.click()
                      }}
                      className="btn btn-primary btn-sm"
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

export default WatermarkText