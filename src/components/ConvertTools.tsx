import { useState, useRef, useCallback, useEffect, useMemo, ChangeEvent, DragEvent } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import potrace from 'potrace'
import { 
  RefreshCw, 
  Maximize, 
  UploadCloud, 
  X, 
  Lock, 
  Unlock, 
  Info, 
  Download, 
  CheckCircle2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'

interface FileItem {
  id: string
  name: string
  file: File
  originalWidth?: number
  originalHeight?: number
  originalFormat?: string
}

type ImageFormat = 'jpg' | 'png' | 'webp' | 'svg' | 'ico'
type IcoSize = '16' | '24' | '32' | '48' | '64'
type SizeOption = 'original' | '32' | '48' | '64' | '100' | '280' | '500' | 'custom'
type ToolMode = 'format' | 'size'

const ConvertTools = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [convertedResults, setConvertedResults] = useState<string[]>([])
  const [selectedResults, setSelectedResults] = useState<number[]>([])
  const [format, setFormat] = useState<ImageFormat>('jpg')
  const [icoSize, setIcoSize] = useState<IcoSize>('32')
  
  const [activeMode, setActiveMode] = useState<ToolMode>('format')
  const [sizeMode, setSizeMode] = useState<SizeOption>('original')
  const [customWidth, setCustomWidth] = useState<string>('')
  const [customHeight, setCustomHeight] = useState<string>('')
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  
  const [isDragging, setIsDragging] = useState(false)
  const [showModal, setShowModal] = useState(false) 
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getImageMetadata = (file: File): Promise<{ w: number, h: number, ext: string }> => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        resolve({
          w: img.width,
          h: img.height,
          ext: ext === 'jpeg' ? 'jpg' : ext
        })
        URL.revokeObjectURL(url)
      }
      img.src = url
    })
  }

  const hasMixedFormats = useMemo(() => {
    const extensions = files.map(f => f.originalFormat || f.name.split('.').pop()?.toLowerCase());
    const uniqueExtensions = new Set(extensions.map(ext => ext === 'jpeg' ? 'jpg' : ext));
    return uniqueExtensions.size > 1;
  }, [files]);

  const availableFormats = useMemo(() => {
    const activeExtensions = files.map(f => f.originalFormat || (f.name.split('.').pop()?.toLowerCase() === 'jpeg' ? 'jpg' : f.name.split('.').pop()?.toLowerCase()))
    const allOptions: { value: ImageFormat; label: string }[] = [
      { value: 'jpg', label: 'JPG' },
      { value: 'png', label: 'PNG' },
      { value: 'webp', label: 'WEBP' },
      { value: 'svg', label: 'SVG' },
      { value: 'ico', label: 'ICO' },
    ]
    return allOptions.filter(option => !activeExtensions.every(ext => ext === option.value))
  }, [files])

  useEffect(() => {
    if (availableFormats.length > 0) {
      const isCurrentFormatValid = availableFormats.some(f => f.value === format)
      if (!isCurrentFormatValid) {
        setFormat(availableFormats[0].value)
      }
    }
  }, [availableFormats, format])

  const getBaseAspectRatio = async (): Promise<number> => {
    if (files.length === 0) return 1
    if (files[0].originalWidth && files[0].originalHeight) {
        return files[0].originalWidth / files[0].originalHeight
    }
    return 1
  }

  const handleWidthChange = async (val: string) => {
    setCustomWidth(val)
    if (lockAspectRatio && val && !isNaN(parseInt(val))) {
      const ratio = await getBaseAspectRatio()
      setCustomHeight(Math.round(parseInt(val) / ratio).toString())
    }
  }

  const handleHeightChange = async (val: string) => {
    setCustomHeight(val)
    if (lockAspectRatio && val && !isNaN(parseInt(val))) {
      const ratio = await getBaseAspectRatio()
      setCustomWidth(Math.round(parseInt(val) * ratio).toString())
    }
  }

  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement> | { target: { files: FileList | File[] | null } }) => {
    const inputFiles = e.target.files
    if (!inputFiles) return

    const newFilesProcessed = await Promise.all(Array.from(inputFiles).map(async (file) => {
      const meta = await getImageMetadata(file)
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        file: file,
        originalWidth: meta.w,
        originalHeight: meta.h,
        originalFormat: meta.ext
      }
    }))

    setFiles(prev => [...prev, ...newFilesProcessed])
    if (!selectedFile && newFilesProcessed.length > 0) setSelectedFile(newFilesProcessed[0])
  }, [selectedFile])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id)
      if (selectedFile?.id === id) setSelectedFile(filtered[0] || null)
      return filtered
    })
  }, [selectedFile])

  const convertFile = useCallback(async (fileItem: FileItem): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (activeMode === 'format' && format === 'svg') {
        const reader = new FileReader()
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result
          if (typeof result === 'string') {
            potrace.trace(result, (err: Error | null, svg: string) => {
              if (err) { reject(err) } 
              else { resolve(`data:image/svg+xml;base64,${btoa(svg)}`) }
            })
          }
        }
        reader.readAsDataURL(fileItem.file)
      } else {
        const img = new Image()
        img.src = URL.createObjectURL(fileItem.file)

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Canvas context failed'))

          let targetWidth = img.width
          let targetHeight = img.height
          const aspectRatio = img.width / img.height

          if (activeMode === 'size') {
             if (sizeMode === 'custom') {
               targetWidth = parseInt(customWidth) || img.width
               targetHeight = parseInt(customHeight) || img.height
             } else if (sizeMode !== 'original') {
               targetWidth = parseInt(sizeMode)
               targetHeight = Math.round(targetWidth / aspectRatio)
             }
          } else if (format === 'ico') {
            const size = parseInt(icoSize)
            targetWidth = size
            targetHeight = size
          }

          canvas.width = targetWidth
          canvas.height = targetHeight
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          let mimeType = `image/${fileItem.originalFormat === 'jpg' ? 'jpeg' : fileItem.originalFormat}` 
          if (activeMode === 'format') {
            mimeType = format === 'ico' ? 'image/x-icon' : (format === 'jpg' ? 'image/jpeg' : `image/${format}`)
          }
          
          resolve(canvas.toDataURL(mimeType))
          URL.revokeObjectURL(img.src)
        }
        img.onerror = (err) => reject(err)
      }
    })
  }, [format, icoSize, sizeMode, customWidth, customHeight, activeMode])

  const processFiles = useCallback(async () => {
    setIsProcessing(true)
    setProgress(0)
    
    try {
      const results: string[] = []
      for (let i = 0; i < files.length; i++) {
        const res = await convertFile(files[i])
        results.push(res)
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }
      
      setConvertedResults(results)
      setSelectedResults(Array.from({ length: results.length }, (_, i) => i))
      
      setTimeout(() => {
        setIsProcessing(false)
        setShowModal(true)
      }, 500)
    } catch (error) {
      console.error(error)
      setIsProcessing(false)
    }
  }, [files, convertFile])

  const downloadSelected = useCallback(async () => {
    const zip = new JSZip()
    
    for (const index of selectedResults) {
      const result = convertedResults[index]
      const ext = activeMode === 'format' ? format : files[index].originalFormat
      const fileName = `${files[index].name.replace(/\.[^/.]+$/, "")}.${ext}`
      const base64Data = result.split(',')[1]
      
      if (ext === 'svg') {
        zip.file(fileName, atob(base64Data))
      } else {
        zip.file(fileName, base64Data, { base64: true })
      }
    }

    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "converted-images.zip")
  }, [selectedResults, convertedResults, files, format, activeMode])

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); }
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); }
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFileUpload({ target: { files: e.dataTransfer.files } });
  }

  const toggleResultSelection = (index: number) => {
    setSelectedResults(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])
  }

  const toggleSelectAll = () => {
    setSelectedResults(selectedResults.length === convertedResults.length ? [] : Array.from({ length: convertedResults.length }, (_, i) => i))
  }

  useEffect(() => { setConvertedResults([]); setSelectedResults([]); }, [format, activeMode, sizeMode])

  return (
    <div className="relative space-y-6">
      {/* PROCESSING OVERLAY */}
      {isProcessing && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 1000 }}>
          <div style={{ background: '#09090b', padding: '40px', borderRadius: '24px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,1)' }}>
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1">Processing Images</h3>
              <p className="text-sm text-zinc-500">Converting {files.length} file(s)</p>
            </div>
            <div style={{ width: '280px', height: '8px', background: '#18181b', borderRadius: '999px', overflow: 'hidden', border: '1px solid #27272a' }}>
              <div 
                style={{ height: '100%', background: '#ffffff', width: `${progress}%`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </div>
            <span className="text-sm font-mono font-medium text-white">{progress}%</span>
          </div>
        </div>
      )}

      <div className="input-group">
        <label className="label text-zinc-400 font-medium block text-sm">Upload Images</label>
        
        {hasMixedFormats && (
          <div style={{ backgroundColor: '#18181b', color: '#e4e4e7', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #27272a', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Info size={16} className="text-zinc-400" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Multiple formats detected. Target options updated.</span>
          </div>
        )}

        <div
          className={`drag-drop-zone ${isDragging ? 'dragging' : ''} mb-2`}
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            cursor: 'pointer', border: '2px dashed #27272a', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', transition: 'all 0.2s ease', background: isDragging ? '#18181b' : 'transparent', borderColor: isDragging ? '#fff' : '#27272a'
          }}
        >
          <div className="drag-drop-content flex flex-col items-center gap-3">
            <div style={{ background: '#18181b', padding: '12px', borderRadius: '50%', border: '1px solid #27272a' }}>
                <UploadCloud size={28} className={isDragging ? 'text-white' : 'text-zinc-500'} />
            </div>
            <div>
                <p className="drag-drop-text font-semibold" style={{ color: isDragging ? '#fff' : '#e4e4e7' }}>{isDragging ? 'Drop to upload' : 'Click or drag images here'}</p>
                <p className="drag-drop-subtext text-xs text-zinc-500 mt-1">Supports PNG, JPG, WEBP</p>
            </div>
          </div>
        </div>
        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
      </div>

      {files.length > 0 && (
        <div className="tool-container" style={{ background: '#09090b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#18181b', padding: '8px', borderRadius: '8px' }}>
                <ImageIcon size={18} className="text-zinc-400" />
            </div>
            <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#fff' }}>Queue Management</h4>
                <p style={{ fontSize: '0.8rem', color: '#71717a' }}>{files.length} items ready</p>
            </div>
          </div>
          
          <div className="tab-nav-container" style={{ marginBottom: '24px' }}>
            <div className="tab-nav-wrapper" style={{ position: 'relative', display: 'flex', background: '#18181b', borderRadius: '10px', padding: '4px', border: '1px solid #27272a' }}>
              <button onClick={() => setActiveMode('format')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', zIndex: 2, transition: 'all 0.3s', background: 'transparent', color: activeMode === 'format' ? '#000' : '#71717a', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RefreshCw size={14} /> Format
              </button>
              <button onClick={() => setActiveMode('size')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', zIndex: 2, transition: 'all 0.3s', background: 'transparent', color: activeMode === 'size' ? '#000' : '#71717a', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Maximize size={14} /> Size
              </button>
              <div style={{ position: 'absolute', top: '4px', left: activeMode === 'format' ? '4px' : '50%', width: 'calc(50% - 4px)', height: 'calc(100% - 8px)', background: '#ffffff', borderRadius: '7px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1 }}></div>
            </div>
          </div>

          <div className="uploaded-list" style={{ marginBottom: '24px' }}>
            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }} className="custom-scrollbar">
              {files.map(f => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: '#18181b', padding: '10px 14px', borderRadius: '10px', border: '1px solid #27272a', gap: '12px' }}>
                  <span style={{ color: '#e4e4e7', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{f.name}</span>
                  <button onClick={() => removeFile(f.id)} style={{ color: '#71717a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mode-content" style={{ marginBottom: '24px' }}>
            {activeMode === 'format' ? (
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="label text-xs text-zinc-500 font-bold uppercase mb-2 block">Target Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as ImageFormat)} className="select" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#18181b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}>
                    {availableFormats.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                {format === 'ico' && (
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="label text-xs text-zinc-500 font-bold uppercase mb-2 block">ICO Size</label>
                    <select value={icoSize} onChange={(e) => setIcoSize(e.target.value as IcoSize)} className="select" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#18181b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}>
                      {['16','24','32','48','64'].map(s => <option key={s} value={s}>{s} x {s} px</option>)}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="input-group w-full">
                  <label className="label text-xs text-zinc-500 font-bold uppercase mb-2 block">Dimensions</label>
                  <select value={sizeMode} onChange={(e) => setSizeMode(e.target.value as SizeOption)} className="select" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#18181b', border: '1px solid #27272a', color: '#fff', outline: 'none' }}>
                    <option value="original">Original Aspect Ratio</option>
                    <option value="32">32px</option>
                    <option value="100">100px</option>
                    <option value="500">500px</option>
                    <option value="custom">Manual Resize...</option>
                  </select>
                </div>
                {sizeMode === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <input type="number" value={customWidth} onChange={(e) => handleWidthChange(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#18181b', border: '1px solid #27272a', color: '#fff', outline: 'none' }} placeholder="Width" />
                    </div>
                    <div style={{ color: '#3f3f46' }}>×</div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input type="number" value={customHeight} onChange={(e) => handleHeightChange(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: lockAspectRatio ? 'rgba(24, 24, 27, 0.5)' : '#18181b', border: '1px solid #27272a', color: '#fff', paddingRight: '40px', outline: 'none' }} readOnly={lockAspectRatio} placeholder="Height" />
                        <button type="button" onClick={() => setLockAspectRatio(!lockAspectRatio)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: lockAspectRatio ? '#fff' : '#52525b' }}>
                          {lockAspectRatio ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={processFiles} disabled={isProcessing} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#ffffff', color: '#000', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />} 
            {isProcessing ? 'Processing...' : `Convert ${files.length} Image(s)`}
          </button>
        </div>
      )}

      {/* RESULT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', margin: '0 auto', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px', backdropFilter: 'blur(10px)' }}>
          <div style={{ background: '#09090b', width: '100%', maxWidth: '1000px', maxHeight: '90vh', borderRadius: '28px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Conversion Ready</h3>
                <p style={{ fontSize: '0.85rem', color: '#71717a' }}>Select files to save</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '32px', overflowY: 'auto', flex: 1, background: '#020617' }} className="custom-scrollbar">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" id="selectAll" checked={selectedResults.length === convertedResults.length} onChange={toggleSelectAll} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#fff' }} />
                  <label htmlFor="selectAll" style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#e4e4e7', fontWeight: '500' }}>Select All</label>
                </div>
                {selectedResults.length > 0 && (
                  <button onClick={downloadSelected} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={16} /> Download ZIP
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {convertedResults.map((result, index) => (
                  <div key={index} style={{ border: '1px solid #1e293b', borderRadius: '20px', overflow: 'hidden', background: '#09090b' }}>
                    <div style={{ aspectRatio: '1/1', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid #1e293b' }}>
                        <input type="checkbox" checked={selectedResults.includes(index)} onChange={() => toggleResultSelection(index)} style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 10, width: '18px', height: '18px', cursor: 'pointer', accentColor: '#000' }} />
                        <img src={result} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} alt="preview" />
                    </div>
                    <div style={{ padding: '16px' }}>
                      {/* Nama File Terpotong di Card Hasil */}
                      <p style={{ fontSize: '0.75rem', color: '#e4e4e7', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>{files[index].name}</p>
                      <button onClick={() => saveAs(result, `${files[index].name.split('.')[0]}.${activeMode === 'format' ? format : files[index].originalFormat}`)} style={{ width: '100%', background: '#18181b', color: '#fff', border: '1px solid #27272a', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Download size={14} /> Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '24px 32px', borderTop: '1px solid #27272a', textAlign: 'right', background: '#09090b' }}>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', color: '#fff', border: '1px solid #27272a', padding: '12px 32px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConvertTools;