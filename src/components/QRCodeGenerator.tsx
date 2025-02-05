import { useState, useRef, useEffect } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Download } from 'lucide-react'

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded'
type CornerType = 'square' | 'dot' | 'rounded'
type ImageFormat = 'png' | 'jpeg' | 'svg'

const QRCodeGenerator = () => {
  const [options, setOptions] = useState({
    data: '',
    errorCorrectionLevel: 'H' as ErrorCorrectionLevel,
    bgColor: '#fff',
    qrColor: '#000',
    dotType: 'square' as DotType,
    cornerType: 'square' as CornerType,
    imageFormat: 'png' as ImageFormat,
    size: 300
  })

  const qrCode = useRef<QRCodeStyling | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (qrRef.current) {
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
          imageSize: 0.4
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
        }
      })

      const container = qrRef.current
      container.style.width = '100%'
      container.style.height = '100%'
      
      qrCode.current.append(container)
    }

    return () => {
      if (qrRef.current) qrRef.current.innerHTML = ''
    }
  }, [options])

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
          placeholder="Masukkan data atau URL disini..."
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
      {/* Customization Grid */}
      <div className="space-y-6">
        {/* Baris 1: Warna */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Warna Latar</label>
            <input
              type="color"
              value={options.bgColor}
              onChange={(e) => setOptions({...options, bgColor: e.target.value})}
              className="color-input"
            />
          </div>
          <div className="input-group">
            <label className="label">Warna QR</label>
            <input
              type="color"
              value={options.qrColor}
              onChange={(e) => setOptions({...options, qrColor: e.target.value})}
              className="color-input"
            />
          </div>
        </div>

        {/* Baris 2: Bentuk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Bentuk Titik</label>
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
            <label className="label">Bentuk Sudut</label>
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
            <label className="label">Format Gambar</label>
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
            <label className="label">Ukuran Download (px)</label>
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