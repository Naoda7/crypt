import { useState, useRef, useEffect, useCallback } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

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
  const [isBold, setIsBold] = useState(false) // State Tebal
  const [isItalic, setIsItalic] = useState(false) // State Miring
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
    if (!selectedFile) setSelectedFile(newFiles[0])
  }, [selectedFile])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    if (selectedFile?.id === id) setSelectedFile(files[0] || null)
  }, [selectedFile, files])

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
          // Mengatur Style Font (Italic Bold Size Family)
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
      {/* Upload Section */}
      <div className="input-group">
        <label className="label">Upload Images</label>
        
        <div 
          className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drag-drop-content">
            <p className="drag-drop-text">
              {isDragging ? '🎉 Drop files here' : '📁 Drag & drop files or click to select'}
            </p>
            <p className="drag-drop-subtext">(Supported formats: PNG, JPG, JPEG)</p>
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
          <div className="uploaded-files-wrapper">
            <h4 className="uploaded-files-title">Selected Files ({files.length})</h4>
            <div className="uploaded-files-list">
              {files.map(file => (
                <div key={file.id} className="uploaded-file-item">
                  <span className="file-name">{file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="remove-file-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Watermark Controls */}
      {files.length > 0 && (
        <>
          <div className="input-group">
              <label className="label">Live Preview</label>
              <div className="preview-container">
                  <canvas ref={canvasRef} className="preview-canvas" />
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

          {/* Weight*/}
          <div className="input-group">
            <label className="label">Font Style</label>
            <div style={{ display: 'flex', gap: '12px' }}> {/* Menambahkan gap manual yang pasti bekerja */}
              <button 
                type="button"
                className={`btn ${isBold ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setIsBold(!isBold)}
              >
                <span style={{ fontWeight: 'bold' }}>B</span> &nbsp; Bold
              </button>
              <button 
                type="button"
                className={`btn ${isItalic ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setIsItalic(!isItalic)}
              >
                <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>I</span> &nbsp; Italic
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

      {/* Results Section */}
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