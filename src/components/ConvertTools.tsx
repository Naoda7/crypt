import { useState, useRef, useCallback, useEffect, useMemo, ChangeEvent, DragEvent } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import potrace from 'potrace'

interface FileItem {
  id: string
  name: string
  file: File
}

type ImageFormat = 'jpg' | 'png' | 'webp' | 'svg' | 'ico'
type IcoSize = '16' | '24' | '32' | '48' | '64'

const ConvertTools = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [convertedResults, setConvertedResults] = useState<string[]>([])
  const [selectedResults, setSelectedResults] = useState<number[]>([])
  const [format, setFormat] = useState<ImageFormat>('jpg')
  const [icoSize, setIcoSize] = useState<IcoSize>('32')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasMixedFormats = useMemo(() => {
    const extensions = files.map(f => f.name.split('.').pop()?.toLowerCase());
    const uniqueExtensions = new Set(extensions.map(ext => ext === 'jpeg' ? 'jpg' : ext));
    return uniqueExtensions.size > 1;
  }, [files]);

  const availableFormats = useMemo(() => {
    const activeExtensions = files.map(f => {
      const ext = f.name.split('.').pop()?.toLowerCase()
      return ext === 'jpeg' ? 'jpg' : ext
    })

    const allOptions: { value: ImageFormat; label: string }[] = [
      { value: 'jpg', label: 'JPG' },
      { value: 'png', label: 'PNG' },
      { value: 'webp', label: 'WEBP' },
      { value: 'svg', label: 'SVG' },
      { value: 'ico', label: 'ICO' },
    ]

    return allOptions.filter(option => !activeExtensions.includes(option.value))
  }, [files])

  useEffect(() => {
    if (availableFormats.length > 0) {
      const isCurrentFormatValid = availableFormats.some(f => f.value === format)
      if (!isCurrentFormatValid) {
        setFormat(availableFormats[0].value)
      }
    }
  }, [availableFormats, format])

  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement> | { target: { files: FileList | File[] | null } }) => {
    const inputFiles = e.target.files
    if (!inputFiles) return

    const newFiles = Array.from(inputFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      file: file
    }))

    setFiles(prev => [...prev, ...newFiles])
    if (!selectedFile && newFiles.length > 0) setSelectedFile(newFiles[0])
  }, [selectedFile])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id)
      if (selectedFile?.id === id) setSelectedFile(filtered[0] || null)
      return filtered
    })
  }, [selectedFile])

  const convertFile = useCallback(async (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (format === 'svg') {
        const reader = new FileReader()
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result
          if (typeof result === 'string') {
            potrace.trace(result, (err: Error | null, svg: string) => {
              if (err) {
                console.error('Error converting to SVG:', err)
                reject(err)
              } else {
                resolve(`data:image/svg+xml;base64,${btoa(svg)}`)
              }
            })
          }
        }
        reader.readAsDataURL(file)
      } else {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context failed'))
            return
          }

          if (format === 'ico') {
            const size = parseInt(icoSize)
            canvas.width = size
            canvas.height = size
          } else {
            canvas.width = img.width
            canvas.height = img.height
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          let mimeType = ''
          if (format === 'ico') {
            mimeType = 'image/x-icon'
          } else {
            mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`
          }
          resolve(canvas.toDataURL(mimeType))
          URL.revokeObjectURL(img.src)
        }

        img.onerror = (err) => {
          console.error('Error loading image:', err)
          reject(err)
        }
      }
    })
  }, [format, icoSize])

  const processFiles = useCallback(async () => {
    const results = await Promise.all(files.map(async (file) => {
      return convertFile(file.file)
    }))
    setConvertedResults(results)
    setSelectedResults([])
  }, [files, convertFile])

  const downloadSelected = useCallback(async () => {
    const zip = new JSZip()
    const folder = zip.folder("converted-images")

    for (const index of selectedResults) {
      const result = convertedResults[index]
      const fileName = `converted-${files[index].name.replace(/\.[^/.]+$/, "")}.${format}`

      if (format === 'svg') {
        const svgContent = atob(result.split(',')[1])
        folder?.file(fileName, svgContent)
      } else {
        const base64Data = result.split(',')[1]
        folder?.file(fileName, base64Data, { base64: true })
      }
    }

    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "converted-images.zip")
  }, [selectedResults, convertedResults, files, format])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileUpload({ target: { files: droppedFiles } })
    }
  }, [handleFileUpload])

  const toggleResultSelection = useCallback((index: number) => {
    setSelectedResults(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedResults.length === convertedResults.length) {
      setSelectedResults([])
    } else {
      setSelectedResults(Array.from({ length: convertedResults.length }, (_, i) => i))
    }
  }, [selectedResults, convertedResults])

  useEffect(() => {
    setConvertedResults([])
    setSelectedResults([])
  }, [format])

  return (
    <div className="space-y-6">
      <div className="input-group">
        <label className="label">Upload Images</label>
        
        {hasMixedFormats && (
          <div className="alert-box" style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '12px',
            fontSize: '0.875rem',
            border: '1px solid #ffeeba',
            lineHeight: '1.4'
          }}>
            <strong>💡 Note:</strong> You have uploaded files with different formats. 
            The available conversion options are limited to formats <strong>not currently used</strong> by your uploaded files.
          </div>
        )}

        <div
          className={`drag-drop-zone ${isDragging ? 'dragging' : ''} mb-2`}
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
          style={{ display: 'none' }}
        />
        
        {files.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Uploaded Files ({files.length})</h4>
            <div className="uploaded-files-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {files.map(file => (
                <div key={file.id} className="uploaded-file" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '10px' 
                }}>
                  {/* Perbaikan pada nama file agar tetap dalam satu baris dengan ellipsis */}
                  <span className="uploaded-file-name" style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    flex: '1',
                    minWidth: '0' 
                  }}>
                    {file.name}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="remove-file-btn"
                    style={{ flexShrink: '0' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <>
          <div className="input-group">
            <h4 className="label mb-1">Convert To</h4>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ImageFormat)}
              className="select"
            >
              {availableFormats.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
              {availableFormats.length === 0 && <option disabled>No target formats available</option>}
            </select>
          </div>

          {format === 'ico' && (
            <div className="input-group">
              <label className="label">ICO Size</label>
              <select
                value={icoSize}
                onChange={(e) => setIcoSize(e.target.value as IcoSize)}
                className="select"
              >
                <option value="16">16x16</option>
                <option value="24">24x24</option>
                <option value="32">32x32</option>
                <option value="48">48x48</option>
                <option value="64">64x64</option>
              </select>
            </div>
          )}

          <button
            onClick={processFiles}
            className="btn btn-primary w-full mb-3"
            disabled={availableFormats.length === 0}
          >
            Convert All Files
          </button>
        </>
      )}

      {convertedResults.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Converted Results</h3>
            {selectedResults.length > 0 && (
              <button
                onClick={downloadSelected}
                className="btn btn-secondary"
              >
                {selectedResults.length === convertedResults.length
                  ? 'Download All as ZIP'
                  : `Download Selected (${selectedResults.length}) as ZIP`}
              </button>
            )}
          </div>

          <div className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={selectedResults.length === convertedResults.length && convertedResults.length > 0}
              onChange={toggleSelectAll}
              className="result-checkbox"
            />
            <span className="ml-2 text-sm">Select All</span>
          </div>

          <div className="results-grid">
            {convertedResults.map((result, index) => (
              <div key={index} className="result-item">
                {format === 'svg' ? (
                  <iframe
                    src={result}
                    title={`result-${index}`}
                    className="result-image"
                    style={{ width: '100%', height: '150px', border: 'none' }}
                  />
                ) : (
                  <img
                    src={result}
                    alt={`Result ${index + 1}`}
                    className="result-image"
                  />
                )}
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
                        link.download = `converted-${files[index].name.replace(/\.[^/.]+$/, "")}.${format}`
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

export default ConvertTools