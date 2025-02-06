import { useState, useRef, useEffect } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Download, X } from 'lucide-react'

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded'
type CornerType = 'square' | 'dot' | 'rounded'
type ImageFormat = 'png' | 'jpeg' | 'svg'

const QRCodeGenerator = () => {
  const [options, setOptions] = useState({
    data: '',
    errorCorrectionLevel: 'H' as ErrorCorrectionLevel,
    bgColor: '#ffffff',
    qrColor: '#000000',
    dotType: 'square' as DotType,
    cornerType: 'square' as CornerType,
    imageFormat: 'png' as ImageFormat,
    size: 300,
    logoSize: 0.2 // 20% dari ukuran QR code
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)

  const qrCode = useRef<QRCodeStyling | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const container = qrRef.current
    
    if (container) {
      qrCode.current = new QRCodeStyling({
        width: options.size,
        height: options.size,
        data: options.data,
        margin: 10,
        qrOptions: {
          errorCorrectionLevel: options.errorCorrectionLevel
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: options.logoSize,
          margin: 5
        },
        dotsOptions: {
          color: options.qrColor,
          type: options.dotType
        },
        cornersSquareOptions: {
          color: options.qrColor,
          type: options.cornerType
        },
        backgroundOptions: {
          color: options.bgColor
        },
        image: logoPreview || undefined
      })
  
      container.style.width = '100%'
      container.style.height = '100%'
      
      qrCode.current.append(container)
    }
  
    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [options, logoPreview])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null)
    const file = e.target.files?.[0]
    
    if (!file) return

    // Validasi ukuran file
    if (file.size > 500 * 1024) { // 500KB
      setLogoError('Ukuran file maksimal 500KB')
      return
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      setLogoError('File harus berupa gambar')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogoPreview(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoPreview(null)
    setLogoError(null)
    
    // Reset input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadQR = () => {
    if (qrCode.current && options.data) {
      qrCode.current.download({
        extension: options.imageFormat,
        name: `qr-code-${Date.now()}`
      })
    }
  }

  return (
    <div className="container">
      <h2 className="text-center mb-2">QR Code Generator</h2>

      {/* Input Data */}
      <div className="mb-8">
        <textarea
          value={options.data}
          onChange={(e) => setOptions({...options, data: e.target.value})}
          placeholder="Enter data or URL here..."
          className="textarea"
          rows={3}
        />
      </div>

      {/* Preview QR Code */}
      <div className="flex justify-center mb-8">
        <div className="qr-preview-container">
          <div ref={qrRef} />
        </div>
      </div>

      {/* Customization Grid */}
      <div className="space-y-6">

      {/* Download */}
      <div className="input-group flex items-end">
        <button 
            onClick={downloadQR}
            className="btn btn-primary w-full h-[42px]"
            disabled={!options.data}
        >
            <Download size={20} className="mr-2" />
            Download QR
        </button>
      </div>

        {/* Baris 1: Warna */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">BG Color</label>
            <input
              type="color"
              value={options.bgColor}
              onChange={(e) => setOptions({...options, bgColor: e.target.value})}
              className="color-input"
            />
          </div>
          <div className="input-group">
            <label className="label">Shape Color</label>
            <input
              type="color"
              value={options.qrColor}
              onChange={(e) => setOptions({...options, qrColor: e.target.value})}
              className="color-input"
            />
          </div>
        </div>

        {/* Bagian upload logo */}
        <div className="input-group">
            <label className="label">Add Logo</label>
            <div className="flex items-center">
            <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="file-input"
                disabled={!!logoPreview}
                ref={fileInputRef} // Tambahkan ref disini
            />

                {logoPreview && (
                <span className="text-space">
                    success
                </span>
                )}

                {logoPreview && (
                    <button
                    onClick={removeLogo}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-[999] mr-90 "
                    title="Hapus Logo"
                    >
                    <X size={13} className="text-white" />
                    </button>
                )}

            </div>
                {logoError && (
                    <p className="text-red-500 text-sm mt-1">{logoError}</p>
                )}
        </div>
        
        <div className="input-group">
            <label className="label">Logo Size</label>
            <select
                value={options.logoSize}
                onChange={(e) => setOptions({
                ...options,
                logoSize: parseFloat(e.target.value)
                })}
                className="select"
            >
                <option value={0.1}>Small (10%)</option>
                <option value={0.2}>Medium (20%)</option>
                <option value={0.3}>Large (30%)</option>
            </select>
        </div>

        {/* Baris 2: Bentuk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Shape style</label>
            <select
              value={options.dotType}
              onChange={(e) => setOptions({...options, dotType: e.target.value as DotType})}
              className="select"
            >
              <option value="square">Square</option>
              <option value="dots">Dots</option>
              <option value="rounded">Rounded</option>
              <option value="classy">Classy</option>
              <option value="classy-rounded">Classy Rounded</option>
            </select>
          </div>
          <div className="input-group">
            <label className="label">Border style</label>
            <select
              value={options.cornerType}
              onChange={(e) => setOptions({...options, cornerType: e.target.value as CornerType})}
              className="select"
            >
              <option value="square">Square</option>
              <option value="dot">Dot</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>
        </div>

        {/* Baris 3: Settingan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Level Error Correction</label>
            <select
              value={options.errorCorrectionLevel}
              onChange={(e) => setOptions({...options, errorCorrectionLevel: e.target.value as ErrorCorrectionLevel})}
              className="select"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
          <div className="input-group">
            <label className="label">File Type</label>
            <select
              value={options.imageFormat}
              onChange={(e) => setOptions({...options, imageFormat: e.target.value as ImageFormat})}
              className="select"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="svg">SVG</option>
            </select>
          </div>
        </div>

        {/* Baris 4: Ukuran dan Download */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Dimensions (px)</label>
            <input
              type="number"
              value={options.size}
              onChange={(e) => setOptions({...options, size: Math.min(1000, Math.max(100, parseInt(e.target.value)))})}
              className="input"
              min="100"
              max="1000"
            />
          </div>
        </div>

        
      </div>
    </div>
  )
}

export default QRCodeGenerator